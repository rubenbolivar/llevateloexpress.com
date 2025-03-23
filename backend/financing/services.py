from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from .models import FinancingSimulation, PaymentSchedule, FinancingPlan
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from products.models import Product

class FinancingCalculator:
    """Service for calculating financing details for different plan types"""
    
    @staticmethod
    def calculate_programmed_purchase(product_price, term_months, interest_rate, adjudication_percentage):
        """
        Calculate financing details for programmed purchase (adjudication at 45%)
        
        Args:
            product_price (Decimal): Full price of the product
            term_months (int): Term length in months
            interest_rate (Decimal): Annual interest rate (percentage)
            adjudication_percentage (Decimal): Percentage at which adjudication occurs
            
        Returns:
            dict: Calculation results
        """
        # Convert annual interest to monthly
        monthly_interest_rate = interest_rate / Decimal('100') / Decimal('12')
        
        # Calculate monthly payment (fixed across all months)
        monthly_payment = product_price * monthly_interest_rate / (1 - (1 + monthly_interest_rate) ** -term_months)
        
        # Determine adjudication month (when paid amount reaches adjudication percentage)
        total_paid = Decimal('0')
        adjudication_amount = product_price * adjudication_percentage / Decimal('100')
        adjudication_month = None
        
        # Calculate payment schedule
        payment_schedule = []
        remaining_balance = product_price
        total_principal = Decimal('0')
        total_interest = Decimal('0')
        
        for month in range(1, term_months + 1):
            interest_payment = remaining_balance * monthly_interest_rate
            principal_payment = monthly_payment - interest_payment
            
            remaining_balance -= principal_payment
            total_paid += principal_payment
            
            total_principal += principal_payment
            total_interest += interest_payment
            
            # Check for adjudication threshold
            if total_paid >= adjudication_amount and adjudication_month is None:
                adjudication_month = month
            
            schedule_item = {
                'payment_number': month,
                'principal': principal_payment.quantize(Decimal('0.01')),
                'interest': interest_payment.quantize(Decimal('0.01')),
                'total_payment': monthly_payment.quantize(Decimal('0.01')),
                'remaining_balance': remaining_balance.quantize(Decimal('0.01')),
                'is_adjudication': month == adjudication_month
            }
            payment_schedule.append(schedule_item)
        
        # At adjudication, the customer needs to make a lump sum payment 
        # to reach the full price of the product
        adjudication_payment = product_price - total_paid
        
        results = {
            'monthly_payment': monthly_payment.quantize(Decimal('0.01')),
            'adjudication_month': adjudication_month,
            'adjudication_payment': adjudication_payment.quantize(Decimal('0.01')),
            'total_principal': total_principal.quantize(Decimal('0.01')),
            'total_interest': total_interest.quantize(Decimal('0.01')),
            'total_amount': (total_principal + total_interest).quantize(Decimal('0.01')),
            'payment_schedule': payment_schedule
        }
        
        return results
    
    @staticmethod
    def calculate_immediate_adjudication(product_price, term_months, interest_rate, down_payment_percentage):
        """
        Calculate financing details for immediate adjudication
        
        Args:
            product_price (Decimal): Full price of the product
            term_months (int): Term length in months
            interest_rate (Decimal): Annual interest rate (percentage)
            down_payment_percentage (Decimal): Required down payment percentage
            
        Returns:
            dict: Calculation results
        """
        # Calculate down payment
        down_payment = product_price * down_payment_percentage / Decimal('100')
        
        # Calculate financed amount
        financed_amount = product_price - down_payment
        
        # Convert annual interest to monthly
        monthly_interest_rate = interest_rate / Decimal('100') / Decimal('12')
        
        # Calculate monthly payment
        monthly_payment = financed_amount * monthly_interest_rate / (1 - (1 + monthly_interest_rate) ** -term_months)
        
        # Calculate payment schedule
        payment_schedule = []
        remaining_balance = financed_amount
        total_principal = Decimal('0')
        total_interest = Decimal('0')
        
        for month in range(1, term_months + 1):
            interest_payment = remaining_balance * monthly_interest_rate
            principal_payment = monthly_payment - interest_payment
            
            remaining_balance -= principal_payment
            
            total_principal += principal_payment
            total_interest += interest_payment
            
            schedule_item = {
                'payment_number': month,
                'principal': principal_payment.quantize(Decimal('0.01')),
                'interest': interest_payment.quantize(Decimal('0.01')),
                'total_payment': monthly_payment.quantize(Decimal('0.01')),
                'remaining_balance': remaining_balance.quantize(Decimal('0.01')),
                'is_adjudication': False
            }
            payment_schedule.append(schedule_item)
        
        results = {
            'down_payment': down_payment.quantize(Decimal('0.01')),
            'financed_amount': financed_amount.quantize(Decimal('0.01')),
            'monthly_payment': monthly_payment.quantize(Decimal('0.01')),
            'total_principal': total_principal.quantize(Decimal('0.01')),
            'total_interest': total_interest.quantize(Decimal('0.01')),
            'total_amount': (down_payment + total_principal + total_interest).quantize(Decimal('0.01')),
            'payment_schedule': payment_schedule
        }
        
        return results
    
    @classmethod
    def save_simulation(cls, user, product, plan, term_months, total_price, results):
        """
        Save a financing simulation to database
        
        Args:
            user: User who created the simulation
            product: Product being financed
            plan: Financing plan used
            term_months: Term length in months
            total_price: Total price of the product
            results: Calculation results
            
        Returns:
            FinancingSimulation: The saved simulation
        """
        # Create the simulation record
        if plan.plan_type == 'programmed':
            simulation = FinancingSimulation.objects.create(
                user=user,
                product=product,
                plan=plan,
                term_months=term_months,
                total_price=total_price,
                down_payment=Decimal('0.00'),
                monthly_payment=results['monthly_payment'],
                adjudication_payment=results['adjudication_payment'],
                adjudication_month=results['adjudication_month'],
                total_interest=results['total_interest'],
                total_amount=results['total_amount']
            )
        else:  # immediate
            simulation = FinancingSimulation.objects.create(
                user=user,
                product=product,
                plan=plan,
                term_months=term_months,
                total_price=total_price,
                down_payment=results['down_payment'],
                monthly_payment=results['monthly_payment'],
                total_interest=results['total_interest'],
                total_amount=results['total_amount']
            )
        
        # Create payment schedule records
        start_date = date.today()
        
        for item in results['payment_schedule']:
            payment_date = start_date + timedelta(days=30 * item['payment_number'])
            
            PaymentSchedule.objects.create(
                simulation=simulation,
                payment_number=item['payment_number'],
                payment_date=payment_date,
                principal=item['principal'],
                interest=item['interest'],
                total_payment=item['total_payment'],
                remaining_balance=item['remaining_balance'],
                is_adjudication=item['is_adjudication']
            )
        
        return simulation

