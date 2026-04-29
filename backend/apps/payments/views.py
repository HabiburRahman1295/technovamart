from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.shortcuts import redirect
from django.conf import settings

from .models import Payment
from apps.orders.models import Order
from .gateways.bkash import BkashGateway


class PaymentInitView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        order_id = request.data.get('order_id')
        provider = request.data.get('provider')

        if provider not in ['bkash', 'nagad', 'card', 'cod']:
            return Response({'error': 'Invalid payment provider.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id, user=request.user, status='pending')
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(order, 'payment'):
            return Response({'error': 'Payment already initiated.'}, status=status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.create(
            order=order,
            provider=provider,
            amount=order.total,
            status='initiated',
        )

        if provider == 'bkash':
            return self._init_bkash(request, order, payment)
        elif provider == 'nagad':
            return self._init_nagad(request, order, payment)
        elif provider == 'cod':
            payment.status = 'pending'
            payment.save()
            order.status = 'pending'
            order.save()
            return Response({'message': 'Cash on delivery order confirmed.', 'order_id': order.id})
        else:
            return Response({'redirect_url': f'{settings.FRONTEND_URL}/payment/card?order={order.id}'})

    def _init_bkash(self, request, order, payment):
        try:
            gw = BkashGateway()
            callback_url = request.build_absolute_uri(f'/api/payments/callback/bkash?order_id={order.id}')
            result = gw.create_payment(order, callback_url)

            if result.get('statusCode') == '0000':
                payment.gateway_ref = result.get('paymentID', '')
                payment.raw_response = result
                payment.save()
                return Response({
                    'payment_id': payment.id,
                    'bkash_payment_id': result.get('paymentID'),
                    'bkash_url': result.get('bkashURL'),
                })
            else:
                payment.status = 'failed'
                payment.save()
                return Response({'error': result.get('statusMessage', 'bKash error')}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _init_nagad(self, request, order, payment):
        # Nagad integration placeholder
        return Response({
            'message': 'Nagad payment initiated.',
            'redirect_url': f'{settings.FRONTEND_URL}/payment/nagad?order={order.id}',
        })


class BkashCallbackView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        order_id = request.query_params.get('order_id')
        bkash_payment_id = request.query_params.get('paymentID')
        status_param = request.query_params.get('status')

        try:
            order = Order.objects.get(id=order_id)
            payment = order.payment
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return redirect(f'{settings.FRONTEND_URL}/payment/failed')

        if status_param == 'success' and bkash_payment_id:
            try:
                gw = BkashGateway()
                result = gw.execute_payment(bkash_payment_id)
                if result.get('statusCode') == '0000':
                    payment.status = 'completed'
                    payment.transaction_id = result.get('trxID', '')
                    payment.raw_response = result
                    payment.save()
                    order.status = 'confirmed'
                    order.save()
                    return redirect(f'{settings.FRONTEND_URL}/payment/success?order={order.id}')
            except Exception:
                pass

        payment.status = 'failed'
        payment.save()
        return redirect(f'{settings.FRONTEND_URL}/payment/failed?order={order_id}')


class NagadCallbackView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        # Nagad callback handler placeholder
        return Response({'message': 'Nagad callback received.'})


class CardCallbackView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        # Card payment callback placeholder
        return Response({'message': 'Card callback received.'})
