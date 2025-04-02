from django.shortcuts import render
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination

from .models import PointsConfig, PointTransaction, UserPointsSummary
from .serializers import (
    PointsConfigSerializer, UserPointsSummarySerializer,
    PointTransactionSerializer, ManualPointsAdjustmentSerializer,
    EducationalCoursePointsSerializer,
    PointsStatusSerializer
)
from .services import PointsCalculator, get_user_points_summary, calculate_user_points, get_waiting_days_for_user, add_educational_course_points, add_manual_adjustment, get_user_waiting_days

User = get_user_model()

class PointsConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing points system configuration"""
    queryset = PointsConfig.objects.all()
    serializer_class = PointsConfigSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        """Always return the current configuration"""
        config = PointsConfig.objects.first()
        if not config:
            config = PointsConfig.objects.create()
        return config
    
    @action(detail=False, methods=['get'], url_path='current')
    def current_configuration(self, request):
        """Get the current configuration"""
        config = self.get_object()
        serializer = self.get_serializer(config)
        return Response(serializer.data)

class UserPointsSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing client points"""
    serializer_class = UserPointsSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['current_points', 'created_at', 'updated_at']
    
    def get_queryset(self):
        """Get points profiles based on user role"""
        if self.request.user.is_staff:
            # Admins can see all points profiles
            return UserPointsSummary.objects.all()
        else:
            # Regular users can only see their own points
            return UserPointsSummary.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='my-points')
    def my_points(self, request):
        """Get the current user's points profile"""
        # Try to get the user's points profile
        try:
            points_profile = UserPointsSummary.objects.get(user=request.user)
        except UserPointsSummary.DoesNotExist:
            # Create a new points profile if it doesn't exist
            points_profile = PointsCalculator.create_initial_points(request.user)
        
        serializer = self.get_serializer(points_profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def adjust_points(self, request, pk=None):
        """Adjust points for a user (admin only)"""
        user = self.get_object()
        serializer = ManualPointsAdjustmentSerializer(data=request.data)
        
        if serializer.is_valid():
            points = serializer.validated_data['points']
            reason = serializer.validated_data.get('reason', '')
            
            # Add or subtract points
            add_manual_adjustment(
                user=user,
                points=points,
                reason=reason,
                created_by=request.user
            )
            
            return Response({'status': 'points adjusted'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PointsTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing points transactions"""
    serializer_class = PointTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get transactions based on user role and request parameters"""
        if self.request.user.is_staff:
            # Admins can see all transactions or filter by user
            user_id = self.request.query_params.get('user_id')
            if user_id:
                try:
                    points_profile = UserPointsSummary.objects.get(user_id=user_id)
                    return PointTransaction.objects.filter(user=points_profile.user)
                except UserPointsSummary.DoesNotExist:
                    return PointTransaction.objects.none()
            return PointTransaction.objects.all()
        else:
            # Regular users can only see their own transactions
            try:
                points_profile = UserPointsSummary.objects.get(user=self.request.user)
                return PointTransaction.objects.filter(user=points_profile.user)
            except UserPointsSummary.DoesNotExist:
                return PointTransaction.objects.none()

class EducationalCourseCompletionView(generics.GenericAPIView):
    """View for completing educational courses to earn points"""
    permission_classes = [IsAuthenticated]
    serializer_class = EducationalCoursePointsSerializer
    
    def post(self, request):
        """Award points for educational course completion"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = serializer.validated_data['user_id']
        user = get_object_or_404(User, id=user_id)
        
        # Add educational points
        transaction = PointsCalculator.add_educational_points(user)
        
        # Return the transaction
        response_serializer = PointTransactionSerializer(transaction)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class UserPointsView(APIView):
    """View for getting a user's current points status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get points status for the current user"""
        user = request.user
        points_info = get_waiting_days_for_user(user)
        
        serializer = PointsStatusSerializer(points_info)
        return Response(serializer.data)


class UserPointsTransactionsView(ListAPIView):
    """
    Lista todas las transacciones de puntos del usuario autenticado
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PointTransactionSerializer
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        return PointTransaction.objects.filter(user=self.request.user).order_by('-created_at')


class AdminPointsConfigView(viewsets.ModelViewSet):
    """ViewSet for managing points system configuration"""
    serializer_class = PointsConfigSerializer
    permission_classes = [IsAdminUser]
    queryset = PointsConfig.objects.all()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active configuration"""
        config = PointsConfig.get_active_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        """Set this configuration as active"""
        # Get the current config
        config = self.get_object()
        
        # Deactivate all other configs
        PointsConfig.objects.exclude(pk=config.pk).update(is_active=False)
        
        # Activate this one
        config.is_active = True
        config.save()
        
        return Response({'status': 'success', 'message': 'Configuration set as active'})


class AdminUserPointsView(viewsets.ViewSet):
    """ViewSet for admin management of user points"""
    permission_classes = [IsAdminUser]
    
    def list(self, request):
        """List all users with their points summary"""
        summaries = UserPointsSummary.objects.all()
        serializer = UserPointsSummarySerializer(summaries, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get points info for a specific user"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(pk=pk)
            points_info = get_waiting_days_for_user(user)
            serializer = PointsStatusSerializer(points_info)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for a specific user"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(pk=pk)
            transactions = PointTransaction.objects.filter(user=user)
            serializer = PointTransactionSerializer(transactions, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def add_points(self, request, pk=None):
        """Add/subtract points for a user manually"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(pk=pk)
            
            # Validate input
            points = request.data.get('points')
            reason = request.data.get('reason', '')
            
            if points is None:
                return Response(
                    {'error': 'Points must be provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                points = int(points)
            except ValueError:
                return Response(
                    {'error': 'Points must be an integer'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add the points
            transaction = add_manual_adjustment(
                user=user,
                points=points,
                reason=reason,
                created_by=request.user
            )
            
            serializer = PointTransactionSerializer(transaction)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def educational_course(self, request, pk=None):
        """Add points for completing an educational course"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(pk=pk)
            course_name = request.data.get('course_name', '')
            
            transaction = add_educational_course_points(
                user=user,
                course_name=course_name,
                created_by=request.user
            )
            
            serializer = PointTransactionSerializer(transaction)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalculate points for a user from all transactions"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(pk=pk)
            total_points = calculate_user_points(user)
            
            return Response({
                'status': 'success',
                'message': 'Points recalculated',
                'total_points': total_points
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PointsStatisticsView(APIView):
    """View for getting statistics about the points system"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get statistics about points"""
        # Total users with points
        total_users = UserPointsSummary.objects.count()
        
        # Average points
        avg_points = UserPointsSummary.objects.aggregate(
            avg_points=Sum('current_points') / Count('id')
        )['avg_points'] or 0
        
        # Points distribution
        config = PointsConfig.get_active_config()
        excellent_users = UserPointsSummary.objects.filter(
            current_points__gte=config.excellent_threshold
        ).count()
        
        good_users = UserPointsSummary.objects.filter(
            current_points__gte=config.good_threshold,
            current_points__lt=config.excellent_threshold
        ).count()
        
        average_users = UserPointsSummary.objects.filter(
            current_points__gte=config.average_threshold,
            current_points__lt=config.good_threshold
        ).count()
        
        poor_users = UserPointsSummary.objects.filter(
            current_points__gte=config.poor_threshold,
            current_points__lt=config.average_threshold
        ).count()
        
        bad_users = UserPointsSummary.objects.filter(
            current_points__lt=config.poor_threshold
        ).count()
        
        # Recent transactions
        recent_transactions = PointTransaction.objects.all()[:10]
        recent_transactions_serializer = PointTransactionSerializer(recent_transactions, many=True)
        
        return Response({
            'total_users': total_users,
            'average_points': round(avg_points, 2),
            'distribution': {
                'excellent': excellent_users,
                'good': good_users,
                'average': average_users,
                'poor': poor_users,
                'bad': bad_users
            },
            'recent_transactions': recent_transactions_serializer.data
        })

class UserPointsBalanceView(APIView):
    """
    Obtiene el balance actual de puntos del usuario autenticado
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        summary, created = UserPointsSummary.objects.get_or_create(
            user=request.user,
            defaults={
                'current_points': PointsConfig.get_active_config().initial_points,
                'lifetime_points': PointsConfig.get_active_config().initial_points
            }
        )
        serializer = UserPointsSummarySerializer(summary)
        return Response(serializer.data)

class UserWaitingDaysView(APIView):
    """
    Obtiene la información sobre días de espera según la puntuación actual
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        waiting_days, status_label = get_user_waiting_days(request.user)
        config = PointsConfig.get_active_config()
        
        summary, created = UserPointsSummary.objects.get_or_create(
            user=request.user,
            defaults={
                'current_points': config.initial_points,
                'lifetime_points': config.initial_points
            }
        )
        
        data = {
            'current_points': summary.current_points,
            'waiting_days': waiting_days,
            'status': status_label,
            'thresholds': {
                'excellent': config.excellent_threshold,
                'good': config.good_threshold,
                'average': config.average_threshold,
                'poor': config.poor_threshold
            },
            'waiting_days_by_threshold': {
                'excellent': config.excellent_waiting_days,
                'good': config.good_waiting_days,
                'average': config.average_waiting_days,
                'poor': config.poor_waiting_days,
                'bad': config.bad_waiting_days
            }
        }
        
        return Response(data)

class PointTransactionListView(generics.ListAPIView):
    """API endpoint for listing point transactions"""
    serializer_class = PointTransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
