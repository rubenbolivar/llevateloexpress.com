from django.db import models
from django.utils.translation import gettext_lazy as _
from products.models import Product

class FinancingPlan(models.Model):
    """Financing plan model - handles different financing options"""
    PLAN_TYPES = (
        ('programmed', _('Programmed Purchase')),  # Adjudication at 45%
        ('immediate', _('Immediate Adjudication')),  # Immediate credit
    )
    
    name = models.CharField(_("Plan Name"), max_length=100)
    plan_type = models.CharField(_("Plan Type"), max_length=15, choices=PLAN_TYPES)
    description = models.TextField(_("Description"))
    min_term = models.PositiveIntegerField(_("Minimum Term (months)"))
    max_term = models.PositiveIntegerField(_("Maximum Term (months)"))
    interest_rate = models.DecimalField(_("Annual Interest Rate (%)"), max_digits=5, decimal_places=2)
    
    # Specific parameters for programmed purchase
    adjudication_percentage = models.DecimalField(_("Adjudication Percentage"), max_digits=5, decimal_places=2, 
                                                default=45.00, 
                                                help_text=_("Percentage of total to reach before adjudication"))
    
    # Specific parameters for immediate adjudication
    down_payment_percentage = models.DecimalField(_("Down Payment Percentage"), max_digits=5, decimal_places=2, 
                                                default=30.00,
                                                help_text=_("Required initial payment percentage"))
    
    is_active = models.BooleanField(_("Active"), default=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Financing Plan")
        verbose_name_plural = _("Financing Plans")
    
    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()})"

class PlanRequirement(models.Model):
    """Requirements for financing plans"""
    plan = models.ForeignKey(FinancingPlan, on_delete=models.CASCADE, related_name="requirements",
                           verbose_name=_("Financing Plan"))
    name = models.CharField(_("Requirement Name"), max_length=200)
    description = models.TextField(_("Description"), blank=True)
    is_mandatory = models.BooleanField(_("Mandatory"), default=True)
    
    class Meta:
        verbose_name = _("Plan Requirement")
        verbose_name_plural = _("Plan Requirements")
    
    def __str__(self):
        return f"{self.name} ({self.plan.name})"

class FinancingSimulation(models.Model):
    """Records of financing simulations created by users"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="simulations",
                              verbose_name=_("Product"))
    plan = models.ForeignKey(FinancingPlan, on_delete=models.CASCADE, related_name="simulations",
                           verbose_name=_("Financing Plan"))
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name="simulations",
                           verbose_name=_("User"))
    
    # Simulation parameters
    term_months = models.PositiveIntegerField(_("Term (months)"))
    total_price = models.DecimalField(_("Total Price"), max_digits=12, decimal_places=2)
    down_payment = models.DecimalField(_("Down Payment"), max_digits=12, decimal_places=2)
    monthly_payment = models.DecimalField(_("Monthly Payment"), max_digits=12, decimal_places=2)
    
    # Outputs calculated
    adjudication_payment = models.DecimalField(_("Adjudication Payment"), max_digits=12, decimal_places=2, 
                                            null=True, blank=True,
                                            help_text=_("Payment at adjudication time for programmed purchase"))
    adjudication_month = models.PositiveIntegerField(_("Adjudication Month"), null=True, blank=True)
    total_interest = models.DecimalField(_("Total Interest"), max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(_("Total Amount to Pay"), max_digits=12, decimal_places=2)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Financing Simulation")
        verbose_name_plural = _("Financing Simulations")
    
    def __str__(self):
        return f"Simulation for {self.product.name} by {self.user.username}"

class PaymentSchedule(models.Model):
    """Payment schedule details for simulations"""
    simulation = models.ForeignKey(FinancingSimulation, on_delete=models.CASCADE, related_name="payments",
                                 verbose_name=_("Simulation"))
    payment_number = models.PositiveIntegerField(_("Payment Number"))
    payment_date = models.DateField(_("Payment Date"))
    principal = models.DecimalField(_("Principal"), max_digits=12, decimal_places=2)
    interest = models.DecimalField(_("Interest"), max_digits=12, decimal_places=2)
    total_payment = models.DecimalField(_("Total Payment"), max_digits=12, decimal_places=2)
    remaining_balance = models.DecimalField(_("Remaining Balance"), max_digits=12, decimal_places=2)
    is_adjudication = models.BooleanField(_("Is Adjudication Payment"), default=False)
    
    class Meta:
        verbose_name = _("Payment Schedule")
        verbose_name_plural = _("Payment Schedules")
        ordering = ['payment_number']
    
    def __str__(self):
        return f"Payment {self.payment_number} for {self.simulation}"
