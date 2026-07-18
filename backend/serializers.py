# pyrefly: ignore [missing-import]
from rest_framework import serializers
# pyrefly: ignore [missing-import]
from django.db import transaction

from .models import Category, Product, ProductImage, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image"]


class ProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "mrp",
            "stock",
            "categories",
            "sizes",
            "image",
            "images",
            "available_for_delivery",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "price", "size"]
        read_only_fields = ["id", "price"]


class OrderItemWriteSerializer(serializers.Serializer):
    """Used only for accepting incoming cart items when an order is created."""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    size = serializers.CharField(max_length=100)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "pincode",
            "total_amount",
            "payment_status",
            "payment_method",
            "razorpay_order_id",
            "razorpay_payment_id",
            "items",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "total_amount",
            "payment_status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "created_at",
        ]


class CreateOrderSerializer(serializers.ModelSerializer):
    """
    Accepts customer/shipping details plus a list of cart items and
    creates the Order + OrderItems together, computing total_amount
    server-side (never trust a client-supplied total).
    """
    items = OrderItemWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "pincode",
            "payment_method",
            "items",
        ]
        read_only_fields = ["id"]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        order = Order.objects.create(total_amount=0, **validated_data)

        total = 0
        order_items = []
        for item in items_data:
            product = item["product"]
            quantity = item["quantity"]

            if product.stock < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.name}'. Available: {product.stock}"
                )

            line_price = product.price
            total += line_price * quantity
            order_items.append(
                OrderItem(order=order, product=product, quantity=quantity, price=line_price, size=item.get("size", "Free Size"))
            )

            product.stock -= quantity
            product.save(update_fields=["stock"])

        OrderItem.objects.bulk_create(order_items)

        order.total_amount = total
        order.save(update_fields=["total_amount"])
        return order
