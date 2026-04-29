from django.urls import path
from .views import PaymentInitView, BkashCallbackView, NagadCallbackView, CardCallbackView

urlpatterns = [
    path('init', PaymentInitView.as_view(), name='payment-init'),
    path('callback/bkash', BkashCallbackView.as_view(), name='bkash-callback'),
    path('callback/nagad', NagadCallbackView.as_view(), name='nagad-callback'),
    path('callback/card', CardCallbackView.as_view(), name='card-callback'),
]
