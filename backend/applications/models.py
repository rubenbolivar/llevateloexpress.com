from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from products.models import Product
from financing.models import FinancingPlan
import uuid

class CreditApplication(models.Model):
    """Solicitud de crédito o financiamiento"""
    
    STATUS_CHOICES = (
        ('draft', _('Borrador')),
        ('submitted', _('Enviada')),
        ('in_review', _('En Revisión')),
        ('additional_info_required', _('Información Adicional Requerida')),
        ('approved', _('Aprobada')),
        ('rejected', _('Rechazada')),
        ('cancelled', _('Cancelada')),
    )
    
    # Información básica
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                           related_name="applications",
                           verbose_name=_("Usuario"))
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, 
                              related_name="applications",
                              verbose_name=_("Producto"))
    
    financing_plan = models.ForeignKey(FinancingPlan, on_delete=models.CASCADE, 
                                     related_name="applications",
                                     verbose_name=_("Plan de Financiamiento"))
    
    # Detalles financieros
    amount = models.DecimalField(_("Monto Total"), max_digits=12, decimal_places=2)
    down_payment = models.DecimalField(_("Pago Inicial"), max_digits=12, decimal_places=2,
                                     null=True, blank=True)
    term_months = models.PositiveIntegerField(_("Plazo (meses)"))
    monthly_payment = models.DecimalField(_("Cuota Mensual"), max_digits=12, decimal_places=2)
    
    # Estado y progreso
    status = models.CharField(_("Estado"), max_length=30, choices=STATUS_CHOICES, 
                            default='draft')
    
    notes = models.TextField(_("Notas"), blank=True)
    rejection_reason = models.TextField(_("Motivo de Rechazo"), blank=True)
    
    # Campos del sistema
    created_at = models.DateTimeField(_("Fecha de Creación"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Última Actualización"), auto_now=True)
    submitted_at = models.DateTimeField(_("Fecha de Envío"), null=True, blank=True)
    approved_at = models.DateTimeField(_("Fecha de Aprobación"), null=True, blank=True)
    rejected_at = models.DateTimeField(_("Fecha de Rechazo"), null=True, blank=True)
    
    # Relaciones con documentos y estados
    # documents = OneToMany (definido en ApplicationDocument)
    # status_history = OneToMany (definido en ApplicationStatus)
    
    class Meta:
        verbose_name = _("Solicitud de Crédito")
        verbose_name_plural = _("Solicitudes de Crédito")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Solicitud #{self.id} - {self.user.username}"

class ApplicationDocument(models.Model):
    """Documentos adjuntos a una solicitud"""
    
    DOCUMENT_TYPES = (
        ('id_card', _('Cédula de Identidad')),
        ('income_proof', _('Comprobante de Ingresos')),
        ('bank_statement', _('Estado de Cuenta Bancario')),
        ('tax_return', _('Declaración de Impuestos')),
        ('utility_bill', _('Factura de Servicios')),
        ('reference_letter', _('Carta de Referencia')),
        ('vehicle_images', _('Imágenes del Vehículo')),
        ('other', _('Otro')),
    )
    
    application = models.ForeignKey(CreditApplication, on_delete=models.CASCADE, 
                                  related_name="documents",
                                  verbose_name=_("Solicitud"))
    
    document_type = models.CharField(_("Tipo de Documento"), max_length=20, 
                                   choices=DOCUMENT_TYPES)
    
    file = models.FileField(_("Archivo"), upload_to='application_documents/%Y/%m/')
    description = models.CharField(_("Descripción"), max_length=255, blank=True)
    is_verified = models.BooleanField(_("Verificado"), default=False)
    
    # Campos del sistema
    uploaded_at = models.DateTimeField(_("Fecha de Carga"), auto_now_add=True)
    
    class Meta:
        verbose_name = _("Documento de Solicitud")
        verbose_name_plural = _("Documentos de Solicitud")
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.application}"

class ApplicationStatus(models.Model):
    """Historial de cambios de estado de una solicitud"""
    
    application = models.ForeignKey(CreditApplication, on_delete=models.CASCADE, 
                                  related_name="status_history",
                                  verbose_name=_("Solicitud"))
    
    status = models.CharField(_("Estado"), max_length=30, choices=CreditApplication.STATUS_CHOICES)
    notes = models.TextField(_("Notas"), blank=True)
    
    # Quién cambió el estado
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                 null=True, blank=True, 
                                 related_name="application_status_changes",
                                 verbose_name=_("Cambiado por"))
    
    # Campos del sistema
    changed_at = models.DateTimeField(_("Fecha de Cambio"), auto_now_add=True)
    
    class Meta:
        verbose_name = _("Estado de Solicitud")
        verbose_name_plural = _("Estados de Solicitudes")
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.get_status_display()} - {self.application}"

class ApplicationNote(models.Model):
    """Notas internas para una solicitud"""
    
    application = models.ForeignKey(CreditApplication, on_delete=models.CASCADE, 
                                  related_name="admin_notes",
                                  verbose_name=_("Solicitud"))
    
    note = models.TextField(_("Nota"))
    
    # Quién creó la nota
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                 null=True, blank=True, 
                                 related_name="application_notes",
                                 verbose_name=_("Creado por"))
    
    # Campos del sistema
    created_at = models.DateTimeField(_("Fecha de Creación"), auto_now_add=True)
    
    class Meta:
        verbose_name = _("Nota de Solicitud")
        verbose_name_plural = _("Notas de Solicitudes")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Nota para {self.application}"
