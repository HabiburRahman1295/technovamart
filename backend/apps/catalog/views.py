from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from rest_framework.permissions import AllowAny
from .models import Category, Brand, Product, Banner
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer, BannerSerializer
)


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category__slug')
    brand = django_filters.CharFilter(field_name='brand__slug')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'min_price', 'max_price', 'is_featured']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True, parent=None).prefetch_related('children')
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)


class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = (AllowAny,)


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('brand', 'category').prefetch_related('images')
    serializer_class = ProductListSerializer
    permission_classes = (AllowAny,)
    filterset_class = ProductFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand__name', 'category__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('brand', 'category').prefetch_related('images')
    serializer_class = ProductDetailSerializer
    permission_classes = (AllowAny,)
    lookup_field = 'slug'


class BannerListView(generics.ListAPIView):
    queryset = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        position = self.request.query_params.get('position')
        qs = super().get_queryset()
        if position:
            qs = qs.filter(position=position)
        return qs
