"""
URL configuration for llevateloexpress project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from common.views import handler404, handler500, api_root

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1 root
    path('api/v1/', api_root, name='api-root-v1'),
    
    # API v1 endpoints
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair_v1'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_v1'),
    
    # App endpoints con prefijo v1
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/financing/', include('financing.urls')),
    path('api/v1/applications/', include('applications.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/points/', include('points_system.urls')),
    path('api/v1/dashboard/', include('dashboard.urls')),
    path('api/v1/common/', include('common.urls')),
    
    # API root (sin versión)
    path('api/', api_root, name='api-root'),
    
    # Mantener las rutas originales para compatibilidad
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/accounts/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/financing/', include('financing.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/points/', include('points_system.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/common/', include('common.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom error handlers
handler404 = handler404
handler500 = handler500
