from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardSavedViewViewSet,
    ApplicationAnalyticsView,
    DashboardStatsView,
    SalesStatsView,
    ProductStatsView,
    UserStatsView,
    ApplicationStatsView,
    PaymentStatsView
)

app_name = 'dashboard'

router = DefaultRouter()
router.register(r'saved-views', DashboardSavedViewViewSet, basename='saved-view')

urlpatterns = [
    path('', include(router.urls)),
    
    # Vistas de analytics
    path('analytics/applications/', ApplicationAnalyticsView.as_view(), name='application-analytics'),
    
    # Nuevas vistas de estadísticas para el dashboard administrativo
    path('stats/overview/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('stats/sales/', SalesStatsView.as_view(), name='sales-stats'),
    path('stats/products/', ProductStatsView.as_view(), name='product-stats'),
    path('stats/users/', UserStatsView.as_view(), name='user-stats'),
    path('stats/applications/', ApplicationStatsView.as_view(), name='application-stats'),
    path('stats/payments/', PaymentStatsView.as_view(), name='payment-stats'),
] 