def calculate_financing(
    product_id, 
    plan_id, 
    term_months, 
    down_payment=None, 
    simulation_date=None
):
    """
    Calcula opciones de financiamiento para un producto con un plan específico.
    
    Args:
        product_id: ID del producto a financiar
        plan_id: ID del plan de financiamiento a utilizar
        term_months: Plazo del financiamiento en meses
        down_payment: Pago inicial (opcional, solo para adjudicación inmediata)
        simulation_date: Fecha de inicio de la simulación (por defecto, la fecha actual)
        
    Returns:
        dict: Detalles del financiamiento calculado
    """
    try:
        product = Product.objects.get(id=product_id)
        plan = FinancingPlan.objects.get(id=plan_id)
    except (Product.DoesNotExist, FinancingPlan.DoesNotExist):
        return {"error": "Producto o plan de financiamiento no encontrado"}
        
    if term_months < plan.min_term or term_months > plan.max_term:
        return {"error": f"El plazo debe estar entre {plan.min_term} y {plan.max_term} meses"}
    
    # Usar la fecha actual si no se proporciona una
    if simulation_date is None:
        simulation_date = timezone.now().date()
        
    total_price = product.price
    annual_interest_rate = plan.interest_rate / Decimal('100')
    monthly_interest_rate = annual_interest_rate / Decimal('12')
    
    # Diferentes cálculos según el tipo de plan
    if plan.plan_type == 'programmed':
        # Compra Programada con Adjudicación al 45%
        adjudication_percentage = plan.adjudication_percentage / Decimal('100')
        adjudication_amount = total_price * adjudication_percentage
        
        # Calcular pago mensual simple (sin interés en la etapa de adjudicación)
        monthly_payment = adjudication_amount / Decimal(term_months)
        
        # Calcular el mes de adjudicación (cuándo se llega al porcentaje)
        adjudication_month = int((adjudication_amount / monthly_payment).quantize(Decimal('1')))
        
        # Calcular pago de adjudicación (el vehículo menos lo pagado)
        adjudication_payment = total_price - (monthly_payment * adjudication_month)
        
        # Crear cronograma de pagos
        payments = []
        accumulated = Decimal('0')
        current_date = simulation_date
        
        for i in range(1, term_months + 1):
            is_adjudication = (i == adjudication_month)
            payment_amount = monthly_payment
            
            # Si es el mes de adjudicación, añadir el pago de adjudicación
            if is_adjudication:
                payment_amount = monthly_payment + adjudication_payment
                
            accumulated += monthly_payment
            remaining = total_price - accumulated
            
            payments.append({
                "payment_number": i,
                "payment_date": current_date,
                "principal": monthly_payment,
                "interest": Decimal('0'),  # No hay interés en la etapa inicial
                "total_payment": payment_amount,
                "remaining_balance": remaining if remaining > 0 else Decimal('0'),
                "is_adjudication": is_adjudication
            })
            
            current_date = current_date + relativedelta(months=1)
            
        # Cálculos totales
        total_payments = sum(p["total_payment"] for p in payments)
        total_interest = Decimal('0')  # No hay interés en este plan
            
        return {
            "product": {
                "id": product.id,
                "name": product.name,
                "price": float(product.price)
            },
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "type": plan.plan_type
            },
            "financing_details": {
                "term_months": term_months,
                "monthly_payment": float(monthly_payment),
                "adjudication_month": adjudication_month,
                "adjudication_payment": float(adjudication_payment),
                "adjudication_percentage": float(plan.adjudication_percentage),
                "total_interest": float(total_interest),
                "total_amount": float(total_payments)
            },
            "payment_schedule": [
                {
                    "payment_number": p["payment_number"],
                    "payment_date": p["payment_date"].strftime("%Y-%m-%d"),
                    "principal": float(p["principal"]),
                    "interest": float(p["interest"]),
                    "total_payment": float(p["total_payment"]),
                    "remaining_balance": float(p["remaining_balance"]),
                    "is_adjudication": p["is_adjudication"]
                }
                for p in payments
            ]
        }
        
    elif plan.plan_type == 'immediate':
        # Crédito de Adjudicación Inmediata
        
        # Validar pago inicial
        min_down_payment = total_price * (plan.down_payment_percentage / Decimal('100'))
        if down_payment is None:
            down_payment = min_down_payment
        elif down_payment < min_down_payment:
            return {"error": f"El pago inicial debe ser al menos {float(min_down_payment)} ({plan.down_payment_percentage}%)"}
            
        # Calcular monto a financiar
        finance_amount = total_price - down_payment
        
        # Calcular cuota mensual con interés (fórmula de amortización)
        if monthly_interest_rate == 0:
            monthly_payment = finance_amount / Decimal(term_months)
        else:
            factor = ((1 + monthly_interest_rate) ** term_months)
            monthly_payment = finance_amount * (monthly_interest_rate * factor) / (factor - 1)
        
        # Crear cronograma de pagos
        payments = []
        current_date = simulation_date
        remaining_balance = finance_amount
        
        for i in range(1, term_months + 1):
            interest_payment = remaining_balance * monthly_interest_rate
            principal_payment = monthly_payment - interest_payment
            
            if i == term_months:  # Último pago - ajustar por redondeo
                principal_payment = remaining_balance
                monthly_payment = principal_payment + interest_payment
                
            remaining_balance -= principal_payment
            
            if remaining_balance < 0:
                remaining_balance = Decimal('0')
                
            payments.append({
                "payment_number": i,
                "payment_date": current_date,
                "principal": principal_payment,
                "interest": interest_payment,
                "total_payment": monthly_payment,
                "remaining_balance": remaining_balance,
                "is_adjudication": False
            })
            
            current_date = current_date + relativedelta(months=1)
        
        # Cálculos totales
        total_payments = down_payment + sum(p["total_payment"] for p in payments)
        total_interest = sum(p["interest"] for p in payments)
        
        return {
            "product": {
                "id": product.id,
                "name": product.name,
                "price": float(product.price)
            },
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "type": plan.plan_type
            },
            "financing_details": {
                "term_months": term_months,
                "monthly_payment": float(monthly_payment),
                "down_payment": float(down_payment),
                "down_payment_percentage": float(plan.down_payment_percentage),
                "financed_amount": float(finance_amount),
                "total_interest": float(total_interest),
                "total_amount": float(total_payments)
            },
            "payment_schedule": [
                {
                    "payment_number": p["payment_number"],
                    "payment_date": p["payment_date"].strftime("%Y-%m-%d"),
                    "principal": float(p["principal"]),
                    "interest": float(p["interest"]),
                    "total_payment": float(p["total_payment"]),
                    "remaining_balance": float(p["remaining_balance"]),
                    "is_adjudication": p["is_adjudication"]
                }
                for p in payments
            ]
        }
        
    else:
        return {"error": "Tipo de plan no soportado"}

