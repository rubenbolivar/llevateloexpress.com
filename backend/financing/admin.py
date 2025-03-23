from django.contrib import admin
from .models import FinancingPlan, PlanRequirement, FinancingSimulation, PaymentSchedule

class PlanRequirementInline(admin.TabularInline):
    model = PlanRequirement
    extra = 3

class FinancingPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type', 'min_term', 'max_term', 'interest_rate', 'is_active')
    list_filter = ('plan_type', 'is_active')
    search_fields = ('name', 'description')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'plan_type', 'description', 'is_active')
        }),
        ('Terms', {
            'fields': ('min_term', 'max_term', 'interest_rate')
        }),
        ('Plan Specific Parameters', {
            'fields': ('adjudication_percentage', 'down_payment_percentage')
        }),
    )
    inlines = [PlanRequirementInline]

class PaymentScheduleInline(admin.TabularInline):
    model = PaymentSchedule
    extra = 0
    readonly_fields = ('payment_number', 'payment_date', 'principal', 'interest', 
                      'total_payment', 'remaining_balance', 'is_adjudication')
    can_delete = False
    max_num = 0

class FinancingSimulationAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'plan', 'term_months', 'total_price', 'created_at')
    list_filter = ('plan__plan_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'product__name')
    readonly_fields = ('user', 'product', 'plan', 'term_months', 'total_price', 
                      'down_payment', 'monthly_payment', 'adjudication_payment',
                      'adjudication_month', 'total_interest', 'total_amount', 'created_at')
    fieldsets = (
        ('User & Product', {
            'fields': ('user', 'product')
        }),
        ('Plan Details', {
            'fields': ('plan', 'term_months', 'total_price')
        }),
        ('Payment Information', {
            'fields': ('down_payment', 'monthly_payment', 'adjudication_payment', 
                      'adjudication_month', 'total_interest', 'total_amount')
        }),
        ('System Information', {
            'fields': ('created_at',)
        }),
    )
    inlines = [PaymentScheduleInline]
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

admin.site.register(FinancingPlan, FinancingPlanAdmin)
admin.site.register(FinancingSimulation, FinancingSimulationAdmin)
