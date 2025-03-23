from django.contrib import admin
from .models import PaymentMethod, Payment, PaymentSchedule

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')

class PaymentScheduleInline(admin.TabularInline):
    model = PaymentSchedule
    extra = 0
    readonly_fields = ('payment_number', 'due_date', 'amount', 'principal', 'interest', 'is_paid')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'application', 'payment_method', 'amount', 'payment_date', 'status')
    list_filter = ('status', 'payment_date', 'payment_type')
    search_fields = ('reference_number', 'user__username', 'application__id')
    readonly_fields = ('created_at', 'updated_at', 'is_verified', 'verified_by', 'verification_date')
    date_hierarchy = 'payment_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'application', 'payment_method', 'payment_type')
        }),
        ('Payment Details', {
            'fields': ('amount', 'expected_amount', 'reference_number', 'payment_date', 'due_date', 'payer_name')
        }),
        ('Verification', {
            'fields': ('status', 'is_verified', 'verified_by', 'verification_date', 'rejection_reason')
        }),
        ('Additional Information', {
            'fields': ('notes', 'receipt', 'points_processed')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(PaymentSchedule)
class PaymentScheduleAdmin(admin.ModelAdmin):
    list_display = ('payment_number', 'application', 'due_date', 'amount', 'is_paid')
    list_filter = ('is_paid', 'due_date')
    search_fields = ('application__id',)
    date_hierarchy = 'due_date'
    raw_id_fields = ('application', 'payment')
