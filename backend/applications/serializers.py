from rest_framework import serializers
from .models import CreditApplication, ApplicationDocument, ApplicationStatus, ApplicationNote
from products.serializers import ProductDetailSerializer
from financing.serializers import FinancingPlanSerializer
from accounts.serializers import UserMinimalSerializer

class ApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationDocument
        fields = [
            'id', 'document_type', 'file', 'description', 
            'is_verified', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_at', 'is_verified']

class ApplicationStatusSerializer(serializers.ModelSerializer):
    changed_by = UserMinimalSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ApplicationStatus
        fields = [
            'id', 'status', 'status_display', 'notes', 
            'changed_by', 'changed_at'
        ]
        read_only_fields = ['changed_at']
    
    def get_status_display(self, obj):
        return obj.get_status_display()

class ApplicationNoteSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = ApplicationNote
        fields = ['id', 'note', 'created_by', 'created_at']
        read_only_fields = ['created_at']

class CreditApplicationMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal para referenciar solicitudes de crédito"""
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = CreditApplication
        fields = [
            'id', 'reference_number', 'status', 'status_display',
            'created_at', 'amount'
        ]
    
    def get_status_display(self, obj):
        return obj.get_status_display()

class CreditApplicationListSerializer(serializers.ModelSerializer):
    """Lista resumida de solicitudes de crédito"""
    user = UserMinimalSerializer(read_only=True)
    product_name = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = CreditApplication
        fields = [
            'id', 'reference_number', 'user', 'product_name', 'plan_name',
            'amount', 'monthly_payment', 'status', 'status_display',
            'created_at', 'updated_at', 'submitted_at'
        ]
    
    def get_product_name(self, obj):
        return obj.product.name if obj.product else None
    
    def get_plan_name(self, obj):
        return obj.financing_plan.name if obj.financing_plan else None
    
    def get_status_display(self, obj):
        return obj.get_status_display()

class CreditApplicationSerializer(serializers.ModelSerializer):
    product = ProductDetailSerializer(read_only=True)
    financing_plan = FinancingPlanSerializer(read_only=True)
    user = UserMinimalSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    status_history = ApplicationStatusSerializer(many=True, read_only=True)
    admin_notes = ApplicationNoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = CreditApplication
        fields = [
            'id', 'user', 'product', 'financing_plan', 
            'amount', 'down_payment', 'term_months', 'monthly_payment',
            'status', 'status_display', 'notes', 'rejection_reason',
            'created_at', 'updated_at', 'submitted_at', 'approved_at', 'rejected_at',
            'documents', 'status_history', 'admin_notes'
        ]
        read_only_fields = [
            'status', 'rejection_reason', 'created_at', 'updated_at', 
            'submitted_at', 'approved_at', 'rejected_at'
        ]
    
    def get_status_display(self, obj):
        return obj.get_status_display()

class CreditApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditApplication
        fields = [
            'product', 'financing_plan', 'amount', 
            'down_payment', 'term_months', 'monthly_payment', 'notes'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['status'] = 'draft'
        application = CreditApplication.objects.create(**validated_data)
        
        # Crear el registro inicial de historial de estado
        ApplicationStatus.objects.create(
            application=application,
            status='draft',
            notes='Solicitud creada en estado borrador',
            changed_by=user
        )
        
        return application

class CreditApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditApplication
        fields = ['notes']

class ApplicationDocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationDocument
        fields = ['document_type', 'file', 'description']
    
    def create(self, validated_data):
        application_id = self.context['application_id']
        application = CreditApplication.objects.get(id=application_id)
        validated_data['application'] = application
        return ApplicationDocument.objects.create(**validated_data)

class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=CreditApplication.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

class ApplicationNoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationNote
        fields = ['note']
    
    def create(self, validated_data):
        application_id = self.context['application_id']
        user = self.context['request'].user
        application = CreditApplication.objects.get(id=application_id)
        validated_data['application'] = application
        validated_data['created_by'] = user
        return ApplicationNote.objects.create(**validated_data) 