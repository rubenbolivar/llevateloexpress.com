from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, BrandViewSet, ProductViewSet, ProductSearchView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'items', ProductViewSet, basename='product')

urlpatterns = [
    path('search/', ProductSearchView.as_view(), name='product-search'),
    path('', include(router.urls)),
] 