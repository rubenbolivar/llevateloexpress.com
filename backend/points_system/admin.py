from django.contrib import admin
from .models import PointsConfig, PointTransaction, UserPointsSummary

@admin.register(PointsConfig)
class PointsConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'initial_points', 'on_time_payment_points', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Initial Settings', {
            'fields': ('initial_points', 'is_active')
        }),
        ('Payment Points', {
            'fields': ('on_time_payment_points', 'late_payment_points', 'very_late_payment_points')
        }),
        ('Bonus Points', {
            'fields': ('advance_payment_points', 'double_payment_points', 'educational_course_points')
        }),
        ('Thresholds', {
            'fields': ('excellent_threshold', 'good_threshold', 'average_threshold', 'poor_threshold')
        }),
        ('Waiting Days', {
            'fields': ('excellent_waiting_days', 'good_waiting_days', 'average_waiting_days', 
                     'poor_waiting_days', 'bad_waiting_days')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """When saving a config as active, deactivate all others"""
        if obj.is_active:
            PointsConfig.objects.exclude(pk=obj.pk).update(is_active=False)
        super().save_model(request, obj, form, change)

@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction_type', 'points_amount', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'reason')
    readonly_fields = ('created_at',)
    raw_id_fields = ('user', 'payment', 'created_by')
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('user', 'transaction_type', 'points_amount')
        }),
        ('Related Information', {
            'fields': ('payment', 'reason', 'created_by')
        }),
        ('System Information', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(UserPointsSummary)
class UserPointsSummaryAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_points', 'lifetime_points', 'get_status_label', 'get_waiting_days', 'last_updated')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('last_updated',)
    raw_id_fields = ('user',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Points Summary', {
            'fields': ('current_points', 'lifetime_points', 'last_updated')
        }),
    )
    
    def get_status_label(self, obj):
        return obj.get_status_label()
    get_status_label.short_description = 'Status'
    
    def get_waiting_days(self, obj):
        return obj.get_waiting_days()
    get_waiting_days.short_description = 'Waiting Days'
