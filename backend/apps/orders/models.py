from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.catalog.models import Product
from apps.accounts.models import Address


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    
    shipping = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('80.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2)

    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

    def save(self, *args, **kwargs):
        """
        ✅ Shipping rule:
        - Dhaka => 80
        - Outside Dhaka => 120
        Fallback: if address/city missing => 120
        """
        # subtotal safe
        self.subtotal = self.subtotal or Decimal('0.00')

        # --- Dynamic shipping based on address city/district ---
        city_val = ''
        if self.address:
            
            if hasattr(self.address, 'city') and self.address.city:
                city_val = str(self.address.city)
            elif hasattr(self.address, 'district') and self.address.district:
                city_val = str(self.address.district)
            elif hasattr(self.address, 'area') and self.address.area:
                city_val = str(self.address.area)

        city_lower = city_val.strip().lower()

        if city_lower and 'dhaka' in city_lower:
            self.shipping = Decimal('80.00')
        else:
            self.shipping = Decimal('120.00')

        # total calculate
        self.total = (self.subtotal + (self.shipping or Decimal('0.00')))

        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=500)  # snapshot
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    @property
    def total_price(self):
        return self.price * self.quantity