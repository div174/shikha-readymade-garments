# pyrefly: ignore [missing-import]
from django.db import models
# pyrefly: ignore [missing-import]
from django.core.validators import MinValueValidator


class Category(models.Model):
    """Simple category model so Product.category can be a real FK instead of free text."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        app_label = "store"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    mrp = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], null=True, blank=True, help_text="Maximum Retail Price (for strikethrough/discount)")
    stock = models.PositiveIntegerField(default=0)
    categories = models.ManyToManyField(
        Category, related_name="products", blank=True
    )
    sizes = models.CharField(max_length=255, blank=True, default="Free Size", help_text="Comma-separated sizes, e.g., 'S, M, L, XL'")
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    available_for_delivery = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "store"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/gallery/")
    
    class Meta:
        app_label = "store"
        ordering = ["id"]

    def __str__(self):
        return f"Image for {self.product.name}"


class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
    ]
    PAYMENT_METHOD_CHOICES = [
        ("COD", "Cash on Delivery"),
        ("Razorpay", "Razorpay"),
        ("UPI", "UPI"),
    ]

    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    pincode = models.CharField(max_length=10)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="Pending"
    )
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, default="COD"
    )

    # Razorpay tracking fields
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "store"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.payment_status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="order_items", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=100, default="Free Size")
    # Price captured at time of purchase, so later price changes on Product don't rewrite history
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    class Meta:
        app_label = "store"

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order #{self.order_id})"

    @property
    def subtotal(self):
        return self.quantity * self.price
