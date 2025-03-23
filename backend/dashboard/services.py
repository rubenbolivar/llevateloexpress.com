from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg, Q, F, ExpressionWrapper, fields
from django.utils import timezone
from django.contrib.auth import get_user_model
from applications.models import CreditApplication
from payments.models import PaymentTransaction, PaymentSchedule, Payment
from points_system.models import ClientPoints, PointsTransaction, UserPointsSummary
from products.models import Product, Category
from accounts.models import User
from django.db.models.functions import TruncMonth, TruncDay, TruncWeek, Cast, ExtractYear, ExtractMonth

User = get_user_model()

class DashboardAnalytics:
    """Service for generating dashboard analytics"""
    
    @classmethod
    def get_user_statistics(cls, date_from=None, date_to=None):
        """Get user registration and activity statistics"""
        queryset = User.objects.all()
        
        if date_from:
            queryset = queryset.filter(date_joined__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_joined__lte=date_to)
        
        total_users = queryset.count()
        verified_users = queryset.filter(is_verified=True).count()
        
        # Users with active applications
        users_with_applications = User.objects.filter(
            applications__isnull=False
        ).distinct().count()
        
        # New users in the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_users_last_30_days = User.objects.filter(
            date_joined__gte=thirty_days_ago
        ).count()
        
        return {
            'total_users': total_users,
            'verified_users': verified_users,
            'users_with_applications': users_with_applications,
            'new_users_last_30_days': new_users_last_30_days,
            'verification_rate': (verified_users / total_users) if total_users > 0 else 0
        }
    
    @classmethod
    def get_application_statistics(cls, date_from=None, date_to=None):
        """Get financing application statistics"""
        queryset = CreditApplication.objects.all()
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        total_applications = queryset.count()
        approved_applications = queryset.filter(status='approved').count()
        pending_applications = queryset.filter(status='pending').count()
        rejected_applications = queryset.filter(status='rejected').count()
        
        # Applications by plan type
        applications_by_plan = queryset.values(
            'financing_plan__name', 'financing_plan__plan_type'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Applications by product category
        applications_by_category = queryset.values(
            'product__category__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Approval rate
        approval_rate = (approved_applications / total_applications) if total_applications > 0 else 0
        
        return {
            'total_applications': total_applications,
            'approved_applications': approved_applications,
            'pending_applications': pending_applications,
            'rejected_applications': rejected_applications,
            'approval_rate': approval_rate,
            'applications_by_plan': list(applications_by_plan),
            'applications_by_category': list(applications_by_category)
        }
    
    @classmethod
    def get_payment_statistics(cls, date_from=None, date_to=None):
        """Get payment statistics"""
        queryset = PaymentTransaction.objects.all()
        
        if date_from:
            queryset = queryset.filter(transaction_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(transaction_date__lte=date_to)
        
        total_payments = queryset.count()
        verified_payments = queryset.filter(status='verified').count()
        rejected_payments = queryset.filter(status='rejected').count()
        pending_payments = queryset.filter(status='pending').count()
        
        # Total amounts
        total_amount = queryset.filter(status='verified').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Payments by type
        payments_by_type = queryset.filter(status='verified').values(
            'payment_type'
        ).annotate(
            count=Count('id'),
            total=Sum('amount')
        ).order_by('-total')
        
        # Late payments (for verified payments linked to scheduled payments)
        late_payments_count = 0
        on_time_payments_count = 0
        
        for payment in queryset.filter(status='verified', scheduled_payment__isnull=False):
            scheduled_payment = payment.scheduled_payment
            if payment.transaction_date > scheduled_payment.due_date:
                late_payments_count += 1
            else:
                on_time_payments_count += 1
        
        # Verification rate
        verification_rate = (verified_payments / total_payments) if total_payments > 0 else 0
        
        # On-time payment rate
        total_linked_payments = late_payments_count + on_time_payments_count
        on_time_rate = (on_time_payments_count / total_linked_payments) if total_linked_payments > 0 else 0
        
        return {
            'total_payments': total_payments,
            'verified_payments': verified_payments,
            'rejected_payments': rejected_payments,
            'pending_payments': pending_payments,
            'total_amount': total_amount,
            'verification_rate': verification_rate,
            'on_time_payments': on_time_payments_count,
            'late_payments': late_payments_count,
            'on_time_rate': on_time_rate,
            'payments_by_type': list(payments_by_type)
        }
    
    @classmethod
    def get_points_statistics(cls):
        """Get points system statistics"""
        # Get points distribution
        points_profiles = ClientPoints.objects.all()
        total_profiles = points_profiles.count()
        
        if total_profiles == 0:
            return {
                'total_profiles': 0,
                'average_points': 0,
                'points_distribution': [],
                'transaction_types': []
            }
        
        # Average points
        average_points = points_profiles.aggregate(
            avg=Avg('current_points')
        )['avg'] or 0
        
        # Points distribution
        excellent_points = points_profiles.filter(
            current_points__gte=100
        ).count()
        
        good_points = points_profiles.filter(
            current_points__gte=80,
            current_points__lt=100
        ).count()
        
        regular_points = points_profiles.filter(
            current_points__gte=60,
            current_points__lt=80
        ).count()
        
        poor_points = points_profiles.filter(
            current_points__gte=40,
            current_points__lt=60
        ).count()
        
        critical_points = points_profiles.filter(
            current_points__lt=40
        ).count()
        
        # Points transactions by type
        transactions_by_type = PointsTransaction.objects.values(
            'transaction_type'
        ).annotate(
            count=Count('id'),
            total_points=Sum('points_amount')
        ).order_by('-count')
        
        return {
            'total_profiles': total_profiles,
            'average_points': average_points,
            'points_distribution': [
                {'name': 'Excellent (100+)', 'count': excellent_points, 'percentage': excellent_points / total_profiles},
                {'name': 'Good (80-99)', 'count': good_points, 'percentage': good_points / total_profiles},
                {'name': 'Regular (60-79)', 'count': regular_points, 'percentage': regular_points / total_profiles},
                {'name': 'Poor (40-59)', 'count': poor_points, 'percentage': poor_points / total_profiles},
                {'name': 'Critical (<40)', 'count': critical_points, 'percentage': critical_points / total_profiles}
            ],
            'transaction_types': list(transactions_by_type)
        }
    
    @classmethod
    def get_product_statistics(cls):
        """Get product statistics"""
        # Product count by category
        products_by_category = Product.objects.values(
            'category__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Most applied-for products
        popular_products = Product.objects.annotate(
            applications_count=Count('credit_applications')
        ).filter(
            applications_count__gt=0
        ).order_by('-applications_count')[:10]
        
        popular_products_data = [
            {
                'id': product.id,
                'name': product.name,
                'brand': product.brand.name,
                'applications_count': product.applications_count,
                'price': str(product.price)
            }
            for product in popular_products
        ]
        
        # Products by availability
        products_by_availability = Product.objects.values(
            'availability'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'total_products': Product.objects.count(),
            'products_by_category': list(products_by_category),
            'popular_products': popular_products_data,
            'products_by_availability': list(products_by_availability)
        }
    
    @classmethod
    def get_dashboard_summary(cls):
        """Get a summary of key metrics for the dashboard"""
        # Key user metrics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Key application metrics
        total_applications = CreditApplication.objects.count()
        approved_applications = CreditApplication.objects.filter(status='approved').count()
        
        # Key payment metrics
        verified_payments = PaymentTransaction.objects.filter(status='verified').count()
        total_payment_amount = PaymentTransaction.objects.filter(status='verified').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Key product metrics
        total_products = Product.objects.count()
        in_stock_products = Product.objects.filter(availability='in_stock').count()
        
        # Recent activity
        recent_applications = CreditApplication.objects.order_by('-created_at')[:5]
        recent_applications_data = [
            {
                'id': app.id,
                'reference_number': app.reference_number,
                'product_name': app.product.name,
                'user': app.user.get_full_name() or app.user.username,
                'status': app.get_status_display(),
                'created_at': app.created_at.isoformat()
            }
            for app in recent_applications
        ]
        
        recent_payments = PaymentTransaction.objects.order_by('-created_at')[:5]
        recent_payments_data = [
            {
                'id': payment.id,
                'reference_number': payment.reference_number,
                'application': payment.application.reference_number,
                'amount': str(payment.amount),
                'status': payment.get_status_display(),
                'transaction_date': payment.transaction_date.isoformat()
            }
            for payment in recent_payments
        ]
        
        return {
            'user_metrics': {
                'total_users': total_users,
                'active_users': active_users,
                'activity_rate': (active_users / total_users) if total_users > 0 else 0
            },
            'application_metrics': {
                'total_applications': total_applications,
                'approved_applications': approved_applications,
                'approval_rate': (approved_applications / total_applications) if total_applications > 0 else 0
            },
            'payment_metrics': {
                'verified_payments': verified_payments,
                'total_payment_amount': total_payment_amount
            },
            'product_metrics': {
                'total_products': total_products,
                'in_stock_products': in_stock_products,
                'in_stock_rate': (in_stock_products / total_products) if total_products > 0 else 0
            },
            'recent_activity': {
                'applications': recent_applications_data,
                'payments': recent_payments_data
            }
        }

def get_dashboard_stats():
    """
    Obtiene estadísticas generales para el dashboard administrativo.
    
    Returns:
        dict: Estadísticas para el dashboard
    """
    now = timezone.now()
    month_ago = now - timedelta(days=30)
    
    # Estadísticas de usuarios
    total_users = User.objects.count()
    new_users_month = User.objects.filter(date_joined__gte=month_ago).count()
    
    # Estadísticas de productos
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    
    # Estadísticas de solicitudes
    total_applications = CreditApplication.objects.count()
    pending_applications = CreditApplication.objects.filter(
        status__in=['submitted', 'in_review', 'additional_info_required']
    ).count()
    approved_applications = CreditApplication.objects.filter(status='approved').count()
    
    # Estadísticas de pagos
    total_payments = Payment.objects.count()
    pending_payments = Payment.objects.filter(status='pending').count()
    verified_payments = Payment.objects.filter(status='verified').count()
    total_amount = Payment.objects.filter(status='verified').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    return {
        'users': {
            'total': total_users,
            'new_month': new_users_month
        },
        'products': {
            'total': total_products,
            'active': active_products
        },
        'applications': {
            'total': total_applications,
            'pending': pending_applications,
            'approved': approved_applications
        },
        'payments': {
            'total': total_payments,
            'pending': pending_payments,
            'verified': verified_payments,
            'total_amount': float(total_amount)
        }
    }

def get_sales_stats(period='month'):
    """
    Obtiene estadísticas de ventas por período.
    
    Args:
        period: Período de tiempo ('week', 'month', 'year')
        
    Returns:
        dict: Estadísticas de ventas
    """
    now = timezone.now()
    
    if period == 'week':
        start_date = now - timedelta(days=7)
        group_by = 'day'
    elif period == 'month':
        start_date = now - timedelta(days=30)
        group_by = 'day'
    elif period == 'year':
        start_date = now - timedelta(days=365)
        group_by = 'month'
    else:
        start_date = now - timedelta(days=30)
        group_by = 'day'
    
    # Obtener datos de solicitudes aprobadas
    approved_applications = CreditApplication.objects.filter(
        status='approved',
        approved_at__gte=start_date
    )
    
    # Agrupar por período
    if group_by == 'day':
        sales_data = {}
        for app in approved_applications:
            day = app.approved_at.date()
            if day not in sales_data:
                sales_data[day] = {
                    'count': 0,
                    'amount': 0
                }
            sales_data[day]['count'] += 1
            sales_data[day]['amount'] += float(app.amount)
        
        # Convertir a lista para la respuesta
        result = [
            {
                'date': day.isoformat(),
                'count': data['count'],
                'amount': data['amount']
            }
            for day, data in sorted(sales_data.items())
        ]
    else:  # month
        sales_data = {}
        for app in approved_applications:
            month = datetime(app.approved_at.year, app.approved_at.month, 1).date()
            if month not in sales_data:
                sales_data[month] = {
                    'count': 0,
                    'amount': 0
                }
            sales_data[month]['count'] += 1
            sales_data[month]['amount'] += float(app.amount)
        
        # Convertir a lista para la respuesta
        result = [
            {
                'date': month.isoformat(),
                'count': data['count'],
                'amount': data['amount']
            }
            for month, data in sorted(sales_data.items())
        ]
    
    return result

def get_product_stats():
    """
    Obtiene estadísticas de productos.
    
    Returns:
        dict: Estadísticas de productos
    """
    # Productos más solicitados
    top_products = Product.objects.annotate(
        applications_count=Count('credit_applications')
    ).order_by('-applications_count')[:5]
    
    # Categorías más populares
    top_categories = Category.objects.annotate(
        products_count=Count('products'),
        applications_count=Count('products__credit_applications')
    ).order_by('-applications_count')[:5]
    
    return {
        'top_products': [
            {
                'id': product.id,
                'name': product.name,
                'price': float(product.price),
                'applications_count': product.applications_count
            }
            for product in top_products
        ],
        'top_categories': [
            {
                'id': category.id,
                'name': category.name,
                'products_count': category.products_count,
                'applications_count': category.applications_count
            }
            for category in top_categories
        ]
    }

def get_user_stats():
    """
    Obtiene estadísticas de usuarios.
    
    Returns:
        dict: Estadísticas de usuarios
    """
    # Usuarios con más solicitudes
    top_applicants = User.objects.annotate(
        applications_count=Count('credit_applications')
    ).order_by('-applications_count')[:10]
    
    # Usuarios con más pagos
    top_payers = User.objects.annotate(
        payments_count=Count('payments'),
        payments_amount=Sum('payments__amount')
    ).order_by('-payments_amount')[:10]
    
    # Distribución de puntos
    points_distribution = {
        'excellent': UserPointsSummary.objects.filter(current_points__gte=100).count(),
        'good': UserPointsSummary.objects.filter(current_points__gte=80, current_points__lt=100).count(),
        'average': UserPointsSummary.objects.filter(current_points__gte=60, current_points__lt=80).count(),
        'poor': UserPointsSummary.objects.filter(current_points__gte=40, current_points__lt=60).count(),
        'bad': UserPointsSummary.objects.filter(current_points__lt=40).count()
    }
    
    return {
        'top_applicants': [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'applications_count': user.applications_count
            }
            for user in top_applicants
        ],
        'top_payers': [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'payments_count': user.payments_count,
                'payments_amount': float(user.payments_amount or 0)
            }
            for user in top_payers
        ],
        'points_distribution': points_distribution
    }

def get_application_stats():
    """
    Obtiene estadísticas de solicitudes.
    
    Returns:
        dict: Estadísticas de solicitudes
    """
    # Total por estado
    status_counts = CreditApplication.objects.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Solicitudes por tipo de plan
    plan_counts = CreditApplication.objects.values(
        'financing_plan__plan_type', 
        'financing_plan__name'
    ).annotate(
        count=Count('id')
    ).order_by('financing_plan__plan_type')
    
    # Tiempo promedio de aprobación
    approval_time = CreditApplication.objects.filter(
        status='approved',
        submitted_at__isnull=False,
        approved_at__isnull=False
    ).annotate(
        days=F('approved_at') - F('submitted_at')
    ).aggregate(
        avg_days=Avg('days')
    )
    
    return {
        'status_distribution': {
            item['status']: item['count'] for item in status_counts
        },
        'plan_distribution': [
            {
                'plan_type': item['financing_plan__plan_type'],
                'plan_name': item['financing_plan__name'],
                'count': item['count']
            }
            for item in plan_counts
        ],
        'avg_approval_time': approval_time.get('avg_days') and approval_time['avg_days'].days
    }

def get_payment_stats(period='month'):
    """
    Obtiene estadísticas de pagos.
    
    Args:
        period: Período de tiempo ('week', 'month', 'year')
        
    Returns:
        dict: Estadísticas de pagos
    """
    now = timezone.now()
    
    if period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    # Pagos por estado
    status_counts = Payment.objects.values('status').annotate(
        count=Count('id'),
        amount=Sum('amount')
    )
    
    # Pagos por mes
    payments_by_month = Payment.objects.filter(
        payment_date__gte=start_date
    ).values(
        'payment_date__year', 
        'payment_date__month'
    ).annotate(
        count=Count('id'),
        amount=Sum('amount')
    ).order_by('payment_date__year', 'payment_date__month')
    
    # Puntualidad de pagos
    on_time_count = Payment.objects.filter(
        status='verified',
        payment_date__lte=F('due_date')
    ).count()
    
    late_count = Payment.objects.filter(
        status='verified',
        payment_date__gt=F('due_date')
    ).count()
    
    total_verified = on_time_count + late_count
    on_time_percentage = (on_time_count / total_verified * 100) if total_verified > 0 else 0
    
    return {
        'status_distribution': {
            item['status']: {
                'count': item['count'],
                'amount': float(item['amount'] or 0)
            } 
            for item in status_counts
        },
        'payments_by_month': [
            {
                'year': item['payment_date__year'],
                'month': item['payment_date__month'],
                'date': f"{item['payment_date__year']}-{item['payment_date__month']:02d}",
                'count': item['count'],
                'amount': float(item['amount'] or 0)
            }
            for item in payments_by_month
        ],
        'payment_timeliness': {
            'on_time': on_time_count,
            'late': late_count,
            'on_time_percentage': on_time_percentage
        }
    }

# DASHBOARD OVERVIEW

def get_overview_stats():
    """Get general stats for dashboard overview"""
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    
    # User stats
    total_users = User.objects.filter(is_staff=False).count()
    new_users_month = User.objects.filter(
        is_staff=False,
        date_joined__gte=thirty_days_ago
    ).count()
    
    # Product stats
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    
    # Application stats
    total_applications = CreditApplication.objects.count()
    pending_applications = CreditApplication.objects.filter(
        status__in=['submitted', 'in_review', 'additional_info_required']
    ).count()
    approved_applications = CreditApplication.objects.filter(
        status='approved'
    ).count()
    
    # Payment stats
    total_payments = Payment.objects.count()
    pending_payments = Payment.objects.filter(status='pending').count()
    verified_payments = Payment.objects.filter(status='verified').count()
    total_amount = Payment.objects.filter(status='verified').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    return {
        'users': {
            'total': total_users,
            'new_month': new_users_month
        },
        'products': {
            'total': total_products,
            'active': active_products
        },
        'applications': {
            'total': total_applications,
            'pending': pending_applications,
            'approved': approved_applications
        },
        'payments': {
            'total': total_payments,
            'pending': pending_payments,
            'verified': verified_payments,
            'total_amount': total_amount
        }
    }

# SALES STATS

def get_sales_stats(period='month'):
    """Get sales statistics for a given period"""
    now = timezone.now()
    
    # Set up date range based on period
    if period == 'week':
        start_date = now - timedelta(days=7)
        truncate_func = TruncDay
        date_format = '%Y-%m-%d'
    elif period == 'month':
        start_date = now - timedelta(days=30)
        truncate_func = TruncDay
        date_format = '%Y-%m-%d'
    elif period == 'quarter':
        start_date = now - timedelta(days=90)
        truncate_func = TruncWeek
        date_format = '%Y-%m-%d'
    elif period == 'year':
        start_date = now - timedelta(days=365)
        truncate_func = TruncMonth
        date_format = '%Y-%m-%d'
    else:
        # Default to month
        start_date = now - timedelta(days=30)
        truncate_func = TruncDay
        date_format = '%Y-%m-%d'
    
    # Get approved applications within the date range
    applications = CreditApplication.objects.filter(
        status='approved',
        created_at__gte=start_date,
        created_at__lte=now
    )
    
    # Group by date and count
    sales_by_date = applications.annotate(
        date=truncate_func('created_at')
    ).values('date').annotate(
        count=Count('id'),
        amount=Sum('total_price')
    ).order_by('date')
    
    # Convert to list with properly formatted dates
    result = []
    for item in sales_by_date:
        result.append({
            'date': item['date'].strftime(date_format),
            'count': item['count'],
            'amount': float(item['amount']) if item['amount'] else 0
        })
    
    return result

# PRODUCT STATS

def get_product_stats():
    """Get product-related statistics"""
    # Get top products by number of applications
    top_products = Product.objects.annotate(
        applications_count=Count('applications')
    ).filter(
        applications_count__gt=0
    ).order_by('-applications_count')[:10]
    
    # Get top categories by number of products and applications
    top_categories = Category.objects.annotate(
        products_count=Count('products', distinct=True),
        applications_count=Count('products__applications', distinct=True)
    ).filter(
        products_count__gt=0
    ).order_by('-applications_count')[:5]
    
    # Format results
    products_data = []
    for product in top_products:
        products_data.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'applications_count': product.applications_count
        })
    
    categories_data = []
    for category in top_categories:
        categories_data.append({
            'id': category.id,
            'name': category.name,
            'products_count': category.products_count,
            'applications_count': category.applications_count
        })
    
    return {
        'top_products': products_data,
        'top_categories': categories_data
    }

