from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.db.models import Q

from applications.models import CreditApplication
from .models import Payment, PaymentMethod, PaymentSchedule
from .serializers import (
    PaymentSerializer, PaymentMethodSerializer, 
    PaymentVerificationSerializer, PaymentCreateSerializer,
    PaymentScheduleSerializer
)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet for payment methods"""
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    
    def get_permissions(self):
        """Allow any user to list and retrieve, but only admin to modify"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active payment methods"""
        active_methods = PaymentMethod.objects.filter(is_active=True)
        serializer = self.get_serializer(active_methods, many=True)
        return Response(serializer.data)

class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payment transactions"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """
        Get payments:
        - For admin: All payments (optionally filtered by application or user)
        - For regular user: Only their own payments
        """
        user = self.request.user
        
        if user.is_staff:
            queryset = Payment.objects.all()
            
            # Filter by application if provided
            application_id = self.request.query_params.get('application')
            if application_id:
                queryset = queryset.filter(application_id=application_id)
                
            # Filter by user if provided
            user_id = self.request.query_params.get('user')
            if user_id:
                queryset = queryset.filter(user_id=user_id)
                
            # Filter by status if provided
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)
        else:
            # Regular users can only see their payments
            queryset = Payment.objects.filter(user=user)
            
            # Filter by application if provided
            application_id = self.request.query_params.get('application')
            if application_id:
                queryset = queryset.filter(application_id=application_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the user when creating a payment"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a payment (admin only)"""
        if not request.user.is_staff:
            return Response({
                'error': 'Only administrators can verify payments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        payment = self.get_object()
        
        # Prevent re-verification
        if payment.status == 'verified':
            return Response({
                'error': 'Payment already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use serializer for validation
        serializer = PaymentVerificationSerializer(data=request.data)
        if serializer.is_valid():
            verification_notes = serializer.validated_data.get('notes')
            
            # Verify the payment (this also processes points)
            payment.verify_payment(
                verified_by=request.user,
                verification_notes=verification_notes
            )
            
            # Return updated payment
            response_serializer = PaymentSerializer(payment)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a payment (admin only)"""
        if not request.user.is_staff:
            return Response({
                'error': 'Only administrators can reject payments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        payment = self.get_object()
        
        # Prevent re-rejection
        if payment.status == 'rejected':
            return Response({
                'error': 'Payment already rejected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use serializer for validation
        serializer = PaymentVerificationSerializer(data=request.data)
        if serializer.is_valid():
            rejection_reason = serializer.validated_data.get('notes')
            
            if not rejection_reason:
                return Response({
                    'error': 'Rejection reason is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reject the payment
            payment.reject_payment(
                verified_by=request.user,
                rejection_reason=rejection_reason
            )
            
            # Return updated payment
            response_serializer = PaymentSerializer(payment)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def reprocess_points(self, request, pk=None):
        """Re-process points for a payment (admin only)"""
        if not request.user.is_staff:
            return Response({
                'error': 'Only administrators can reprocess points'
            }, status=status.HTTP_403_FORBIDDEN)
        
        payment = self.get_object()
        
        # Only verified payments can have points processed
        if payment.status != 'verified':
            return Response({
                'error': 'Only verified payments can have points processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset points processed flag
        payment.points_processed = False
        payment.save(update_fields=['points_processed'])
        
        # Process points
        payment.process_points(admin_user=request.user)
        
        # Return updated payment
        response_serializer = PaymentSerializer(payment)
        return Response(response_serializer.data)

class PaymentScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for payment schedule"""
    serializer_class = PaymentScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Get payment schedule:
        - For admin: All schedules (optionally filtered by application)
        - For regular user: Only their application schedules
        """
        user = self.request.user
        
        if user.is_staff:
            queryset = PaymentSchedule.objects.all()
            
            # Filter by application if provided
            application_id = self.request.query_params.get('application')
            if application_id:
                queryset = queryset.filter(application_id=application_id)
        else:
            # Regular users can only see their application schedules
            queryset = PaymentSchedule.objects.filter(application__user=user)
            
            # Filter by application if provided
            application_id = self.request.query_params.get('application')
            if application_id:
                queryset = queryset.filter(application_id=application_id)
        
        return queryset

class UserPaymentsOverviewView(generics.ListAPIView):
    """View for a user to see their upcoming and recent payments"""
    serializer_class = PaymentScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get upcoming and recent payments for the user"""
        user = self.request.user
        
        # Get all applications belonging to the user
        applications = CreditApplication.objects.filter(user=user, status='approved')
        
        # Get the payment schedules for these applications
        payment_schedules = PaymentSchedule.objects.filter(
            application__in=applications
        ).order_by('due_date')
        
        return payment_schedules
