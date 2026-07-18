# Re-export models so Django discovers them under the "store" app label.
from backend.models import Category, Order, OrderItem, Product, ProductImage  # noqa: F401
