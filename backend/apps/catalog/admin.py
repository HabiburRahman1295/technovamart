from django.contrib import admin
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import Category, Brand, Product, ProductImage, Banner


class ProductResource(resources.ModelResource):
    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'price', 'discount_price', 'stock',
                  'brand__name', 'category__name', 'is_active', 'is_featured')


class CategoryResource(resources.ModelResource):
    class Meta:
        model = Category


class BrandResource(resources.ModelResource):
    class Meta:
        model = Brand


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_preview', 'image_url', 'is_primary', 'order')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" height="60" style="border-radius:4px;"/>', obj.image_url.url)
        return "—"
    image_preview.short_description = "Preview"


@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    resource_class = CategoryResource
    list_display = ('name', 'parent', 'product_count', 'is_active')
    list_filter = ('is_active', 'parent')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active',)

    def product_count(self, obj):
        count = obj.products.filter(is_active=True).count()
        return format_html('<span style="font-weight:bold;color:#e63329">{}</span>', count)
    product_count.short_description = "পণ্য সংখ্যা"


@admin.register(Brand)
class BrandAdmin(ImportExportModelAdmin):
    resource_class = BrandResource
    list_display = ('logo_preview', 'name', 'product_count', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active',)

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" height="40" style="border-radius:4px;"/>', obj.logo.url)
        return "—"
    logo_preview.short_description = "Logo"

    def product_count(self, obj):
        return obj.products.filter(is_active=True).count()
    product_count.short_description = "পণ্য সংখ্যা"


@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin):
    resource_class = ProductResource
    inlines = [ProductImageInline]
    list_display = (
        'primary_image_preview', 'name', 'brand', 'category',
        'price_display', 'stock_display', 'is_active', 'is_featured', 'created_at'
    )
    list_filter = ('brand', 'category', 'is_active', 'is_featured', 'created_at')
    search_fields = ('name', 'description', 'brand__name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'is_featured')
    list_per_page = 25
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'discount_percent_display')

    fieldsets = (
        ('📦 Basic Info', {
            'fields': ('name', 'slug', 'brand', 'category', 'short_description', 'description')
        }),
        ('💰 Pricing & Stock', {
            'fields': ('price', 'discount_price', 'discount_percent_display', 'stock'),
        }),
        ('⚙️ Settings', {
            'fields': ('is_active', 'is_featured', 'specifications'),
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def primary_image_preview(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            return format_html('<img src="{}" height="50" width="50" style="object-fit:contain;border-radius:6px;border:1px solid #eee"/>', img.image_url.url)
        return format_html('<span style="color:#ccc">No Image</span>')
    primary_image_preview.short_description = "ছবি"

    def price_display(self, obj):
        if obj.discount_price:
            return format_html(
                '<span style="color:#e63329;font-weight:bold">৳{}</span> '
                '<span style="color:#aaa;text-decoration:line-through;font-size:12px">৳{}</span>',
                obj.discount_price, obj.price
            )
        return format_html('<span style="font-weight:bold">৳{}</span>', obj.price)
    price_display.short_description = "দাম"

    def stock_display(self, obj):
        if obj.stock == 0:
            color, label = '#e63329', 'স্টক নেই'
        elif obj.stock <= 5:
            color, label = '#f59e0b', f'{obj.stock} টি'
        else:
            color, label = '#10b981', f'{obj.stock} টি'
        return format_html('<span style="color:{};font-weight:bold">{}</span>', color, label)
    stock_display.short_description = "স্টক"

    def discount_percent_display(self, obj):
        return f"{obj.discount_percent}%"
    discount_percent_display.short_description = "ছাড়ের পরিমাণ"


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('banner_preview', 'title', 'position', 'order', 'is_active')
    list_filter = ('position', 'is_active')
    list_editable = ('is_active', 'order')
    ordering = ('order',)

    def banner_preview(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" height="50" style="border-radius:4px;object-fit:cover;width:100px"/>', obj.image_url.url)
        return "—"
    banner_preview.short_description = "Preview"
