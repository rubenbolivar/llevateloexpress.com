from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    UserRegistrationView, UserProfileView, CurrentUserView,
    ClientProfileUpdateView, ClientInteractionViewSet,
    UserManagementViewSet
)

router = DefaultRouter()
router.register(r'interactions', ClientInteractionViewSet, basename='interaction')
router.register(r'management', UserManagementViewSet, basename='user-management')

urlpatterns = [
    # Auth views
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('verify-token/', TokenVerifyView.as_view(), name='token-verify'),
    
    # Profile views
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/client/', ClientProfileUpdateView.as_view(), name='update-client-profile'),
    
    # Include router URLs
    path('', include(router.urls)),
] 