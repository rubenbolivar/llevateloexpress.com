from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    PaymentMethodViewSet, PaymentScheduleViewSet, 
    PaymentViewSet, UserPaymentsOverviewView
)

router = routers.SimpleRouter()
router.register(r'methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'transactions', PaymentViewSet, basename='payment-transaction')

# Nested routes for payment schedules
applications_router = routers.SimpleRouter()
applications_router.register(r'applications/(?P<application_pk>\d+)/schedules', 
                           PaymentScheduleViewSet, basename='payment-schedule')

urlpatterns = [
    path('overview/', UserPaymentsOverviewView.as_view(), name='payment-overview'),
    path('', include(router.urls)),
    path('', include(applications_router.urls)),
] 