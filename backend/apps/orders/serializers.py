import base64
from rest_framework import serializers
from django.db.models.fields.files import FieldFile, ImageFieldFile

from .models import Order, OrderItem
from apps.catalog.models import Product


def _safe_value(val):
    if val is None:
        return None
    if isinstance(val, (bytes, bytearray)):
        return base64.b64encode(val).decode("ascii")
    if isinstance(val, (FieldFile, ImageFieldFile)):
        try:
            if hasattr(val, "url"):
                return val.url
        except Exception:
            pass
        return getattr(val, "name", str(val))
    return str(val)


class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()
    product_slug = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'product',
            'product_name',
            'product_slug',
            'product_image',
            'price',
            'quantity',
            'total_price',
        )

    def get_product_slug(self, obj):
        return getattr(obj.product, 'slug', None) if obj.product else None

    def get_product_image(self, obj):
        if not obj.product:
            return None

        request = self.context.get("request")

        for f in ('primary_image', 'image', 'thumbnail', 'image_url'):
            if hasattr(obj.product, f):
                val = getattr(obj.product, f)
                if val:
                    safe = _safe_value(val)
                    if request and isinstance(safe, str) and safe.startswith("/"):
                        try:
                            return request.build_absolute_uri(safe)
                        except Exception:
                            return safe
                    return safe

        if hasattr(obj.product, 'images'):
            first = obj.product.images.first()
            if first:
                for f in ('image_url', 'image', 'file'):
                    if hasattr(first, f):
                        val = getattr(first, f)
                        if val:
                            safe = _safe_value(val)
                            if request and isinstance(safe, str) and safe.startswith("/"):
                                try:
                                    return request.build_absolute_uri(safe)
                                except Exception:
                                    return safe
                            return safe

        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'customer_name',
            'customer_phone',
            'address_line',
            'area',
            'thana',
            'city',
            'district',
            'subtotal',
            'shipping',
            'total',
            'status',
            'status_label',
            'notes',
            'items',
            'created_at',
        )
        read_only_fields = ('subtotal', 'shipping', 'total', 'status', 'status_label', 'created_at')


class CartItemInput(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_phone = serializers.CharField(max_length=20)
    address_line = serializers.CharField()
    area = serializers.CharField(required=False, allow_blank=True)
    thana = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100)
    district = serializers.CharField(required=False, allow_blank=True)
    items = CartItemInput(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        return value

    def validate(self, attrs):
        items = attrs['items']
        product_ids = [item['product_id'] for item in items]
        products = {p.id: p for p in Product.objects.filter(id__in=product_ids, is_active=True)}

        for item in items:
            pid = item['product_id']
            if pid not in products:
                raise serializers.ValidationError(f"Product {pid} not found.")
            product = products[pid]
            if product.stock < item['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.name}'. Available: {product.stock}"
                )

        attrs['products'] = products
        return attrs


class OrderPreviewSerializer(OrderCreateSerializer):
    pass