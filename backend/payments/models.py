from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from applications.models import CreditApplication
from django.conf import settings

class PaymentMethod(models.Model):
    """Payment methods accepted by the platform"""
    name = models.CharField(_("Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True)
    instructions = models.TextField(_("Payment Instructions"), blank=True)
    account_info = models.CharField(_("Account Information"), max_length=255, blank=True)
    is_active = models.BooleanField(_("Active"), default=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Payment Method")
        verbose_name_plural = _("Payment Methods")
    
    def __str__(self):
        return self.name

class Payment(models.Model):
    """Payment transactions from clients"""
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('verified', _('Verified')),
        ('rejected', _('Rejected')),
    )
    
    PAYMENT_TYPE_CHOICES = (
        ('regular', _('Regular Payment')),
        ('down_payment', _('Down Payment')),
        ('adjudication', _('Adjudication Payment')),
        ('extra', _('Extra Payment')),
    )
    
    # Relationships
    application = models.ForeignKey(CreditApplication, on_delete=models.CASCADE, 
                                   related_name='payments', verbose_name=_("Application"))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                           related_name='payments', verbose_name=_("User"))
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT, 
                                     related_name='transactions', verbose_name=_("Payment Method"))
    
    # Payment details
    payment_type = models.CharField(_("Payment Type"), max_length=15, choices=PAYMENT_TYPE_CHOICES, 
                                   default='regular')
    amount = models.DecimalField(_("Amount"), max_digits=12, decimal_places=2)
    expected_amount = models.DecimalField(_("Expected Amount"), max_digits=12, decimal_places=2, default=0)
    reference_number = models.CharField(_("Reference Number"), max_length=100, blank=True)
    payment_date = models.DateField(_("Payment Date"))
    due_date = models.DateField(_("Due Date"), null=True, blank=True)
    receipt = models.FileField(_("Receipt"), upload_to='payment_receipts/')
    payer_name = models.CharField(_("Payer Name"), max_length=150, blank=True)
    
    # Verification details
    status = models.CharField(_("Status"), max_length=10, choices=STATUS_CHOICES, default='pending')
    is_verified = models.BooleanField(_("Verified"), default=False)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='verified_payments', verbose_name=_("Verified By"))
    verification_date = models.DateTimeField(_("Verification Date"), null=True, blank=True)
    rejection_reason = models.TextField(_("Rejection Reason"), blank=True)
    
    # Notes
    notes = models.TextField(_("Notes"), blank=True)
    
    # Points processing
    points_processed = models.BooleanField(_("Points Processed"), default=False)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment {self.reference_number} for {self.application.reference_number}"
    
    def verify_payment(self, verified_by, verification_notes=None):
        """Mark payment as verified and process points"""
        self.status = 'verified'
        self.is_verified = True
        self.verified_by = verified_by
        self.verification_date = timezone.now()
        
        if verification_notes:
            self.notes = verification_notes
            
        self.save()
        
        # Process points after verification
        self.process_points(verified_by)
        
        # Mark scheduled payment as paid if it exists
        scheduled_payment = getattr(self, 'scheduled_payment', None)
        if scheduled_payment:
            scheduled_payment.mark_as_paid(self)
    
    def reject_payment(self, verified_by, rejection_reason):
        """Mark payment as rejected"""
        self.status = 'rejected'
        self.is_verified = False
        self.verified_by = verified_by
        self.verification_date = timezone.now()
        self.rejection_reason = rejection_reason
        self.save()
    
    def process_points(self, admin_user=None):
        """Process points for this payment"""
        if self.is_verified and not self.points_processed:
            # Import here to avoid circular import
            from points_system.services import process_payment_points
            
            # Process points
            process_payment_points(payment=self, created_by=admin_user)
            
            # Mark as processed
            self.points_processed = True
            self.save(update_fields=['points_processed'])

class PaymentSchedule(models.Model):
    """Payment schedule for an application"""
    application = models.ForeignKey(CreditApplication, on_delete=models.CASCADE, 
                                  related_name='payment_schedule', verbose_name=_("Application"))
    payment_number = models.PositiveIntegerField(_("Payment Number"))
    due_date = models.DateField(_("Due Date"))
    amount = models.DecimalField(_("Amount"), max_digits=12, decimal_places=2)
    principal = models.DecimalField(_("Principal"), max_digits=12, decimal_places=2)
    interest = models.DecimalField(_("Interest"), max_digits=12, decimal_places=2)
    is_paid = models.BooleanField(_("Paid"), default=False)
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, blank=True,
                                 related_name='scheduled_payment', verbose_name=_("Payment"))
    
    class Meta:
        verbose_name = _("Payment Schedule")
        verbose_name_plural = _("Payment Schedules")
        ordering = ['payment_number']
        unique_together = [['application', 'payment_number']]
    
    def __str__(self):
        return f"Payment {self.payment_number} for {self.application.reference_number}"
    
    def mark_as_paid(self, payment):
        """Mark this scheduled payment as paid"""
        self.is_paid = True
        self.payment = payment
        self.save()
