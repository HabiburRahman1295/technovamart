import base64
from decimal import Decimal
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderPreviewSerializer
from apps.catalog.models import Product


def get_shipping_cost(city: str) -> Decimal:
    city_lower = city.strip().lower() if city else ''
    if city_lower and 'dhaka' in city_lower:
        return Decimal('80.00')
    return Decimal('120.00')


class OrderPreviewView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = OrderPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        products = data['products']
        items = data['items']
        shipping = get_shipping_cost(data.get('city', ''))

        subtotal = sum(
            products[item['product_id']].effective_price * item['quantity']
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
    permission_classes = (AllowAny,)

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        items = data['items']

        product_ids = [i['product_id'] for i in items]
        locked_products = {
            p.id: p
            for p in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)
        }

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
            locked_products[item['product_id']].effective_price * item['quantity']
            for item in items
        )

        order = Order.objects.create(
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            address_line=data['address_line'],
            area=data.get('area', ''),
            thana=data.get('thana', ''),
            city=data['city'],
            district=data.get('district', ''),
            subtotal=subtotal,
            notes=data.get('notes', ''),
            status='pending',
        )

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

        order.refresh_from_db()

        def convert_bytes(obj):
            if isinstance(obj, (bytes, bytearray)):
                return base64.b64encode(obj).decode("ascii")
            if isinstance(obj, dict):
                return {k: convert_bytes(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [convert_bytes(v) for v in obj]
            return obj

        return Response(convert_bytes(OrderSerializer(order).data), status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Order.objects.all().prefetch_related('items')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (AllowAny,)
    queryset = Order.objects.all().prefetch_related('items')