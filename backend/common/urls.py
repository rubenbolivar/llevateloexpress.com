from django.urls import path
from .views import HealthCheckView, APIConfigView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('config/', APIConfigView.as_view(), name='api-config'),
] 