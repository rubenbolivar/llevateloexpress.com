from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.

class BaseTimestampModel(models.Model):
    """Abstract base model with created and updated timestamps"""
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)
    
    class Meta:
        abstract = True
