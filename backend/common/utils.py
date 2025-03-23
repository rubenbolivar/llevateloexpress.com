import uuid
import os
from django.utils import timezone
from datetime import datetime
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from typing import Union, Dict, Any

def generate_unique_reference(prefix="REF", length=6):
    """Generate a unique reference number with prefix and random ID"""
    unique_id = str(uuid.uuid4().int)[:length]
    today = datetime.now()
    date_part = today.strftime('%Y%m')
    return f"{prefix}-{date_part}-{unique_id}"

def get_file_upload_path(instance, filename, folder="uploads"):
    """
    Generate a unique path for uploaded files
    
    Args:
        instance: Model instance
        filename: Original filename
        folder: Base folder name
        
    Returns:
        Path string for the file
    """
    # Get timestamp for unique path
    now = timezone.now().strftime('%Y%m%d%H%M%S')
    # Get file extension
    ext = filename.split('.')[-1] if '.' in filename else ''
    # Generate random name with original extension
    rand_name = f"{now}_{uuid.uuid4().hex}.{ext}"
    # Return path to upload
    return os.path.join(folder, now[:6], rand_name)

def get_document_upload_path(instance, filename):
    """Path generator for application documents"""
    if hasattr(instance, 'application'):
        ref = instance.application.reference_number if instance.application.reference_number else 'docs'
        return get_file_upload_path(instance, filename, f"application_docs/{ref}")
    return get_file_upload_path(instance, filename, "application_docs")

def get_receipt_upload_path(instance, filename):
    """Path generator for payment receipts"""
    if hasattr(instance, 'application'):
        ref = instance.application.reference_number if instance.application.reference_number else 'receipts'
        return get_file_upload_path(instance, filename, f"payment_receipts/{ref}")
    return get_file_upload_path(instance, filename, "payment_receipts")

def format_currency(amount: Union[float, Decimal, int], symbol: str = "$") -> str:
    """
    Format a currency amount according to Venezuela's dollar format standards.
    Using dot as thousand separator and comma as decimal separator.
    
    Example: $42.000,00
    
    Args:
        amount: The amount to format
        symbol: The currency symbol, defaults to "$"
        
    Returns:
        A formatted currency string
    """
    if amount is None:
        return f"{symbol}0,00"
    
    # Convert to Decimal for precise handling
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))
    
    # Format with two decimal places
    amount_str = f"{amount:.2f}"
    
    # Replace the decimal point with a temporary character
    amount_str = amount_str.replace('.', 'X')
    
    # Split into integer and decimal parts
    int_part, dec_part = amount_str.split('X')
    
    # Add thousand separators (dots)
    int_part_with_dots = ""
    for i, digit in enumerate(reversed(int_part)):
        if i > 0 and i % 3 == 0:
            int_part_with_dots = '.' + int_part_with_dots
        int_part_with_dots = digit + int_part_with_dots
    
    # Combine with symbol and replace decimal with comma
    return f"{symbol}{int_part_with_dots},{dec_part}"

def custom_exception_handler(exc, context):
    """
    Custom exception handler for the API.
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            "success": False,
            "error": {
                "message": response.data.get("detail", str(response.data)) if isinstance(response.data, dict) else str(response.data),
                "code": response.status_code
            }
        }
        response.data = custom_response_data
    
    return response

def get_error_code(exc):
    """Get a standardized error code from exception"""
    if isinstance(exc, ValidationError):
        return 'validation_error'
    elif isinstance(exc, AuthenticationFailed):
        return 'authentication_failed'
    elif isinstance(exc, NotAuthenticated):
        return 'not_authenticated'
    elif isinstance(exc, PermissionDenied):
        return 'permission_denied'
    
    # Get error code from DRF status code
    status_code = getattr(exc, 'status_code', 500)
    if status_code == 404:
        return 'not_found'
    elif status_code == 400:
        return 'bad_request'
    elif status_code == 401:
        return 'unauthorized'
    elif status_code == 403:
        return 'forbidden'
    elif status_code == 405:
        return 'method_not_allowed'
    elif status_code == 429:
        return 'too_many_requests'
    
    return 'server_error'

def get_error_message(exc):
    """Get a user-friendly error message"""
    if isinstance(exc, ValidationError):
        return 'Validation error in submitted data'
    elif isinstance(exc, AuthenticationFailed):
        return 'Authentication failed'
    elif isinstance(exc, NotAuthenticated):
        return 'Authentication required'
    elif isinstance(exc, PermissionDenied):
        return 'You do not have permission to perform this action'
    
    # Get message from exception if available
    if hasattr(exc, 'detail'):
        return str(exc.detail)
    
    # Default message based on status code
    status_code = getattr(exc, 'status_code', 500)
    if status_code == 404:
        return 'The requested resource was not found'
    elif status_code == 400:
        return 'Bad request'
    elif status_code == 401:
        return 'Authentication required'
    elif status_code == 403:
        return 'Access forbidden'
    elif status_code == 405:
        return 'Method not allowed'
    elif status_code == 429:
        return 'Too many requests'
    
    return 'An unexpected error occurred' 