# USER STATS

def get_user_stats():
    """Get user-related statistics"""
    # Get top applicants
    top_applicants = User.objects.annotate(
        applications_count=Count('applications')
    ).filter(
        applications_count__gt=0,
        is_staff=False
    ).order_by('-applications_count')[:10]
    
    # Get top payers
    top_payers = User.objects.annotate(
        payments_count=Count('payments', filter=Q(payments__status='verified')),
        payments_amount=Sum('payments__amount', filter=Q(payments__status='verified'))
    ).filter(
        payments_count__gt=0,
        is_staff=False
    ).order_by('-payments_amount')[:10]
    
    # Get points distribution
    points_summary = UserPointsSummary.objects.all()
    
    points_distribution = {
        'excellent': points_summary.filter(points__gte=100).count(),
        'good': points_summary.filter(points__gte=80, points__lt=100).count(),
        'average': points_summary.filter(points__gte=60, points__lt=80).count(),
        'poor': points_summary.filter(points__gte=40, points__lt=60).count(),
        'bad': points_summary.filter(points__lt=40).count()
    }
    
    # Format results
    applicants_data = []
    for user in top_applicants:
        applicants_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'applications_count': user.applications_count
        })
    
    payers_data = []
    for user in top_payers:
        payers_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'payments_count': user.payments_count,
            'payments_amount': float(user.payments_amount) if user.payments_amount else 0
        })
    
    return {
        'top_applicants': applicants_data,
        'top_payers': payers_data,
        'points_distribution': points_distribution
    }

