from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'price', 'quantity', 'total_price')
    fields = ('product', 'product_name', 'price', 'quantity', 'total_price')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]

    list_display = (
        'order_id',
        'customer_info',
        'items_count',
        'total_display',
        'status',
        'status_badge',
        'payment_status',
        'created_at',
    )

    list_filter = ('status', 'created_at')
    search_fields = ('id', 'customer_name', 'customer_phone')
    list_editable = ('status',)
    readonly_fields = ('subtotal', 'total', 'created_at', 'updated_at')
    list_per_page = 25
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('📋 Order Info', {
            'fields': ('status', 'notes', 'created_at', 'updated_at')
        }),
        ('📍 Delivery Address', {
            'fields': ('customer_name', 'customer_phone', 'address_line', 'area', 'thana', 'city', 'district'),
        }),
        ('💰 Payment Summary', {
            'fields': ('subtotal', 'shipping', 'total'),
        }),
    )

    def order_id(self, obj):
        return format_html('<strong>#{}  </strong>', obj.id)
    order_id.short_description = "Order ID"

    def customer_info(self, obj):
        return format_html(
            '<strong>{}</strong><br/><span style="color:#888;font-size:12px">{}</span>',
            obj.customer_name,
            obj.customer_phone,
        )
    customer_info.short_description = "Customer"

    def items_count(self, obj):
        count = obj.items.count()
        return format_html(
            '<span style="background:#e8f4fd;padding:2px 8px;border-radius:12px;font-size:12px">{} item(s)</span>',
            count
        )
    items_count.short_description = "Items"

    def total_display(self, obj):
        return format_html('<strong style="color:#e63329">৳{}</strong>', obj.total)
    total_display.short_description = "Total"

    STATUS_COLORS = {
        'pending': '#f59e0b',
        'confirmed': '#3b82f6',
        'processing': '#8b5cf6',
        'shipped': '#06b6d4',
        'delivered': '#10b981',
        'cancelled': '#ef4444',
        'refunded': '#6b7280',
    }
    STATUS_LABELS = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        label = self.STATUS_LABELS.get(obj.status, obj.status)
        return format_html(
            '<span style="background:{};color:white;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold">{}</span>',
            color, label
        )
    status_badge.short_description = "Status (Badge)"

    def payment_status(self, obj):
        try:
            payment = obj.payment
            colors = {'completed': '#10b981', 'failed': '#ef4444', 'pending': '#f59e0b', 'initiated': '#3b82f6'}
            labels = {'completed': '✅ Paid', 'failed': '❌ Failed', 'pending': '⏳ Pending', 'initiated': '🔄 Initiated'}
            return format_html(
                '<span style="color:{};font-weight:bold">{}</span><br/>'
                '<span style="font-size:11px;color:#888">{}</span>',
                colors.get(payment.status, '#888'),
                labels.get(payment.status, payment.status),
                payment.provider.upper()
            )
        except Exception:
            return format_html('<span style="color:#aaa">No payment</span>')
    payment_status.short_description = "Payment"