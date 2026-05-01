from decimal import Decimal
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderPreviewSerializer
from apps.accounts.models import Address
from apps.catalog.models import Product


def get_shipping_cost(address: Address) -> Decimal:
    """
    ✅ Shipping rule:
    - Dhaka => 80
    - Outside Dhaka => 120
    Fallback: if no address => 120
    """
    if not address:
        return Decimal('120.00')

    city_val = ''
    if hasattr(address, 'city') and address.city:
        city_val = str(address.city)
    elif hasattr(address, 'district') and address.district:
        city_val = str(address.district)
    elif hasattr(address, 'area') and address.area:
        city_val = str(address.area)

    city_lower = city_val.strip().lower()
    if city_lower and 'dhaka' in city_lower:
        return Decimal('80.00')
    return Decimal('120.00')


class OrderPreviewView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = OrderPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        products = data['products']
        items = data['items']

        try:
            address = Address.objects.get(id=data['address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)

        shipping = get_shipping_cost(address)

        subtotal = sum(
            (products[item['product_id']].effective_price * item['quantity'])
            for item in items
        )
        total = subtotal + shipping

        preview_items = []
        for item in items:
            p = products[item['product_id']]
            preview_items.append({
                'product_id': p.id,
                'product_name': p.name,
                'price': float(p.effective_price),
                'quantity': item['quantity'],
                'total_price': float(p.effective_price * item['quantity']),
            })

        return Response({
            'items': preview_items,
            'subtotal': float(subtotal),
            'shipping': float(shipping),
            'total': float(total),
        })


class OrderCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        items = data['items']

        # address
        try:
            address = Address.objects.get(id=data['address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)

        # lock products to avoid race conditions in stock update
        product_ids = [i['product_id'] for i in items]
        locked_products = {
            p.id: p
            for p in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)
        }

        # stock check again under lock
        for item in items:
            pid = item['product_id']
            if pid not in locked_products:
                return Response({'error': f'Product {pid} not found.'}, status=status.HTTP_400_BAD_REQUEST)
            p = locked_products[pid]
            if p.stock < item['quantity']:
                return Response(
                    {'error': f"Insufficient stock for '{p.name}'. Available: {p.stock}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        subtotal = sum(
            (locked_products[item['product_id']].effective_price * item['quantity'])
            for item in items
        )

        order = Order.objects.create(
            user=request.user,
            address=address,
            subtotal=subtotal,
            notes=data.get('notes', ''),
            status='pending',
        )

        # create items + reduce stock
        for item in items:
            product = locked_products[item['product_id']]
            qty = item['quantity']

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price=product.effective_price,
                quantity=qty,
            )

            product.stock -= qty
            product.save(update_fields=['stock'])

        # refresh to ensure totals computed
        order.refresh_from_db()

        # ✅ FIX: prevent UnicodeDecodeError by converting any bytes in serializer output
        import base64

        def find_bytes(obj, path="root"):
            if isinstance(obj, (bytes, bytearray)):
                print("🔥 BYTES FOUND AT:", path, "len=", len(obj))
                return True
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if find_bytes(v, f"{path}.{k}"):
                        return True
            if isinstance(obj, list):
                for i, v in enumerate(obj):
                    if find_bytes(v, f"{path}[{i}]"):
                        return True
            return False

        def convert_bytes(obj):
            if isinstance(obj, (bytes, bytearray)):
                return base64.b64encode(obj).decode("ascii")
            if isinstance(obj, dict):
                return {k: convert_bytes(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [convert_bytes(v) for v in obj]
            return obj

        data_out = OrderSerializer(order).data
        find_bytes(data_out)  # check backend logs to locate the problematic field
        return Response(convert_bytes(data_out), status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related('address')
            .prefetch_related('items')
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related('address')
            .prefetch_related('items')
        )