from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from .models import DashboardSavedView
from .serializers import DashboardSavedViewSerializer, DateRangeSerializer
from .services import DashboardAnalytics, get_dashboard_stats, get_sales_stats, get_product_stats, get_user_stats, get_application_stats, get_payment_stats

class DashboardSavedViewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing saved dashboard views"""
    serializer_class = DashboardSavedViewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get saved views for the current user"""
        return DashboardSavedView.objects.filter(user=self.request.user)

class ApplicationAnalyticsView(APIView):
    """
    Vista para obtener análisis detallado de solicitudes.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        serializer = DateRangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        date_from = serializer.validated_data.get('date_from')
        date_to = serializer.validated_data.get('date_to')
        
        statistics = DashboardAnalytics.get_application_statistics(date_from, date_to)
        return Response(statistics)

class DashboardAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for accessing dashboard analytics"""
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['post'])
    def user_statistics(self, request):
        """Get user statistics"""
        serializer = DateRangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        date_from = serializer.validated_data.get('date_from')
        date_to = serializer.validated_data.get('date_to')
        
        statistics = DashboardAnalytics.get_user_statistics(date_from, date_to)
        return Response(statistics)
    
    @action(detail=False, methods=['post'])
    def application_statistics(self, request):
        """Get application statistics"""
        serializer = DateRangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        date_from = serializer.validated_data.get('date_from')
        date_to = serializer.validated_data.get('date_to')
        
        statistics = DashboardAnalytics.get_application_statistics(date_from, date_to)
        return Response(statistics)
    
    @action(detail=False, methods=['post'])
    def payment_statistics(self, request):
        """Get payment statistics"""
        serializer = DateRangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        date_from = serializer.validated_data.get('date_from')
        date_to = serializer.validated_data.get('date_to')
        
        statistics = DashboardAnalytics.get_payment_statistics(date_from, date_to)
        return Response(statistics)
    
    @action(detail=False, methods=['get'])
    def points_statistics(self, request):
        """Get points system statistics"""
        statistics = DashboardAnalytics.get_points_statistics()
        return Response(statistics)
    
    @action(detail=False, methods=['get'])
    def product_statistics(self, request):
        """Get product statistics"""
        statistics = DashboardAnalytics.get_product_statistics()
        return Response(statistics)
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get a summary of key metrics for the dashboard"""
        summary = DashboardAnalytics.get_dashboard_summary()
        return Response(summary)

class DashboardStatsView(APIView):
    """
    Vista para obtener estadísticas generales del dashboard.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = get_dashboard_stats()
        return Response(stats)

class SalesStatsView(APIView):
    """
    Vista para obtener estadísticas de ventas.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        period = request.query_params.get('period', 'month')
        stats = get_sales_stats(period)
        return Response(stats)

class ProductStatsView(APIView):
    """
    Vista para obtener estadísticas de productos.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = get_product_stats()
        return Response(stats)

class UserStatsView(APIView):
    """
    Vista para obtener estadísticas de usuarios.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = get_user_stats()
        return Response(stats)

class ApplicationStatsView(APIView):
    """
    Vista para obtener estadísticas de solicitudes.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = get_application_stats()
        return Response(stats)

class PaymentStatsView(APIView):
    """
    Vista para obtener estadísticas de pagos.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        period = request.query_params.get('period', 'month')
        stats = get_payment_stats(period)
        return Response(stats)
