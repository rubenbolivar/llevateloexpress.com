from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ClientProfile, ClientInteraction
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    ClientProfileSerializer, ClientProfileUpdateSerializer,
    ClientInteractionSerializer
)

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    """View for user registration"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Devolver una respuesta personalizada
        return Response({
            'message': 'Usuario registrado exitosamente',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        return serializer.save()

class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'user': serializer.data,
            'is_staff': instance.is_staff,
            'is_active': instance.is_active,
            'date_joined': instance.date_joined,
            'last_login': instance.last_login
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Perfil actualizado exitosamente',
            'user': serializer.data
        })

class ClientProfileUpdateView(generics.UpdateAPIView):
    """View for updating client profile"""
    serializer_class = ClientProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        # Asegurarse de que el perfil existe
        client_profile, created = ClientProfile.objects.get_or_create(user=user)
        return client_profile
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
            
        # Return the full user profile with updated client profile
        user_serializer = UserSerializer(request.user)
        return Response({
            'message': 'Perfil de cliente actualizado exitosamente',
            'user': user_serializer.data
        })

class CurrentUserView(APIView):
    """View to get current authenticated user info"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login
        })

class ClientInteractionViewSet(viewsets.ModelViewSet):
    """ViewSet for client interactions"""
    serializer_class = ClientInteractionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Staff can see all interactions, optionally filtered by user_id
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return ClientInteraction.objects.filter(user_id=user_id)
            return ClientInteraction.objects.all()
        else:
            # Regular users can only see their own interactions
            return ClientInteraction.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # If regular user is creating interaction for themselves
        if not self.request.user.is_staff:
            serializer.save(user=self.request.user, created_by=self.request.user)
        else:
            # Staff can create interactions for other users
            serializer.save(created_by=self.request.user)

class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for admin user management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'], url_path='verify')
    def verify_user(self, request, pk=None):
        """Endpoint for admin to verify a user"""
        user = self.get_object()
        user.is_verified = True
        user.verification_date = timezone.now()
        user.save()
        return Response({
            'message': 'Usuario verificado exitosamente',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='unverify')
    def unverify_user(self, request, pk=None):
        """Endpoint for admin to unverify a user"""
        user = self.get_object()
        user.is_verified = False
        user.verification_date = None
        user.save()
        return Response({
            'message': 'Verificación de usuario removida',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate_user(self, request, pk=None):
        """Endpoint for admin to activate a user"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({
            'message': 'Usuario activado exitosamente',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate_user(self, request, pk=None):
        """Endpoint for admin to deactivate a user"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({
            'message': 'Usuario desactivado exitosamente',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
