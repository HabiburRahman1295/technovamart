from django.contrib import admin
from django.utils.html import format_html
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_link', 'provider_badge', 'amount_display', 'status_badge', 'transaction_id', 'created_at')
    list_filter = ('provider', 'status', 'created_at')
    search_fields = ('transaction_id', 'order__id', 'order__user__email')
    readonly_fields = ('raw_response', 'created_at', 'updated_at', 'order', 'provider', 'amount')
    list_per_page = 25
    date_hierarchy = 'created_at'

    PROVIDER_COLORS = {
        'bkash': '#e2136e',
        'nagad': '#f15a22',
        'card': '#1a56db',
        'cod': '#059669',
    }

    STATUS_COLORS = {
        'completed': '#10b981',
        'failed': '#ef4444',
        'pending': '#f59e0b',
        'initiated': '#3b82f6',
        'cancelled': '#6b7280',
        'refunded': '#8b5cf6',
    }

    def order_link(self, obj):
        return format_html('<a href="/admin/orders/order/{}/change/"><strong>order#{}</strong></a>', obj.order.id, obj.order.id)
    order_link.short_description = "Order"

    def provider_badge(self, obj):
        color = self.PROVIDER_COLORS.get(obj.provider, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold">{}</span>',
            color, obj.provider.upper()
        )
    provider_badge.short_description = "Payment Method"

    def amount_display(self, obj):
        return format_html('<strong style="color:#e63329">৳{}</strong>', obj.amount)
    amount_display.short_description = "Amount"

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        labels = {
            'completed': '✅ Completed', 'failed': '❌ Failed',
            'pending': '⏳ Pending', 'initiated': '🔄 Initiated',
            'cancelled': '🚫 Cancelled', 'refunded': '↩️ Refunded',
        }
        return format_html(
            '<span style="color:{};font-weight:bold">{}</span>',
            color, labels.get(obj.status, obj.status)
        )
    status_badge.short_description = "Status"
