from import_export.admin import ImportExportModelAdmin, ImportExportActionModelAdmin
# pyrefly: ignore [missing-import]
from django.contrib import admin

from .models import Category, Product, ProductImage, Order, OrderItem, ProductVariant


@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

@admin.register(Product)
class ProductAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "get_categories", "price", "stock", "available_for_delivery")
    list_filter = ("categories", "available_for_delivery")
    search_fields = ("name",)

    def get_categories(self, obj):
        return ", ".join([c.name for c in obj.categories.all()])
    get_categories.short_description = "Categories"
    inlines = [ProductVariantInline, ProductImageInline]

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "image")

@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin):
    list_display = ("id", "customer_name", "phone", "total_amount", "payment_status", "payment_method", "created_at")
    list_filter = ("payment_status", "payment_method")
    inlines = [OrderItemInline]
    readonly_fields = ("razorpay_order_id", "razorpay_payment_id", "razorpay_signature")
