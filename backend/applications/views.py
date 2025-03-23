from django.shortcuts import render
from rest_framework import viewsets, generics, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser

from django.utils import timezone
from django.db import transaction

from .models import CreditApplication, ApplicationDocument, ApplicationStatus, ApplicationNote
from .serializers import (
    CreditApplicationSerializer, CreditApplicationListSerializer,
    CreditApplicationCreateSerializer, ApplicationDocumentSerializer,
    ApplicationDocumentCreateSerializer, ApplicationStatusSerializer,
    ApplicationStatusUpdateSerializer,
    ApplicationNoteSerializer,
    ApplicationNoteCreateSerializer
)
from .services import (
    create_application,
    submit_application,
    update_application_status,
    add_document,
    verify_document,
    add_note,
    get_user_applications,
    process_application_status_change,
    document_verification_service
)

User = get_user_model()

class IsOwnerOrAdmin(permissions.BasePermission):
    """Custom permission to only allow owners of an object or admins to view/edit it"""
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_staff:
            return True
        
        # Check if the object has a user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # For ApplicationDocument, check the parent application
        if isinstance(obj, ApplicationDocument):
            return obj.application.user == request.user
        
        return False

class CreditApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing financing applications"""
    serializer_class = CreditApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reference_number', 'product__name', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'updated_at', 'status']
    
    def get_queryset(self):
        """Get applications based on user role"""
        if self.request.user.is_staff:
            # Admins can see all applications
            return CreditApplication.objects.all()
        else:
            # Regular users can only see their own applications
            return CreditApplication.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return CreditApplicationListSerializer
        elif self.action == 'create':
            return CreditApplicationCreateSerializer
        return CreditApplicationSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        return super().get_permissions()
    
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update application status (admin only)"""
        application = self.get_object()
        
        # Only admins can update status
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApplicationStatusUpdateSerializer(
            application, data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return the updated application
        app_serializer = self.get_serializer(application)
        return Response(app_serializer.data)
    
    @action(detail=True, methods=['post'], url_path='add-admin-note')
    def add_admin_note(self, request, pk=None):
        """Add admin note to application (admin only)"""
        application = self.get_object()
        
        # Only admins can add notes
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        note = request.data.get('note', '')
        if not note:
            return Response(
                {'detail': 'Note cannot be empty.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add note to existing notes
        if application.admin_notes:
            application.admin_notes += f"\n\n{request.user.get_full_name()} ({request.user.username}):\n{note}"
        else:
            application.admin_notes = f"{request.user.get_full_name()} ({request.user.username}):\n{note}"
        
        application.save()
        
        # Return the updated application
        serializer = self.get_serializer(application)
        return Response(serializer.data)

class ApplicationDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing application documents"""
    serializer_class = ApplicationDocumentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Get documents for a specific application"""
        application_pk = self.kwargs.get('application_pk')
        application = get_object_or_404(CreditApplication, pk=application_pk)
        
        # Check if user has permission to view this application
        if self.request.user.is_staff or application.user == self.request.user:
            return ApplicationDocument.objects.filter(application=application)
        return ApplicationDocument.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ApplicationDocumentCreateSerializer
        return ApplicationDocumentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['application_id'] = self.kwargs['application_pk']
        return context
    
    @action(detail=True, methods=['patch'], url_path='verify-document')
    def verify_document(self, request, application_pk=None, pk=None):
        """Verify document (admin only)"""
        document = self.get_object()
        
        # Only admins can verify documents
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        is_verified = request.data.get('is_verified', True)
        verification_notes = request.data.get('verification_notes', '')
        
        document.is_verified = is_verified
        document.verification_notes = verification_notes
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

class UserApplicationViewSet(viewsets.ModelViewSet):
    """
    Viewset para gestionar las solicitudes de crédito del usuario.
    """
    serializer_class = CreditApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return get_user_applications(self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreditApplicationCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return CreditApplicationUpdateSerializer
        return CreditApplicationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='draft')
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Envía una solicitud para revisión.
        """
        application = self.get_object()
        
        if application.status != 'draft':
            return Response(
                {'detail': 'Solo se pueden enviar solicitudes en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = submit_application(application, request.user)
        
        if success:
            serializer = self.get_serializer(application)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'No se pudo enviar la solicitud.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancela una solicitud.
        """
        application = self.get_object()
        
        if application.status in ['approved', 'rejected', 'cancelled']:
            return Response(
                {'detail': 'No se puede cancelar una solicitud en este estado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = update_application_status(
            application, 
            'cancelled', 
            'Solicitud cancelada por el usuario', 
            request.user
        )
        
        if success:
            serializer = self.get_serializer(application)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'No se pudo cancelar la solicitud.'},
                status=status.HTTP_400_BAD_REQUEST
            )

class AdminApplicationViewSet(viewsets.ModelViewSet):
    """
    Viewset para administradores que gestionan solicitudes.
    """
    queryset = CreditApplication.objects.all()
    serializer_class = CreditApplicationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Actualiza el estado de una solicitud.
        """
        application = self.get_object()
        serializer = ApplicationStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            notes = serializer.validated_data.get('notes', '')
            
            # Si se rechaza, guardar motivo de rechazo
            if new_status == 'rejected':
                rejection_reason = serializer.validated_data.get('rejection_reason', '')
                if rejection_reason:
                    application.rejection_reason = rejection_reason
                    application.save()
            
            success = update_application_status(
                application, 
                new_status, 
                notes, 
                request.user
            )
            
            if success:
                application_serializer = self.get_serializer(application)
                return Response(application_serializer.data)
            else:
                return Response(
                    {'detail': 'Transición de estado no válida.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def verify_document(self, request, pk=None):
        """
        Verifica un documento.
        """
        try:
            document_id = request.data.get('document_id')
            is_verified = request.data.get('is_verified', False)
            
            document = ApplicationDocument.objects.get(
                id=document_id,
                application__id=pk
            )
            
            document = verify_document(document, is_verified, request.user)
            
            return Response(
                ApplicationDocumentSerializer(document).data
            )
        except ApplicationDocument.DoesNotExist:
            return Response(
                {'detail': 'Documento no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """
        Agrega una nota a la solicitud.
        """
        serializer = ApplicationNoteCreateSerializer(
            data=request.data,
            context={'request': request, 'application_id': pk}
        )
        
        if serializer.is_valid():
            note = serializer.save()
            return Response(
                ApplicationNoteSerializer(note).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ApplicationStatusListView(generics.ListAPIView):
    """
    Vista para listar el historial de estados de una solicitud.
    """
    serializer_class = ApplicationStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        application_id = self.kwargs['application_pk']
        return ApplicationStatus.objects.filter(
            application__id=application_id
        ).order_by('-changed_at')
