from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import PointsConfig, PointTransaction, UserPointsSummary

User = get_user_model()

class PointsCalculator:
    """Service for calculating and managing client points"""
    
    @classmethod
    def calculate_points_for_payment(cls, payment):
        """
        Calculate points for a payment based on its timeliness
        
        Args:
            payment: PaymentTransaction instance
        
        Returns:
            PointsTransaction: The created points transaction or None
        """
        # Only process verified payments
        if payment.status != 'verified':
            return None
        
        # Get the client
        user = payment.application.user
        
        # Get or create client points profile
        points_profile, created = UserPointsSummary.objects.get_or_create(
            user=user,
            defaults={'current_points': cls.get_initial_points()}
        )
        
        # Get configuration
        config = cls.get_configuration()
        
        # Find the scheduled payment this payment corresponds to
        scheduled_payment = None
        payment_schedule = payment.application.payment_schedule.filter(is_paid=False).order_by('payment_number')
        
        if payment_schedule.exists():
            scheduled_payment = payment_schedule.first()
        
        # Calculate points based on timeliness
        transaction_type = 'manual_adjustment'
        points_amount = 0
        notes = ""
        
        if scheduled_payment:
            # Calculate days from due date
            days_late = (payment.payment_date - scheduled_payment.due_date).days
            
            # Determine payment category (green, yellow, red)
            if days_late <= 0:
                # On-time or early payment (green)
                transaction_type = 'green_payment'
                points_amount = config.green_payment_points
                notes = f"On-time payment for {payment.application.reference_number}"
                
                # Additional points for early payment (at least 3 days before due date)
                if days_late <= -3:
                    points_profile.add_points(
                        config.early_payment_points,
                        'early_payment',
                        f"Payment made {abs(days_late)} days before due date",
                        payment
                    )
            
            elif days_late <= config.yellow_days_max:
                # Slightly late payment (yellow)
                transaction_type = 'yellow_payment'
                points_amount = config.yellow_payment_points
                notes = f"Slightly late payment ({days_late} days) for {payment.application.reference_number}"
            else:
                # Late payment (red)
                transaction_type = 'red_payment'
                points_amount = config.red_payment_points
                notes = f"Late payment ({days_late} days) for {payment.application.reference_number}"
            
            # Mark scheduled payment as paid
            scheduled_payment.mark_as_paid(payment)
            
            # Check for double payment (paying current + next payment)
            if payment.amount >= (scheduled_payment.amount * 1.9) and payment_schedule.count() > 1:
                next_payment = payment_schedule.all()[1]
                next_payment.mark_as_paid(payment)
                
                # Award bonus points for double payment
                points_profile.add_points(
                    config.double_payment_points,
                    'double_payment',
                    f"Double payment for {payment.application.reference_number}",
                    payment
                )
        else:
            # Handle payments without scheduled payments (like down payments)
            transaction_type = 'green_payment'
            points_amount = config.green_payment_points
            notes = f"{payment.get_payment_type_display()} for {payment.application.reference_number}"
        
        # Add points to client profile
        transaction = points_profile.add_points(
            points_amount,
            transaction_type,
            notes,
            payment
        )
        
        return transaction
    
    @classmethod
    def add_educational_points(cls, user):
        """
        Add points for completing educational course
        
        Args:
            user: User instance
        
        Returns:
            PointsTransaction: The created points transaction
        """
        # Get or create client points profile
        points_profile, created = UserPointsSummary.objects.get_or_create(
            user=user,
            defaults={'current_points': cls.get_initial_points()}
        )
        
        # Get configuration
        config = cls.get_configuration()
        
        # Add educational points
        transaction = points_profile.add_points(
            config.educational_course_points,
            'educational',
            "Completed educational course"
        )
        
        return transaction
    
    @classmethod
    def add_manual_adjustment(cls, user, points_amount, notes):
        """
        Manually adjust client points (by admin)
        
        Args:
            user: User instance
            points_amount: Amount of points to add/subtract
            notes: Reason for adjustment
            
        Returns:
            PointsTransaction: The created points transaction
        """
        # Get or create client points profile
        points_profile, created = UserPointsSummary.objects.get_or_create(
            user=user,
            defaults={'current_points': cls.get_initial_points()}
        )
        
        # Add manual adjustment
        transaction = points_profile.add_points(
            points_amount,
            'manual_adjustment',
            notes
        )
        
        return transaction
    
    @classmethod
    def get_configuration(cls):
        """Get current points configuration"""
        config = PointsConfiguration.objects.first()
        if not config:
            # Create default configuration if it doesn't exist
            config = PointsConfiguration.objects.create()
        return config
    
    @classmethod
    def get_initial_points(cls):
        """Get initial points for new clients"""
        config = cls.get_configuration()
        return config.initial_points
    
    @classmethod
    def create_initial_points(cls, user):
        """Create initial points for a new user"""
        # Check if user already has points
        if hasattr(user, 'points_profile'):
            return user.points_profile
        
        # Create new points profile
        initial_points = cls.get_initial_points()
        points_profile = UserPointsSummary.objects.create(
            user=user,
            current_points=initial_points
        )
        
        # Record initial points transaction
        PointsTransaction.objects.create(
            user=points_profile.user,
            transaction_type='initial',
            points_amount=initial_points,
            notes="Initial points for new client"
        )
        
        return points_profile 

