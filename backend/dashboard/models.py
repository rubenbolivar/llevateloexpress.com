from django.db import models
from django.utils.translation import gettext_lazy as _

class DashboardSavedView(models.Model):
    """Model to save custom dashboard views for admins"""
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, 
                           related_name='saved_dashboard_views',
                           verbose_name=_("User"))
    name = models.CharField(_("View Name"), max_length=100)
    view_type = models.CharField(_("View Type"), max_length=50)  # e.g., 'sales', 'payments', 'applications'
    configuration = models.JSONField(_("Configuration"))  # JSON configuration for the view
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Dashboard Saved View")
        verbose_name_plural = _("Dashboard Saved Views")
        ordering = ['user', 'name']
        unique_together = [['user', 'name']]
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"
