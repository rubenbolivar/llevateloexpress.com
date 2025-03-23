from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Payment
from points_system.services import process_payment_points

@receiver(post_save, sender=Payment)
def update_points_on_payment_verification(sender, instance, created, **kwargs):
    """
    Actualiza los puntos del usuario cuando un pago es verificado.
    """
    # Solo procesar si el pago ha sido verificado y no es creación
    if not created and instance.status == 'verified':
        process_payment_points(instance) 