# APPLICATION STATS

def get_application_stats():
    """Get application-related statistics"""
    # Get status distribution
    status_counts = CreditApplication.objects.values('status').annotate(
        count=Count('id')
    )
    
    status_distribution = {}
    for item in status_counts:
        status_distribution[item['status']] = item['count']
    
    # Get plan distribution
    plan_distribution = CreditApplication.objects.values(
        'financing_plan__plan_type', 
        'financing_plan__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')
    
    plan_data = []
    for item in plan_distribution:
        if item['financing_plan__plan_type'] and item['financing_plan__name']:
            plan_data.append({
                'plan_type': item['financing_plan__plan_type'],
                'plan_name': item['financing_plan__name'],
                'count': item['count']
            })
    
    # Calculate average approval time
    approved_apps = CreditApplication.objects.filter(
        status='approved',
        submitted_at__isnull=False,
        approved_at__isnull=False
    )
    
    avg_approval_time = approved_apps.annotate(
        approval_time=ExpressionWrapper(
            F('approved_at') - F('submitted_at'),
            output_field=DurationField()
        )
    ).aggregate(avg=Avg('approval_time'))['avg']
    
    avg_days = 0
    if avg_approval_time:
        avg_days = avg_approval_time.total_seconds() / (60*60*24)
    
    return {
        'status_distribution': status_distribution,
        'plan_distribution': plan_data,
        'avg_approval_time': round(avg_days, 1)
    }