def get_user_points_summary(user):
    """
    Get a user's points summary, creating it if it doesn't exist.
    
    Args:
        user: The user to get the summary for
        
    Returns:
        UserPointsSummary: The user's points summary
    """
    summary, created = UserPointsSummary.objects.get_or_create(user=user)
    
    if created:
        # Initialize with the default starting points
        config = PointsConfig.get_active_config()
        add_points(
            user=user,
            points=config.initial_points,
            transaction_type='initial',
            reason='Initial points for new user'
        )
    
    return summary


def calculate_user_points(user):
    """
    Calculate a user's current points based on all transactions.
    This is used to recalculate points if needed.
    
    Args:
        user: The user to calculate points for
        
    Returns:
        int: The total points
    """
    transactions = PointTransaction.objects.filter(user=user)
    total_points = sum(t.points_amount for t in transactions)
    positive_points = sum(t.points_amount for t in transactions if t.points_amount > 0)
    
    # Update the summary
    summary, _ = UserPointsSummary.objects.get_or_create(user=user)
    summary.current_points = total_points
    summary.lifetime_points = positive_points
    summary.save()
    
    return total_points


def add_points(user, points, transaction_type, reason='', payment=None, created_by=None):
    """
    Add (or subtract) points to a user and record the transaction.
    
    Args:
        user: The user to add points to
        points: The number of points to add (can be negative)
        transaction_type: The type of transaction
        reason: Optional reason for the transaction
        payment: Optional related payment
        created_by: Optional user who created this transaction (for manual adjustments)
        
    Returns:
        PointTransaction: The created transaction
    """
    with transaction.atomic():
        # Create the transaction
        point_transaction = PointTransaction.objects.create(
            user=user,
            points_amount=points,
            transaction_type=transaction_type,
            reason=reason,
            payment=payment,
            created_by=created_by
        )
        
        # Update the summary
        summary, _ = UserPointsSummary.objects.get_or_create(user=user)
        summary.current_points += points
        if points > 0:
            summary.lifetime_points += points
        summary.save()
        
        return point_transaction


def get_points_for_payment(payment):
    """
    Calculate the points to award/deduct for a payment based on its timeliness.
    
    Args:
        payment: The payment object
        
    Returns:
        tuple: (points, transaction_type, reason)
    """
    config = PointsConfig.get_active_config()
    
    # Check if it's an advance payment (before due date)
    if payment.payment_date < payment.due_date:
        return (
            config.advance_payment_points,
            'advance_payment',
            'Payment made before due date'
        )
    
    # Calculate days late
    days_late = (payment.payment_date - payment.due_date).days
    
    if days_late <= 0:
        # On time payment
        return (
            config.on_time_payment_points,
            'on_time_payment',
            'Payment made on time'
        )
    elif days_late <= 5:
        # Late payment (1-5 days)
        return (
            config.late_payment_points,
            'late_payment',
            f'Payment made {days_late} days late'
        )
    else:
        # Very late payment (>5 days)
        return (
            config.very_late_payment_points,
            'very_late_payment',
            f'Payment made {days_late} days late'
        )


def process_payment_points(payment, created_by=None):
    """Process points for a verified payment"""
    if not payment.is_verified:
        return None
    
    user = payment.user
    config = PointsConfig.get_active_config()
    
    # Get or create user points summary
    summary, created = UserPointsSummary.objects.get_or_create(
        user=user,
        defaults={
            'current_points': config.initial_points,
            'lifetime_points': config.initial_points
        }
    )
    
    # Determine transaction type and points amount
    transaction_type = 'manual_adjustment'
    points_amount = 0
    reason = ""
    
    # Check if payment has a due date for determining if it's on time or late
    if payment.due_date:
        days_late = (payment.payment_date - payment.due_date).days
        
        if days_late <= 0:
            # On time payment (or early)
            transaction_type = 'on_time_payment'
            points_amount = config.on_time_payment_points
            reason = "On-time payment"
            
            # Check if it's an advance payment (more than 3 days early)
            if days_late < -3:
                transaction_type = 'advance_payment'
                points_amount += config.advance_payment_points
                reason = "Advance payment (more than 3 days early)"
        elif days_late <= 5:
            # Late payment (1-5 days)
            transaction_type = 'late_payment'
            points_amount = config.late_payment_points
            reason = f"Late payment ({days_late} days)"
        else:
            # Very late payment (>5 days)
            transaction_type = 'very_late_payment'
            points_amount = config.very_late_payment_points
            reason = f"Very late payment ({days_late} days)"
    else:
        # No due date, assume on time
        transaction_type = 'on_time_payment'
        points_amount = config.on_time_payment_points
        reason = "Payment without due date (assumed on time)"
    
    # Check for double payment
    if payment.payment_type == 'double':
        transaction_type = 'double_payment'
        points_amount += config.double_payment_points
        reason = "Double payment bonus"
    
    # Create transaction and update points summary
    with transaction.atomic():
        # Create transaction
        point_transaction = PointTransaction.objects.create(
            user=user,
            transaction_type=transaction_type,
            points_amount=points_amount,
            payment=payment,
            reason=reason,
            created_by=created_by
        )
        
        # Update summary
        summary.current_points += points_amount
        summary.lifetime_points += max(0, points_amount)  # Only add positive points to lifetime
        summary.save()
    
    return point_transaction


