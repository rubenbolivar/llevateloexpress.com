"""
Context processors for the LlévateloExpress project.
"""
from .utils import format_currency

def global_settings(request):
    """
    Adds global settings and utility functions to context
    """
    return {
        'format_currency': format_currency,
        'default_currency_symbol': '$',
    } 