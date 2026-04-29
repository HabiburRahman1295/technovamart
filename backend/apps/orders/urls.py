from django.urls import path
from .views import OrderPreviewView, OrderCreateView, OrderListView, OrderDetailView

urlpatterns = [
    path('preview', OrderPreviewView.as_view(), name='order-preview'),
    path('create', OrderCreateView.as_view(), name='order-create'),
    path('me', OrderListView.as_view(), name='my-orders'),
    path('<int:pk>', OrderDetailView.as_view(), name='order-detail'),
]