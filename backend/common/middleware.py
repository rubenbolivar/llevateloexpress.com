import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve

# Set up logger
logger = logging.getLogger('request_performance')

class RequestPerformanceMiddleware(MiddlewareMixin):
    """Middleware for monitoring request performance"""
    
    def process_request(self, request):
        """Process incoming request"""
        # Store request start time
        request.start_time = time.time()
    
    def process_response(self, request, response):
        """Process outgoing response"""
        # Check if start time was recorded
        if hasattr(request, 'start_time'):
            # Calculate request duration
            duration = time.time() - request.start_time
            
            # Get URL name
            try:
                url_name = resolve(request.path_info).url_name or 'unnamed'
            except:
                url_name = 'unknown'
            
            # Log slow requests (more than 500ms)
            if duration > 0.5:
                logger.warning(
                    f"Slow request: {request.method} {request.path} ({url_name}) - {duration:.2f}s",
                    extra={
                        'method': request.method,
                        'path': request.path,
                        'url_name': url_name,
                        'duration': duration,
                        'status_code': response.status_code,
                    }
                )
            
            # Add performance header for API responses
            if response.get('Content-Type', '').startswith('application/json'):
                response['X-Request-Duration'] = f"{duration:.2f}s"
        
        return response

class APIRequestLoggerMiddleware(MiddlewareMixin):
    """Middleware for logging API requests"""
    
    def process_request(self, request):
        """Process incoming request"""
        # Only log API requests
        if request.path.startswith('/api/'):
            logger.info(
                f"API Request: {request.method} {request.path}",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'user': request.user.username if request.user.is_authenticated else 'anonymous',
                    'ip': self.get_client_ip(request),
                }
            )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 