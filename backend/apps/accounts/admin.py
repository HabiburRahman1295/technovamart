from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Address


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('avatar_preview', 'email', 'username', 'phone', 'order_count', 'is_active', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'username', 'phone')
    ordering = ('-date_joined',)
    list_per_page = 25

    fieldsets = UserAdmin.fieldsets + (
        ('📱 Extra Info', {'fields': ('phone', 'avatar')}),
    )

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" height="35" width="35" style="border-radius:50%;object-fit:cover"/>', obj.avatar.url)
        initials = (obj.username or obj.email or 'U')[0].upper()
        return format_html(
            '<div style="width:35px;height:35px;border-radius:50%;background:#e63329;color:white;'
            'display:flex;align-items:center;justify-content:center;font-weight:bold">{}</div>',
            initials
        )
    avatar_preview.short_description = ""

    def order_count(self, obj):
        count = obj.orders.count()
        if count > 0:
            return format_html('<span style="background:#e8f4fd;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:bold">{} orders</span>', count)
        return format_html('<span style="color:#aaa">0 orders</span>')
    order_count.short_description = "Orders"


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'phone', 'city', 'area', 'is_default')
    list_filter = ('city', 'is_default')
    search_fields = ('user__email', 'name', 'phone', 'city')
