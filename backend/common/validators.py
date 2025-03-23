import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_venezuelan_phone_number(value):
    """
    Validate that the given value is a Venezuelan phone number format
    Expected formats: +58 XXX XXXXXXX, 04XX-XXXXXXX, 04XXXXXXXXX
    """
    # Remove common separators and spaces
    clean_number = re.sub(r'[\s\-\(\)]', '', value)
    
    # Check for Venezuelan mobile formats
    if re.match(r'^\+?58?4[1-9][2-9]\d{7}$', clean_number):
        return True
    
    if re.match(r'^04[1-9][2-9]\d{7}$', clean_number):
        return True
    
    raise ValidationError(
        _('Enter a valid Venezuelan phone number.'),
        code='invalid_phone'
    )

def validate_venezuelan_id(value):
    """
    Validate that the given value is a Venezuelan ID format
    Expected formats: V-XXXXXXXX, E-XXXXXXXX, J-XXXXXXXX
    """
    # Remove spaces
    clean_id = value.strip()
    
    # Check for correct format
    if re.match(r'^[VEJ]\-\d{5,10}$', clean_id):
        return True
    
    # Also allow format without dash
    if re.match(r'^[VEJ]\d{5,10}$', clean_id):
        return True
    
    raise ValidationError(
        _('Enter a valid Venezuelan ID number (V-XXXXXXXX, E-XXXXXXXX, J-XXXXXXXX).'),
        code='invalid_id'
    )

def validate_file_size(value, max_size_mb=5):
    """Validate that file size is under the max size in MB"""
    max_size_bytes = max_size_mb * 1024 * 1024
    
    if value.size > max_size_bytes:
        raise ValidationError(
            _('File size must be under %(max_size)s MB.'),
            params={'max_size': max_size_mb},
            code='file_too_large'
        )
    
def validate_file_extension(value, allowed_extensions=None):
    """Validate that file has an allowed extension"""
    if allowed_extensions is None:
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
    
    # Get the file extension
    ext = value.name.split('.')[-1].lower() if '.' in value.name else ''
    
    if ext not in allowed_extensions:
        raise ValidationError(
            _('Unsupported file extension. Allowed extensions: %(extensions)s.'),
            params={'extensions': ', '.join(allowed_extensions)},
            code='invalid_extension'
        ) 