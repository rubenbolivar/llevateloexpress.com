from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes

# Create your views here.

class HealthCheckView(APIView):
    """
    View to check API health status
    """
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        """
        Return a simple response indicating the API is up and running
        """
        return Response({
            'status': 'ok',
            'message': 'API is operational',
            'version': getattr(settings, 'API_VERSION', '1.0.0'),
        })

class APIConfigView(APIView):
    """
    View to return configuration values to frontend
    """
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        """
        Return configuration values
        """
        return Response({
            'min_password_length': getattr(settings, 'MIN_PASSWORD_LENGTH', 8),
            'enable_registration': getattr(settings, 'ENABLE_REGISTRATION', True),
            'maintenance_mode': getattr(settings, 'MAINTENANCE_MODE', False),
            'debug_mode': getattr(settings, 'DEBUG', False),
            'default_pagination_size': getattr(settings, 'REST_FRAMEWORK', {}).get('PAGE_SIZE', 10),
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    Vista para la raíz de la API.
    Proporciona información sobre la API y enlaces a los principales endpoints.
    """
    return Response({
        'status': 'online',
        'version': settings.API_VERSION,
        'endpoints': {
            'accounts': request.build_absolute_uri('/api/v1/accounts/'),
            'products': request.build_absolute_uri('/api/v1/products/'),
            'financing': request.build_absolute_uri('/api/v1/financing/'),
            'applications': request.build_absolute_uri('/api/v1/applications/'),
            'payments': request.build_absolute_uri('/api/v1/payments/'),
            'points': request.build_absolute_uri('/api/v1/points/'),
            'dashboard': request.build_absolute_uri('/api/v1/dashboard/'),
            'common': request.build_absolute_uri('/api/v1/common/'),
        },
        'documentation': 'API Documentation coming soon',
    })

def handler404(request, exception=None):
    """Custom 404 handler for API requests"""
    return JsonResponse({
        'status': 'error',
        'message': 'The requested resource was not found',
        'code': 'not_found'
    }, status=404)

def handler500(request):
    """Custom 500 handler for API requests"""
    return JsonResponse({
        'status': 'error',
        'message': 'Internal server error',
        'code': 'server_error'
    }, status=500)
