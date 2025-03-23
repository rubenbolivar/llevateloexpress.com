from django.contrib import admin
from .models import CreditApplication, ApplicationDocument, ApplicationStatus, ApplicationNote

class ApplicationDocumentInline(admin.TabularInline):
    model = ApplicationDocument
    extra = 1
    readonly_fields = ['uploaded_at']
    
class ApplicationStatusInline(admin.TabularInline):
    model = ApplicationStatus
    extra = 0
    readonly_fields = ['changed_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False

class ApplicationNoteInline(admin.TabularInline):
    model = ApplicationNote
    extra = 1
    readonly_fields = ['created_at']

@admin.register(CreditApplication)
class CreditApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__username', 'product__name')
    date_hierarchy = 'created_at'
    inlines = [ApplicationDocumentInline, ApplicationStatusInline, ApplicationNoteInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'product', 'status')
        }),
        ('Financing Details', {
            'fields': ('financing_plan', 'amount', 'down_payment', 'term_months', 'monthly_payment')
        }),
        ('Application Progress', {
            'fields': ('submitted_at', 'approved_at', 'rejected_at')
        }),
        ('Additional Information', {
            'fields': ('notes', 'rejection_reason'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ApplicationDocument)
class ApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'application', 'document_type', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = ('application__id',)
    date_hierarchy = 'uploaded_at'

@admin.register(ApplicationStatus)
class ApplicationStatusAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'changed_at', 'changed_by')
    list_filter = ('status', 'changed_at')
    search_fields = ('application__id', 'notes')
    date_hierarchy = 'changed_at'
    readonly_fields = ('changed_at',)

@admin.register(ApplicationNote)
class ApplicationNoteAdmin(admin.ModelAdmin):
    list_display = ('application', 'created_at', 'created_by')
    search_fields = ('application__id', 'note')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
