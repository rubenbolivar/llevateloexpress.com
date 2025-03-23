from django.contrib import admin
from .models import DashboardSavedView

class DashboardSavedViewAdmin(admin.ModelAdmin):
    list_display = ('name', 'view_type', 'user', 'created_at', 'updated_at')
    list_filter = ('view_type', 'created_at')
    search_fields = ('name', 'user__username', 'view_type')
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(DashboardSavedView, DashboardSavedViewAdmin)
