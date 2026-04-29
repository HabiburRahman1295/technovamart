from django.urls import path
from .views import CategoryListView, BrandListView, ProductListView, ProductDetailView, BannerListView

urlpatterns = [
    path('categories', CategoryListView.as_view(), name='categories'),
    path('brands', BrandListView.as_view(), name='brands'),
    path('products', ProductListView.as_view(), name='products'),
    path('products/<slug:slug>', ProductDetailView.as_view(), name='product-detail'),
    path('banners', BannerListView.as_view(), name='banners'),
]
