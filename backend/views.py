import hmac
import hashlib
import logging

import razorpay
# pyrefly: ignore [missing-import]
from django.conf import settings
# pyrefly: ignore [missing-import]
from django.db import transaction
# pyrefly: ignore [missing-import]
from django.core.mail import send_mail
# pyrefly: ignore [missing-import]
from rest_framework import viewsets, status, filters
# pyrefly: ignore [missing-import]
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
import threading
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.permissions import AllowAny

from .models import Category, Product, Order
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, CreateOrderSerializer

logger = logging.getLogger(__name__)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for categories.
    """
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]



class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for the storefront to list/retrieve products.
    Supports ?search=<name> and ?category=<id> filtering.
    """
    queryset = Product.objects.filter(available_for_delivery=True).prefetch_related("categories")
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(categories__id=category_id)
        return qs


class CreateOrderView(APIView):
    """
    POST /api/orders/create/
    Creates an Order + OrderItems from cart data.
    - If payment_method == 'COD', order is created as Pending, no Razorpay call.
    - If payment_method == 'Razorpay', also creates a Razorpay order and
      returns the razorpay_order_id + key for the frontend checkout widget.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            order = serializer.save()

            response_data = OrderSerializer(order).data

            if order.payment_method == "Razorpay":
                try:
                    client = razorpay.Client(
                        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                    )
                    # Razorpay expects amount in paise (integer)
                    amount_in_paise = int(order.total_amount * 100)
                    razorpay_order = client.order.create(
                        {
                            "amount": amount_in_paise,
                            "currency": "INR",
                            "receipt": f"order_rcpt_{order.id}",
                            "payment_capture": 1,
                        }
                    )
                except Exception as exc:
                    logger.exception("Razorpay order creation failed for Order #%s", order.id)
                    return Response(
                        {"error": "Unable to initiate payment. Please try again."},
                        status=status.HTTP_502_BAD_GATEWAY,
                    )

                order.razorpay_order_id = razorpay_order["id"]
                order.save(update_fields=["razorpay_order_id"])

                response_data["razorpay_order_id"] = razorpay_order["id"]
                response_data["razorpay_key_id"] = settings.RAZORPAY_KEY_ID
                response_data["amount"] = amount_in_paise
                response_data["currency"] = "INR"

            try:
                item_details = "\n".join([f"- {item.quantity}x {item.product.name} (Rs.{item.price * item.quantity})" for item in order.items.all()])
                message = f"New order received!\n\nCustomer: {order.customer_name}\nPhone: {order.phone}\nAddress: {order.address}\nPincode: {order.pincode}\nPayment Method: {order.payment_method}\n\nItems:\n{item_details}\n\nTotal: Rs.{order.total_amount}"
                
                def send_order_email():
                    try:
                        send_mail(
                            subject=f"New Order #{order.id} from {order.customer_name}",
                            message=message,
                            from_email=getattr(settings, "EMAIL_HOST_USER", None),
                            recipient_list=[getattr(settings, "ADMIN_NOTIFICATION_EMAIL", "sureshsinghal3717@gmail.com")],
                            fail_silently=False,
                        )
                    except Exception as e:
                        logger.error("Failed to send order email: %s", str(e))
                
                # Run email sending in background thread so it doesn't block API response
                threading.Thread(target=send_order_email).start()
            except Exception as e:
                logger.error("Failed to start email thread: %s", str(e))

        return Response(response_data, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """
    POST /api/orders/verify-payment/
    Body: { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
    Verifies the HMAC SHA256 signature Razorpay returns after checkout,
    and marks the matching Order as Paid only if it's valid.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        order_id = data.get("order_id")
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        required = [order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature]
        if not all(required):
            return Response(
                {"error": "order_id, razorpay_order_id, razorpay_payment_id and razorpay_signature are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(id=order_id, razorpay_order_id=razorpay_order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Recreate the signature Razorpay expects and compare using a
        # constant-time comparison to avoid timing attacks.
        payload = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode(),
            msg=payload.encode(),
            digestmod=hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(generated_signature, razorpay_signature):
            order.payment_status = "Failed"
            order.save(update_fields=["payment_status"])
            return Response(
                {"error": "Payment verification failed. Signature mismatch."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.payment_status = "Paid"
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        order.save(update_fields=["payment_status", "razorpay_payment_id", "razorpay_signature"])

        return Response(
            {"message": "Payment verified successfully.", "order": OrderSerializer(order).data},
            status=status.HTTP_200_OK,
        )
