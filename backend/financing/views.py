from django.shortcuts import render
from decimal import Decimal
from rest_framework import viewsets, generics, status, views
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404

from products.models import Product
from .models import FinancingPlan, PlanRequirement, FinancingSimulation, PaymentSchedule
from .serializers import (
    FinancingPlanSerializer, PlanRequirementSerializer,
    FinancingSimulationSerializer, FinancingCalculatorSerializer,
    ProgrammedPurchaseResultSerializer, ImmediateAdjudicationResultSerializer,
    PaymentScheduleSerializer, SaveSimulationSerializer
)
from .services import FinancingCalculator, calculate_financing, save_financing_simulation, get_saved_simulations
from common.utils import format_currency
import json

class FinancingPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing financing plans"""
    queryset = FinancingPlan.objects.filter(is_active=True)
    serializer_class = FinancingPlanSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=True, methods=['post'])
    def add_requirement(self, request, pk=None):
        """Add a requirement to a financing plan"""
        plan = self.get_object()
        serializer = PlanRequirementSerializer(data=request.data)
        
        if serializer.is_valid():
            PlanRequirement.objects.create(plan=plan, **serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Get requirements for a specific financing plan."""
        plan = self.get_object()
        requirements = plan.requirements.all()
        serializer = PlanRequirementSerializer(requirements, many=True)
        return Response(serializer.data)

class FinancingSimulationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing financing simulations"""
    serializer_class = FinancingSimulationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get simulations for the current user"""
        return FinancingSimulation.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """Save the current user when creating a simulation."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def payment_schedule(self, request, pk=None):
        """Get payment schedule for a specific simulation."""
        simulation = self.get_object()
        payments = simulation.payments.all().order_by('payment_number')
        serializer = PaymentScheduleSerializer(payments, many=True)
        return Response(serializer.data)

class FinancingCalculatorView(views.APIView):
    """
    API para calcular opciones de financiamiento
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = FinancingCalculatorSerializer(data=request.data)
        if serializer.is_valid():
            result = calculate_financing(
                product_id=serializer.validated_data['product_id'],
                plan_id=serializer.validated_data['plan_id'],
                term_months=serializer.validated_data['term_months'],
                down_payment=serializer.validated_data.get('down_payment'),
                simulation_date=serializer.validated_data.get('simulation_date')
            )
            
            if 'error' in result:
                return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response(result)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CalculatorAPIView(views.APIView):
    """API view for financing calculator."""
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        """
        Calculate financing details based on input parameters.
        
        Expected input:
        {
            "plan_type": "programmed" or "immediate",
            "vehicle_price": decimal,
            "down_payment": decimal (optional, only for immediate plan),
            "term_months": integer
        }
        """
        try:
            data = request.data
            plan_type = data.get('plan_type')
            vehicle_price = Decimal(str(data.get('vehicle_price', 0)))
            term_months = int(data.get('term_months', 36))
            
            if plan_type not in ['programmed', 'immediate']:
                return Response(
                    {'error': 'Invalid plan type. Must be either "programmed" or "immediate".'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if vehicle_price <= 0:
                return Response(
                    {'error': 'Vehicle price must be greater than zero.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if term_months < 12 or term_months > 60:
                return Response(
                    {'error': 'Term must be between 12 and 60 months.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the financing plans
            try:
                plan = FinancingPlan.objects.get(plan_type=plan_type, is_active=True)
            except FinancingPlan.DoesNotExist:
                return Response(
                    {'error': f'No active {plan_type} financing plan found.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # For immediate plans, we need a down payment
            down_payment = Decimal('0')
            if plan_type == 'immediate':
                down_payment = Decimal(str(data.get('down_payment', 0)))
                min_down_payment = vehicle_price * (plan.down_payment_percentage / 100)
                
                if down_payment < min_down_payment:
                    return Response({
                        'error': f'Down payment must be at least {format_currency(min_down_payment)} ({plan.down_payment_percentage}%).',
                        'min_down_payment': format_currency(min_down_payment),
                        'min_down_payment_raw': float(min_down_payment)
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate the financing details
            result = calculate_financing(
                plan=plan,
                vehicle_price=vehicle_price,
                term_months=term_months,
                down_payment=down_payment
            )
            
            # Format currency values for response
            formatted_result = {
                'plan_type': plan_type,
                'vehicle_price': format_currency(vehicle_price),
                'vehicle_price_raw': float(vehicle_price),
                'term_months': term_months,
                'monthly_payment': format_currency(result['monthly_payment']),
                'monthly_payment_raw': float(result['monthly_payment']),
                'total_interest': format_currency(result['total_interest']),
                'total_interest_raw': float(result['total_interest']),
                'total_amount': format_currency(result['total_amount']),
                'total_amount_raw': float(result['total_amount'])
            }
            
            if plan_type == 'immediate':
                formatted_result.update({
                    'down_payment': format_currency(down_payment),
                    'down_payment_raw': float(down_payment),
                    'financed_amount': format_currency(result['financed_amount']),
                    'financed_amount_raw': float(result['financed_amount'])
                })
            else:  # programmed
                formatted_result.update({
                    'adjudication_month': result['adjudication_month'],
                    'adjudication_payment': format_currency(result['adjudication_payment']),
                    'adjudication_payment_raw': float(result['adjudication_payment'])
                })
            
            # Add payment schedule
            formatted_schedule = []
            for payment in result['payment_schedule']:
                formatted_schedule.append({
                    'payment_number': payment['payment_number'],
                    'principal': format_currency(payment['principal']),
                    'principal_raw': float(payment['principal']),
                    'interest': format_currency(payment['interest']),
                    'interest_raw': float(payment['interest']),
                    'total_payment': format_currency(payment['total_payment']),
                    'total_payment_raw': float(payment['total_payment']),
                    'remaining_balance': format_currency(payment['remaining_balance']),
                    'remaining_balance_raw': float(payment['remaining_balance']),
                    'is_adjudication': payment['is_adjudication']
                })
            
            formatted_result['payment_schedule'] = formatted_schedule
            
            return Response(formatted_result)
            
        except (ValueError, TypeError, json.JSONDecodeError) as e:
            return Response(
                {'error': f'Invalid input data: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An unexpected error occurred: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductFinancingOptionsView(views.APIView):
    """
    Obtiene opciones de financiamiento para un producto específico
    """
    permission_classes = [AllowAny]
    
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Obtener todos los planes activos
        plans = FinancingPlan.objects.filter(is_active=True)
        
        # Calcular opciones para cada plan con términos predeterminados
        options = []
        for plan in plans:
            # Usar un plazo predeterminado para cada tipo de plan
            term = plan.min_term + ((plan.max_term - plan.min_term) // 2)
            
            # Calcular para compra programada
            if plan.plan_type == 'programmed':
                result = calculate_financing(
                    product_id=product.id,
                    plan_id=plan.id,
                    term_months=term
                )
                if 'error' not in result:
                    options.append({
                        'plan_type': 'programmed',
                        'plan_name': plan.name,
                        'plan_id': plan.id,
                        'term_months': term,
                        'monthly_payment': result['financing_details']['monthly_payment'],
                        'adjudication_month': result['financing_details']['adjudication_month'],
                        'total_amount': result['financing_details']['total_amount']
                    })
            
            # Calcular para adjudicación inmediata
            elif plan.plan_type == 'immediate':
                # Usar el pago inicial mínimo requerido
                down_payment = product.price * (plan.down_payment_percentage / 100)
                
                result = calculate_financing(
                    product_id=product.id,
                    plan_id=plan.id,
                    term_months=term,
                    down_payment=down_payment
                )
                if 'error' not in result:
                    options.append({
                        'plan_type': 'immediate',
                        'plan_name': plan.name,
                        'plan_id': plan.id,
                        'term_months': term,
                        'monthly_payment': result['financing_details']['monthly_payment'],
                        'down_payment': result['financing_details']['down_payment'],
                        'total_amount': result['financing_details']['total_amount']
                    })
        
        return Response({
            'product': {
                'id': product.id,
                'name': product.name,
                'price': float(product.price)
            },
            'financing_options': options
        })

class SaveSimulationView(views.APIView):
    """
    Guarda una simulación de financiamiento
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SaveSimulationSerializer(data=request.data)
        if serializer.is_valid():
            simulation = save_financing_simulation(
                user=request.user,
                simulation_data=serializer.validated_data
            )
            
            if simulation:
                return Response(
                    {'id': simulation.id, 'message': 'Simulación guardada correctamente'},
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {'error': 'Error al guardar la simulación'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSimulationsView(generics.ListAPIView):
    """
    Lista las simulaciones guardadas por el usuario
    """
    serializer_class = FinancingSimulationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return get_saved_simulations(self.request.user, limit=10)
