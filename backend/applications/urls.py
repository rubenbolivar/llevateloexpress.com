from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserApplicationViewSet,
    ApplicationDocumentViewSet,
    AdminApplicationViewSet,
    ApplicationStatusListView
)

app_name = 'applications'

# Router para viewsets de usuario
user_router = DefaultRouter()
user_router.register(r'my', UserApplicationViewSet, basename='user-application')

# Router para viewsets de admin
admin_router = DefaultRouter()
admin_router.register(r'', AdminApplicationViewSet, basename='admin-application')

# URLs
urlpatterns = [
    # API de solicitudes para usuarios
    path('', include(user_router.urls)),
    
    # API de documentos (anidada en solicitudes)
    path(
        'my/<int:application_pk>/documents/',
        ApplicationDocumentViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='application-documents'
    ),
    path(
        'my/<int:application_pk>/documents/<int:pk>/',
        ApplicationDocumentViewSet.as_view({
            'get': 'retrieve',
            'delete': 'destroy'
        }),
        name='application-document-detail'
    ),
    
    # API de historial de estados
    path(
        'my/<int:application_pk>/history/',
        ApplicationStatusListView.as_view(),
        name='application-status-history'
    ),
    
    # API de admin
    path('admin/', include(admin_router.urls)),
] 