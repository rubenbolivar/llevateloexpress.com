from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import ClientProfile, ClientInteraction

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializer para información mínima de usuarios"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        exclude = ['user', 'created_at', 'updated_at']
        
class UserSerializer(serializers.ModelSerializer):
    client_profile = ClientProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                 'phone_number', 'identification', 'address', 'date_of_birth',
                 'monthly_income', 'occupation', 'is_verified', 'client_profile']
        read_only_fields = ['is_verified', 'verification_date', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'phone_number', 'identification',
                 'address', 'date_of_birth', 'occupation']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este correo electrónico.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Crear perfil de cliente
        ClientProfile.objects.create(user=user)
        return user

class ClientInteractionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientInteraction
        fields = ['id', 'user', 'user_name', 'interaction_type', 'interaction_date', 
                 'description', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_at', 'created_by', 'created_by_name', 'user_name']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return None
        
    def create(self, validated_data):
        # Si no se proporciona un usuario (cliente), usar el usuario autenticado
        if 'user' not in validated_data and not self.context['request'].user.is_staff:
            validated_data['user'] = self.context['request'].user
        
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ClientProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        exclude = ['user', 'created_at', 'updated_at']
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance 