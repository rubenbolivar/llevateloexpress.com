from rest_framework import serializers
from .models import FinancingPlan, PlanRequirement, FinancingSimulation, PaymentSchedule
from products.serializers import ProductListSerializer, ProductDetailSerializer
from products.models import Product

class PlanRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanRequirement
        fields = ['id', 'name', 'description', 'is_mandatory']

class FinancingPlanSerializer(serializers.ModelSerializer):
    """Serializer for financing plans"""
    class Meta:
        model = FinancingPlan
        fields = [
            'id', 'name', 'plan_type', 'description', 'min_price',
            'max_price', 'min_months', 'max_months', 'interest_rate',
            'down_payment_percentage', 'adjudication_percentage',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class FinancingPlanListSerializer(serializers.ModelSerializer):
    """List serializer for financing plans"""
    class Meta:
        model = FinancingPlan
        fields = [
            'id', 'name', 'plan_type', 'description', 'interest_rate',
            'down_payment_percentage', 'adjudication_percentage',
            'is_active'
        ]

class PaymentScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSchedule
        fields = [
            'payment_number', 'payment_date', 'principal', 
            'interest', 'total_payment', 'remaining_balance', 
            'is_adjudication'
        ]

class FinancingSimulationSerializer(serializers.ModelSerializer):
    """Serializer for financing simulations"""
    plan = FinancingPlanSerializer(read_only=True)
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = FinancingSimulation
        fields = [
            'id', 'user', 'plan', 'product', 'product_price',
            'down_payment', 'term_months', 'monthly_payment',
            'interest_rate', 'adjudication_percentage', 'total_payment',
            'total_interest', 'savings', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class FinancingSimulationCreateSerializer(serializers.ModelSerializer):
    """Create serializer for financing simulations"""
    plan_id = serializers.IntegerField()
    product_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = FinancingSimulation
        fields = [
            'plan_id', 'product_id', 'product_price', 'down_payment',
            'term_months', 'monthly_payment', 'interest_rate',
            'adjudication_percentage', 'total_payment', 'total_interest',
            'savings'
        ]
    
    def validate_plan_id(self, value):
        """Ensure plan exists and is active"""
        try:
            plan = FinancingPlan.objects.get(pk=value, is_active=True)
        except FinancingPlan.DoesNotExist:
            raise serializers.ValidationError("Selected financing plan does not exist or is not active")
        return value
    
    def validate_product_id(self, value):
        """Ensure product exists (if provided)"""
        if value:
            from products.models import Product
            try:
                Product.objects.get(pk=value, is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError("Selected product does not exist or is not active")
        return value
    
    def create(self, validated_data):
        """Create simulation with related objects"""
        plan_id = validated_data.pop('plan_id')
        product_id = validated_data.pop('product_id', None)
        
        from products.models import Product
        
        # Get related objects
        plan = FinancingPlan.objects.get(pk=plan_id)
        product = None
        if product_id:
            product = Product.objects.get(pk=product_id)
        
        # Create simulation
        simulation = FinancingSimulation.objects.create(
            plan=plan,
            product=product,
            **validated_data
        )
        
        return simulation
    
    def validate(self, data):
        """Ensure simulation aligns with plan constraints"""
        plan_id = data.get('plan_id')
        try:
            plan = FinancingPlan.objects.get(pk=plan_id, is_active=True)
            
            price = data.get('product_price')
            term_months = data.get('term_months')
            
            # Validate price range
            if plan.min_price and price < plan.min_price:
                raise serializers.ValidationError({
                    'product_price': f'Price below minimum ({plan.min_price})'
                })
            
            if plan.max_price and price > plan.max_price:
                raise serializers.ValidationError({
                    'product_price': f'Price above maximum ({plan.max_price})'
                })
            
            # Validate term range
            if plan.min_months and term_months < plan.min_months:
                raise serializers.ValidationError({
                    'term_months': f'Term below minimum ({plan.min_months} months)'
                })
            
            if plan.max_months and term_months > plan.max_months:
                raise serializers.ValidationError({
                    'term_months': f'Term above maximum ({plan.max_months} months)'
                })
            
        except FinancingPlan.DoesNotExist:
            pass  # Already validated in validate_plan_id
        
        return data

class FinancingCalculatorSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    plan_id = serializers.IntegerField()
    term_months = serializers.IntegerField(min_value=1, max_value=120)
    down_payment = serializers.DecimalField(
        max_digits=12, decimal_places=2, 
        required=False, allow_null=True
    )
    simulation_date = serializers.DateField(required=False, allow_null=True)
    
    def validate(self, data):
        """
        Validar que el producto y el plan existan
        """
        product_id = data.get('product_id')
        plan_id = data.get('plan_id')
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError(
                {'product_id': 'Producto no encontrado'}
            )
            
        try:
            plan = FinancingPlan.objects.get(id=plan_id)
        except FinancingPlan.DoesNotExist:
            raise serializers.ValidationError(
                {'plan_id': 'Plan de financiamiento no encontrado'}
            )
            
        # Validar que el término esté dentro del rango permitido por el plan
        if data['term_months'] < plan.min_term or data['term_months'] > plan.max_term:
            raise serializers.ValidationError(
                {'term_months': f'El plazo debe estar entre {plan.min_term} y {plan.max_term} meses'}
            )
            
        return data

class PaymentDetailSerializer(serializers.Serializer):
    payment_number = serializers.IntegerField()
    payment_date = serializers.DateField()
    principal = serializers.DecimalField(max_digits=12, decimal_places=2)
    interest = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_payment = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    is_adjudication = serializers.BooleanField()

class ProductDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    price = serializers.FloatField()

class PlanDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    type = serializers.CharField()

class FinancingDetailsSerializer(serializers.Serializer):
    term_months = serializers.IntegerField()
    monthly_payment = serializers.FloatField()
    total_interest = serializers.FloatField()
    total_amount = serializers.FloatField()
    
    # Campos opcionales para compra programada
    adjudication_month = serializers.IntegerField(required=False, allow_null=True)
    adjudication_payment = serializers.FloatField(required=False, allow_null=True)
    adjudication_percentage = serializers.FloatField(required=False, allow_null=True)
    
    # Campos opcionales para adjudicación inmediata
    down_payment = serializers.FloatField(required=False, allow_null=True)
    down_payment_percentage = serializers.FloatField(required=False, allow_null=True)
    financed_amount = serializers.FloatField(required=False, allow_null=True)

class SaveSimulationSerializer(serializers.Serializer):
    product = ProductDetailSerializer()
    plan = PlanDetailSerializer()
    financing_details = FinancingDetailsSerializer()
    payment_schedule = PaymentDetailSerializer(many=True)

class ProgrammedPurchaseResultSerializer(serializers.Serializer):
    """Serializer for programmed purchase calculation results"""
    monthly_payment = serializers.DecimalField(max_digits=12, decimal_places=2)
    adjudication_month = serializers.IntegerField()
    adjudication_payment = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_interest = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_schedule = PaymentScheduleSerializer(many=True)
    simulation_id = serializers.IntegerField(required=False)

class ImmediateAdjudicationResultSerializer(serializers.Serializer):
    """Serializer for immediate adjudication calculation results"""
    down_payment = serializers.DecimalField(max_digits=12, decimal_places=2)
    financed_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_payment = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_interest = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_schedule = PaymentScheduleSerializer(many=True)
    simulation_id = serializers.IntegerField(required=False) 