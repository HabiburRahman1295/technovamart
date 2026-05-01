from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, Banner


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent', 'icon', 'image', 'children', 'product_count')

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug', 'logo', 'product_count')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    # ✅ always return relative URL like /media/...
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_primary', 'order')

    def get_image_url(self, obj):
        if obj.image_url:
            return obj.image_url.url
        return None


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'price', 'discount_price', 'effective_price',
            'discount_percent', 'stock', 'in_stock', 'brand_name', 'category_name',
            'primary_image', 'is_featured'
        )

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image_url:
            # ✅ return /media/... (no localhost)
            return img.image_url.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'discount_price', 'effective_price', 'discount_percent',
            'stock', 'in_stock', 'brand', 'category', 'images',
            'specifications', 'is_featured', 'created_at'
        )


class BannerSerializer(serializers.ModelSerializer):
    # ✅ always return relative URL like /media/...
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ('id', 'title', 'image_url', 'link_url', 'position', 'order')

    def get_image_url(self, obj):
        if obj.image_url:
            return obj.image_url.url
        return None
