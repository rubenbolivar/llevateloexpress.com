from rest_framework import serializers
from django.utils import timezone
from .models import Payment, PaymentMethod, PaymentSchedule
from applications.serializers import CreditApplicationMinimalSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user serializer for payment serializers"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods"""
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'name', 'description', 'instructions', 
            'account_info', 'is_active'
        ]
        read_only_fields = ['id']

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment details"""
    application = CreditApplicationMinimalSerializer(read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)
    verified_by_name = serializers.SerializerMethodField()
    payment_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'application', 'user', 'payment_method', 'payment_type',
            'payment_type_display', 'amount', 'expected_amount', 'reference_number',
            'payment_date', 'due_date', 'receipt', 'payer_name', 'status',
            'status_display', 'is_verified', 'verified_by', 'verified_by_name',
            'verification_date', 'rejection_reason', 'notes', 'points_processed',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'verified_by', 'verification_date', 'is_verified',
            'status', 'points_processed', 'created_at', 'updated_at'
        ]
    
    def get_verified_by_name(self, obj):
        """Get the name of the admin who verified the payment"""
        if obj.verified_by:
            return f"{obj.verified_by.first_name} {obj.verified_by.last_name}"
        return None
    
    def get_payment_type_display(self, obj):
        """Get the display name for payment type"""
        return dict(Payment.PAYMENT_TYPE_CHOICES).get(obj.payment_type, obj.payment_type)
    
    def get_status_display(self, obj):
        """Get the display name for status"""
        return dict(Payment.STATUS_CHOICES).get(obj.status, obj.status)

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    application_id = serializers.IntegerField()
    payment_method_id = serializers.IntegerField()
    
    class Meta:
        model = Payment
        fields = [
            'application_id', 'payment_method_id', 'payment_type',
            'amount', 'reference_number', 'payment_date', 'payer_name',
            'receipt'
        ]
    
    def validate_application_id(self, value):
        """Ensure application exists and belongs to user"""
        from applications.models import CreditApplication
        
        try:
            application = CreditApplication.objects.get(pk=value)
        except CreditApplication.DoesNotExist:
            raise serializers.ValidationError("Application not found")
        
        # Ensure the application belongs to the current user
        user = self.context['request'].user
        if not user.is_staff and application.user != user:
            raise serializers.ValidationError("You don't have permission to make payments for this application")
        
        return value
    
    def validate_payment_method_id(self, value):
        """Ensure payment method exists and is active"""
        try:
            payment_method = PaymentMethod.objects.get(pk=value)
        except PaymentMethod.DoesNotExist:
            raise serializers.ValidationError("Payment method not found")
        
        if not payment_method.is_active:
            raise serializers.ValidationError("This payment method is not active")
        
        return value
    
    def create(self, validated_data):
        """Create a new payment"""
        from applications.models import CreditApplication
        
        application_id = validated_data.pop('application_id')
        payment_method_id = validated_data.pop('payment_method_id')
        
        # Get application and payment method
        application = CreditApplication.objects.get(pk=application_id)
        payment_method = PaymentMethod.objects.get(pk=payment_method_id)
        
        # Get expected amount
        expected_amount = 0
        if application.monthly_payment:
            expected_amount = application.monthly_payment
        
        # Create payment
        payment = Payment.objects.create(
            application=application,
            payment_method=payment_method,
            expected_amount=expected_amount,
            **validated_data
        )
        
        return payment

class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for payment verification"""
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Ensure notes are provided for rejection"""
        if self.context.get('action') == 'reject' and not data.get('notes'):
            raise serializers.ValidationError({"notes": "Notes are required for rejection"})
        return data

class PaymentScheduleSerializer(serializers.ModelSerializer):
    """Serializer for payment schedule"""
    class Meta:
        model = PaymentSchedule
        fields = [
            'id', 'application', 'payment_number', 'due_date',
            'amount', 'principal', 'interest', 'is_paid', 'payment'
        ]
        read_only_fields = ['id']

class PaymentTransactionListSerializer(serializers.ModelSerializer):
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    application_reference = serializers.CharField(source='application.reference_number', read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'application_reference', 'payment_method_name', 
                 'payment_type_display', 'amount', 'reference_number', 
                 'transaction_date', 'status', 'status_display']

class PaymentTransactionDetailSerializer(serializers.ModelSerializer):
    payment_method = PaymentMethodSerializer(read_only=True)
    application = FinancingApplicationListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    receipt_url = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'application', 'payment_method', 'payment_type', 
                 'payment_type_display', 'amount', 'reference_number', 
                 'transaction_date', 'receipt', 'receipt_url', 'payer_name',
                 'status', 'status_display', 'verified_by', 'verified_by_name',
                 'verification_date', 'rejection_reason', 'notes',
                 'created_at', 'updated_at']
        read_only_fields = ['verified_by', 'verification_date', 'rejection_reason',
                          'status', 'created_at', 'updated_at']
    
    def get_receipt_url(self, obj):
        if obj.receipt:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt.url)
        return None
    
    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return obj.verified_by.get_full_name() or obj.verified_by.username
        return None

class PaymentTransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ['application', 'payment_method', 'payment_type', 'amount', 
                 'reference_number', 'transaction_date', 'receipt', 'payer_name', 'notes']
    
    def create(self, validated_data):
        # Add the current user as payer name if not provided
        if not validated_data.get('payer_name'):
            user = self.context['request'].user
            validated_data['payer_name'] = user.get_full_name() or user.username
        
        return super().create(validated_data)

class PaymentRejectionSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True)
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        reason = validated_data.get('rejection_reason', '')
        
        if not reason:
            raise serializers.ValidationError({'rejection_reason': 'This field is required.'})
        
        instance.reject_payment(user, reason)
        return instance 