def save_financing_simulation(user, simulation_data):
    """
    Guarda una simulación de financiamiento en la base de datos.
    
    Args:
        user: Usuario que realiza la simulación
        simulation_data: Datos de la simulación calculada
        
    Returns:
        FinancingSimulation: La simulación guardada
    """
    product_id = simulation_data["product"]["id"]
    plan_id = simulation_data["plan"]["id"]
    details = simulation_data["financing_details"]
    
    try:
        product = Product.objects.get(id=product_id)
        plan = FinancingPlan.objects.get(id=plan_id)
    except (Product.DoesNotExist, FinancingPlan.DoesNotExist):
        return None
    
    # Crear la simulación
    simulation = FinancingSimulation.objects.create(
        user=user,
        product=product,
        plan=plan,
        term_months=details["term_months"],
        total_price=product.price,
        down_payment=details.get("down_payment", Decimal('0')),
        monthly_payment=details["monthly_payment"],
        adjudication_month=details.get("adjudication_month"),
        adjudication_payment=details.get("adjudication_payment"),
        total_interest=details["total_interest"],
        total_amount=details["total_amount"]
    )
    
    # Guardar el cronograma de pagos
    for payment_data in simulation_data["payment_schedule"]:
        PaymentSchedule.objects.create(
            simulation=simulation,
            payment_number=payment_data["payment_number"],
            payment_date=date.fromisoformat(payment_data["payment_date"]),
            principal=payment_data["principal"],
            interest=payment_data["interest"],
            total_payment=payment_data["total_payment"],
            remaining_balance=payment_data["remaining_balance"],
            is_adjudication=payment_data["is_adjudication"]
        )
    
    return simulation

def get_saved_simulations(user, limit=5):
    """
    Obtiene las simulaciones guardadas de un usuario.
    
    Args:
        user: Usuario del cual obtener las simulaciones
        limit: Límite de simulaciones a retornar (por defecto 5)
        
    Returns:
        QuerySet: Las simulaciones del usuario
    """
    return FinancingSimulation.objects.filter(user=user).order_by('-created_at')[:limit] 