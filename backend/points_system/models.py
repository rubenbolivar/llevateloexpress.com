from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from payments.models import Payment

class PointsConfig(models.Model):
    """Configuration for the points system"""
    
    # Initial points for new users
    initial_points = models.IntegerField(_("Initial Points"), default=100)
    
    # Points for different payment scenarios
    on_time_payment_points = models.IntegerField(_("Points for On-Time Payment"), default=5)
    late_payment_points = models.IntegerField(_("Points for Late Payment (1-5 days)"), default=0)
    very_late_payment_points = models.IntegerField(_("Points for Very Late Payment (>5 days)"), default=-10)
    
    # Bonus points
    advance_payment_points = models.IntegerField(_("Points for Advance Payment"), default=3)
    double_payment_points = models.IntegerField(_("Points for Double Payment"), default=7)
    educational_course_points = models.IntegerField(_("Points for Educational Course"), default=10)
    
    # Thresholds for waiting days
    excellent_threshold = models.IntegerField(_("Excellent Standing Threshold"), default=100)
    good_threshold = models.IntegerField(_("Good Standing Threshold"), default=80)
    average_threshold = models.IntegerField(_("Average Standing Threshold"), default=60)
    poor_threshold = models.IntegerField(_("Poor Standing Threshold"), default=40)
    
    # Waiting days for each threshold
    excellent_waiting_days = models.IntegerField(_("Waiting Days for Excellent Standing"), default=0)
    good_waiting_days = models.IntegerField(_("Waiting Days for Good Standing"), default=7)
    average_waiting_days = models.IntegerField(_("Waiting Days for Average Standing"), default=15)
    poor_waiting_days = models.IntegerField(_("Waiting Days for Poor Standing"), default=30)
    bad_waiting_days = models.IntegerField(_("Waiting Days for Bad Standing"), default=45)
    
    # System fields
    is_active = models.BooleanField(_("Active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Points Configuration")
        verbose_name_plural = _("Points Configurations")
    
    def __str__(self):
        return f"Points Config (Updated: {self.updated_at.strftime('%Y-%m-%d')})"
    
    @classmethod
    def get_active_config(cls):
        """Get the active configuration or create with defaults if none exists"""
        config = cls.objects.filter(is_active=True).first()
        if not config:
            config = cls.objects.create(is_active=True)
        return config


class PointTransaction(models.Model):
    """Transaction for a user's points (add or subtract)"""
    
    TRANSACTION_TYPES = (
        ('initial', _('Initial Points')),
        ('on_time_payment', _('On-Time Payment')),
        ('late_payment', _('Late Payment (1-5 days)')),
        ('very_late_payment', _('Very Late Payment (>5 days)')),
        ('advance_payment', _('Advance Payment')),
        ('double_payment', _('Double Payment')),
        ('educational_course', _('Educational Course')),
        ('manual_adjustment', _('Manual Adjustment')),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                            related_name='point_transactions',
                            verbose_name=_("User"))
    
    transaction_type = models.CharField(_("Transaction Type"), max_length=30, 
                                      choices=TRANSACTION_TYPES)
    
    points_amount = models.IntegerField(_("Points Amount"))
    
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='point_transactions',
                               verbose_name=_("Related Payment"))
    
    reason = models.TextField(_("Reason"), blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                  null=True, blank=True,
                                  related_name='created_point_transactions',
                                  verbose_name=_("Created By"))
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Point Transaction")
        verbose_name_plural = _("Point Transactions")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.points_amount} points ({self.get_transaction_type_display()})"


class UserPointsSummary(models.Model):
    """Current points summary for a user"""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                               related_name='points_summary',
                               verbose_name=_("User"))
    
    current_points = models.IntegerField(_("Current Points"), default=0)
    lifetime_points = models.IntegerField(_("Lifetime Points Earned"), default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("User Points Summary")
        verbose_name_plural = _("User Points Summaries")
    
    def __str__(self):
        return f"{self.user.username}: {self.current_points} points"
    
    def get_waiting_days(self):
        """Calculate waiting days based on current points"""
        config = PointsConfig.get_active_config()
        
        if self.current_points >= config.excellent_threshold:
            return config.excellent_waiting_days
        elif self.current_points >= config.good_threshold:
            return config.good_waiting_days
        elif self.current_points >= config.average_threshold:
            return config.average_waiting_days
        elif self.current_points >= config.poor_threshold:
            return config.poor_waiting_days
        else:
            return config.bad_waiting_days
    
    def get_status_label(self):
        """Get a human-readable status based on current points"""
        config = PointsConfig.get_active_config()
        
        if self.current_points >= config.excellent_threshold:
            return _("Excelente")
        elif self.current_points >= config.good_threshold:
            return _("Bueno")
        elif self.current_points >= config.average_threshold:
            return _("Promedio")
        elif self.current_points >= config.poor_threshold:
            return _("Bajo")
        else:
            return _("Crítico")