# PAYMENT STATS

def get_payment_stats(period='month'):
    """Get payment statistics for a given period"""
    now = timezone.now()
    
    # Set up date range based on period
    if period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'quarter':
        start_date = now - timedelta(days=90)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        # Default to month
        start_date = now - timedelta(days=30)
    
    # Get status distribution with amounts
    status_payments = Payment.objects.values('status').annotate(
        count=Count('id'),
        amount=Sum('amount')
    )
    
    status_distribution = {}
    for item in status_payments:
        status_distribution[item['status']] = {
            'count': item['count'],
            'amount': float(item['amount']) if item['amount'] else 0
        }
    
    # Get payments by month
    payments_by_month = Payment.objects.filter(
        payment_date__gte=start_date
    ).annotate(
        year=ExtractYear('payment_date'),
        month=ExtractMonth('payment_date'),
        date=TruncMonth('payment_date')
    ).values('year', 'month', 'date').annotate(
        count=Count('id'),
        amount=Sum('amount')
    ).order_by('date')
    
    month_data = []
    for item in payments_by_month:
        month_data.append({
            'year': item['year'],
            'month': item['month'],
            'date': item['date'].strftime('%Y-%m-%d'),
            'count': item['count'],
            'amount': float(item['amount']) if item['amount'] else 0
        })
    
    # Get payment timeliness
    on_time_payments = Payment.objects.filter(
        status='verified',
        payment_date__lte=F('due_date')
    ).count()
    
    late_payments = Payment.objects.filter(
        status='verified',
        payment_date__gt=F('due_date')
    ).count()
    
    total_verified = on_time_payments + late_payments
    on_time_percentage = 0
    if total_verified > 0:
        on_time_percentage = (on_time_payments / total_verified) * 100
    
    payment_timeliness = {
        'on_time': on_time_payments,
        'late': late_payments,
        'on_time_percentage': round(on_time_percentage, 1)
    }
    
    return {
        'status_distribution': status_distribution,
        'payments_by_month': month_data,
        'payment_timeliness': payment_timeliness
    } 