def get_waiting_days_for_user(user):
    """
    Get the number of waiting days for a user based on their current points.
    
    Args:
        user: The user to check
        
    Returns:
        dict: Information about waiting days and status
    """
    summary = get_user_points_summary(user)
    config = PointsConfig.get_active_config()
    
    waiting_days = summary.get_waiting_days()
    status = summary.get_status_label()
    
    # Calculate points needed for next level
    if summary.current_points < config.poor_threshold:
        next_threshold = config.poor_threshold
        next_level = "Bajo"
        points_needed = next_threshold - summary.current_points
    elif summary.current_points < config.average_threshold:
        next_threshold = config.average_threshold
        next_level = "Promedio"
        points_needed = next_threshold - summary.current_points
    elif summary.current_points < config.good_threshold:
        next_threshold = config.good_threshold
        next_level = "Bueno"
        points_needed = next_threshold - summary.current_points
    elif summary.current_points < config.excellent_threshold:
        next_threshold = config.excellent_threshold
        next_level = "Excelente"
        points_needed = next_threshold - summary.current_points
    else:
        next_threshold = None
        next_level = None
        points_needed = 0
    
    return {
        'current_points': summary.current_points,
        'waiting_days': waiting_days,
        'status': status,
        'next_level': next_level,
        'points_needed': points_needed,
        'lifetime_points': summary.lifetime_points
    }


def add_educational_course_points(user, created_by=None):
    """Add points for completing an educational course"""
    config = PointsConfig.get_active_config()
    
    # Get or create user points summary
    summary, created = UserPointsSummary.objects.get_or_create(
        user=user,
        defaults={
            'current_points': config.initial_points,
            'lifetime_points': config.initial_points
        }
    )
    
    # Points for educational course
    points_amount = config.educational_course_points
    
    # Create transaction and update points summary
    with transaction.atomic():
        # Create transaction
        point_transaction = PointTransaction.objects.create(
            user=user,
            transaction_type='educational_course',
            points_amount=points_amount,
            reason="Completed educational course",
            created_by=created_by
        )
        
        # Update summary
        summary.current_points += points_amount
        summary.lifetime_points += points_amount
        summary.save()
    
    return point_transaction


def add_manual_adjustment(user, points_amount, reason, created_by):
    """Add a manual adjustment to user points"""
    if not reason:
        reason = "Manual adjustment"
    
    # Get or create user points summary
    summary, created = UserPointsSummary.objects.get_or_create(
        user=user,
        defaults={
            'current_points': PointsConfig.get_active_config().initial_points,
            'lifetime_points': PointsConfig.get_active_config().initial_points
        }
    )
    
    # Create transaction and update points summary
    with transaction.atomic():
        # Create transaction
        point_transaction = PointTransaction.objects.create(
            user=user,
            transaction_type='manual_adjustment',
            points_amount=points_amount,
            reason=reason,
            created_by=created_by
        )
        
        # Update summary
        summary.current_points += points_amount
        if points_amount > 0:
            summary.lifetime_points += points_amount
        summary.save()
    
    return point_transaction


def get_user_waiting_days(user):
    """
    Calcula los días de espera basados en los puntos actuales del usuario.
    """
    summary, created = UserPointsSummary.objects.get_or_create(
        user=user,
        defaults={'current_points': PointsConfig.get_active_config().initial_points, 
                  'lifetime_points': PointsConfig.get_active_config().initial_points}
    )
    
    return summary.get_waiting_days(), summary.get_status_label()

def initialize_user_points(user):
    """
    Inicializa los puntos para un nuevo usuario.
    """
    config = PointsConfig.get_active_config()
    
    # Crear el resumen de puntos para el usuario
    summary, created = UserPointsSummary.objects.get_or_create(
        user=user,
        defaults={'current_points': config.initial_points, 'lifetime_points': config.initial_points}
    )
    
    # Si el usuario ya existe pero no tiene una transacción inicial, créala
    if not PointTransaction.objects.filter(user=user, transaction_type='initial').exists():
        PointTransaction.objects.create(
            user=user,
            transaction_type='initial',
            points_amount=config.initial_points,
            reason='Puntos iniciales al registrarse'
        )
    
    return summary 