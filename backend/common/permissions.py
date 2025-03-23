from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if object has a user field that matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if object has a created_by field that matches the request user
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow owners of an object or admin users to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin permissions
        if request.user.is_staff:
            return True
        
        # Owner permissions
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
            
        return False

class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified

class ReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow read-only methods.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS 