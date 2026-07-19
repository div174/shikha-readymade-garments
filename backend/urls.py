# pyrefly: ignore [missing-import]
from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ProductViewSet, CreateOrderView, VerifyPaymentView, CSRFTokenView

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"products", ProductViewSet, basename="product")

urlpatterns = [
    path("", include(router.urls)),
    path("csrf/", CSRFTokenView.as_view(), name="csrf-token"),
    path("orders/create/", CreateOrderView.as_view(), name="create-order"),
    path("orders/verify-payment/", VerifyPaymentView.as_view(), name="verify-payment"),
]
