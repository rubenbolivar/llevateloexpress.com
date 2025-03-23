from django.utils import timezone
from django.db import transaction
from .models import CreditApplication, ApplicationStatus, ApplicationDocument, ApplicationNote

def create_application(user, product, financing_plan, amount, term_months, monthly_payment, down_payment=None):
    """
    Crea una nueva solicitud de crédito en estado borrador.
    
    Args:
        user: Usuario que solicita el crédito
        product: Producto a financiar
        financing_plan: Plan de financiamiento seleccionado
        amount: Monto total a financiar
        term_months: Plazo en meses
        monthly_payment: Cuota mensual
        down_payment: Pago inicial (opcional)
        
    Returns:
        CreditApplication: La solicitud creada
    """
    with transaction.atomic():
        # Crear la solicitud
        application = CreditApplication.objects.create(
            user=user,
            product=product,
            financing_plan=financing_plan,
            amount=amount,
            term_months=term_months,
            monthly_payment=monthly_payment,
            down_payment=down_payment,
            status='draft'
        )
        
        # Crear el primer registro en el historial de estados
        ApplicationStatus.objects.create(
            application=application,
            status='draft',
            notes='Solicitud creada en estado borrador',
            changed_by=user
        )
        
        return application

def submit_application(application, user):
    """
    Envía una solicitud para revisión, cambiando su estado de borrador a enviada.
    
    Args:
        application: Solicitud a enviar
        user: Usuario que envía la solicitud
        
    Returns:
        bool: True si se envió correctamente, False en caso contrario
    """
    if application.status != 'draft':
        return False
    
    with transaction.atomic():
        # Actualizar estado de la solicitud
        application.status = 'submitted'
        application.submitted_at = timezone.now()
        application.save()
        
        # Crear registro en el historial de estados
        ApplicationStatus.objects.create(
            application=application,
            status='submitted',
            notes='Solicitud enviada para revisión',
            changed_by=user
        )
        
        return True

def update_application_status(application, new_status, notes, user):
    """
    Actualiza el estado de una solicitud.
    
    Args:
        application: Solicitud a actualizar
        new_status: Nuevo estado
        notes: Notas sobre el cambio de estado
        user: Usuario que realiza el cambio
        
    Returns:
        bool: True si se actualizó correctamente, False en caso contrario
    """
    if application.status == new_status:
        return False
    
    valid_transitions = {
        'draft': ['submitted', 'cancelled'],
        'submitted': ['in_review', 'rejected', 'cancelled'],
        'in_review': ['additional_info_required', 'approved', 'rejected', 'cancelled'],
        'additional_info_required': ['in_review', 'rejected', 'cancelled'],
        'approved': ['cancelled'],
        'rejected': [],
        'cancelled': []
    }
    
    if new_status not in valid_transitions.get(application.status, []):
        return False
    
    old_status = application.status
    
    with transaction.atomic():
        # Actualizar estado de la solicitud
        application.status = new_status
        
        # Actualizar fechas específicas según el estado
        if new_status == 'approved':
            application.approved_at = timezone.now()
        elif new_status == 'rejected':
            application.rejected_at = timezone.now()
            
        application.save()
        
        # Crear registro en el historial de estados
        ApplicationStatus.objects.create(
            application=application,
            status=new_status,
            notes=notes,
            changed_by=user
        )
        
        return True

def add_document(application, document_type, file, description=''):
    """
    Agrega un documento a una solicitud.
    
    Args:
        application: Solicitud a la que agregar el documento
        document_type: Tipo de documento
        file: Archivo subido
        description: Descripción del documento
        
    Returns:
        ApplicationDocument: El documento creado
    """
    document = ApplicationDocument.objects.create(
        application=application,
        document_type=document_type,
        file=file,
        description=description
    )
    
    return document

def verify_document(document, is_verified, user):
    """
    Verifica un documento.
    
    Args:
        document: Documento a verificar
        is_verified: True si el documento es válido, False en caso contrario
        user: Usuario que realiza la verificación
        
    Returns:
        ApplicationDocument: El documento actualizado
    """
    document.is_verified = is_verified
    document.save()
    
    # Agregar nota sobre la verificación
    ApplicationNote.objects.create(
        application=document.application,
        note=f"Documento '{document.get_document_type_display()}' {'verificado' if is_verified else 'rechazado'}",
        created_by=user
    )
    
    return document

def add_note(application, note, user):
    """
    Agrega una nota a una solicitud.
    
    Args:
        application: Solicitud a la que agregar la nota
        note: Texto de la nota
        user: Usuario que crea la nota
        
    Returns:
        ApplicationNote: La nota creada
    """
    return ApplicationNote.objects.create(
        application=application,
        note=note,
        created_by=user
    )

def get_application_documents(application):
    """
    Obtiene todos los documentos de una solicitud.
    
    Args:
        application: Solicitud de la que obtener los documentos
        
    Returns:
        QuerySet: Documentos de la solicitud
    """
    return ApplicationDocument.objects.filter(application=application)

def get_application_status_history(application):
    """
    Obtiene el historial de estados de una solicitud.
    
    Args:
        application: Solicitud de la que obtener el historial
        
    Returns:
        QuerySet: Historial de estados de la solicitud
    """
    return ApplicationStatus.objects.filter(application=application)

def get_application_notes(application):
    """
    Obtiene las notas de una solicitud.
    
    Args:
        application: Solicitud de la que obtener las notas
        
    Returns:
        QuerySet: Notas de la solicitud
    """
    return ApplicationNote.objects.filter(application=application)

def get_user_applications(user):
    """
    Obtiene todas las solicitudes de un usuario.
    
    Args:
        user: Usuario del que obtener las solicitudes
        
    Returns:
        QuerySet: Solicitudes del usuario
    """
    return CreditApplication.objects.filter(user=user) 