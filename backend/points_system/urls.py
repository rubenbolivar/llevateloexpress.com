from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserPointsView,
    UserPointsTransactionsView,
    AdminPointsConfigView,
    AdminUserPointsView,
    PointsStatisticsView,
    UserPointsBalanceView,
    UserWaitingDaysView
)

# Router for viewsets
router = DefaultRouter()
router.register(r'admin/config', AdminPointsConfigView, basename='points-config')

app_name = 'points_system'

urlpatterns = [
    # User endpoints
    path('my/status/', UserPointsView.as_view(), name='user-points-status'),
    path('my/transactions/', UserPointsTransactionsView.as_view(), name='user-points-transactions'),
    
    # Admin endpoints
    path('admin/users/', AdminUserPointsView.as_view({'get': 'list'}), name='admin-users-points'),
    path('admin/users/<int:pk>/', AdminUserPointsView.as_view({'get': 'retrieve'}), name='admin-user-points-detail'),
    path('admin/users/<int:pk>/transactions/', 
         AdminUserPointsView.as_view({'get': 'transactions'}), 
         name='admin-user-points-transactions'),
    path('admin/users/<int:pk>/add-points/', 
         AdminUserPointsView.as_view({'post': 'add_points'}), 
         name='admin-user-add-points'),
    path('admin/users/<int:pk>/educational-course/', 
         AdminUserPointsView.as_view({'post': 'educational_course'}), 
         name='admin-user-educational-course'),
    path('admin/users/<int:pk>/recalculate/', 
         AdminUserPointsView.as_view({'post': 'recalculate'}), 
         name='admin-user-recalculate-points'),
    
    # Statistics
    path('admin/statistics/', PointsStatisticsView.as_view(), name='points-statistics'),
    
    # New endpoints
    path('balance/', UserPointsBalanceView.as_view(), name='points_balance'),
    path('transactions/', UserPointsTransactionsView.as_view(), name='points_transactions'),
    path('delay/', UserWaitingDaysView.as_view(), name='waiting_days'),
    
    # Include router URLs
    path('', include(router.urls)),
] 