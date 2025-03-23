from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Custom User model with additional fields for client information."""
    # Basic personal information
    phone_number = models.CharField(_("Phone Number"), max_length=15, blank=True)
    identification = models.CharField(_("ID Number"), max_length=20, blank=True, help_text=_("National ID or passport"))
    address = models.TextField(_("Address"), blank=True)
    date_of_birth = models.DateField(_("Date of Birth"), null=True, blank=True)
    
    # Financial information
    monthly_income = models.DecimalField(_("Monthly Income"), max_digits=12, decimal_places=2, null=True, blank=True)
    occupation = models.CharField(_("Occupation"), max_length=100, blank=True)
    
    # Account verification
    is_verified = models.BooleanField(_("Verified"), default=False)
    verification_date = models.DateTimeField(_("Verification Date"), null=True, blank=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
    
    def __str__(self):
        return self.get_full_name() or self.username

class ClientProfile(models.Model):
    """Extended profile information for clients."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="client_profile")
    
    # References
    reference_name = models.CharField(_("Reference Name"), max_length=150, blank=True)
    reference_phone = models.CharField(_("Reference Phone"), max_length=15, blank=True)
    reference_relationship = models.CharField(_("Relationship"), max_length=50, blank=True)
    
    # Work information
    employer_name = models.CharField(_("Employer"), max_length=150, blank=True)
    employer_phone = models.CharField(_("Employer Phone"), max_length=15, blank=True)
    employment_duration = models.PositiveIntegerField(_("Years of Employment"), null=True, blank=True)
    
    # Financial information
    has_existing_loans = models.BooleanField(_("Has Existing Loans"), default=False)
    credit_score = models.PositiveIntegerField(_("Credit Score"), null=True, blank=True)
    
    # Documents
    id_scan = models.FileField(_("ID Scan"), upload_to='client_docs/id_scans/', blank=True)
    income_proof = models.FileField(_("Income Proof"), upload_to='client_docs/income_proofs/', blank=True)
    additional_document = models.FileField(_("Additional Document"), upload_to='client_docs/additional/', blank=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Client Profile")
        verbose_name_plural = _("Client Profiles")
    
    def __str__(self):
        return f"Profile for {self.user.get_full_name() or self.user.username}"

class ClientInteraction(models.Model):
    """Records of interactions with clients."""
    INTERACTION_TYPES = (
        ('call', _('Phone Call')),
        ('email', _('Email')),
        ('meeting', _('In-Person Meeting')),
        ('message', _('Message')),
        ('other', _('Other')),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="interactions")
    interaction_type = models.CharField(_("Type"), max_length=20, choices=INTERACTION_TYPES)
    interaction_date = models.DateTimeField(_("Date and Time"))
    description = models.TextField(_("Description"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_interactions")
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Client Interaction")
        verbose_name_plural = _("Client Interactions")
        ordering = ['-interaction_date']
    
    def __str__(self):
        return f"{self.get_interaction_type_display()} with {self.user.get_full_name() or self.user.username} on {self.interaction_date}"
