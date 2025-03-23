from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ClientProfile, ClientInteraction

class ClientProfileInline(admin.StackedInline):
    model = ClientProfile
    can_delete = False
    verbose_name_plural = 'Client Profile'

class CustomUserAdmin(UserAdmin):
    inlines = (ClientProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_verified')
    list_filter = UserAdmin.list_filter + ('is_verified',)
    search_fields = ('username', 'email', 'first_name', 'last_name', 'identification')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Information', {'fields': ('phone_number', 'identification', 'address', 'date_of_birth',
                                              'monthly_income', 'occupation', 'is_verified', 'verification_date')}),
    )

class ClientInteractionAdmin(admin.ModelAdmin):
    list_display = ('user', 'interaction_type', 'interaction_date', 'created_by')
    list_filter = ('interaction_type', 'interaction_date')
    search_fields = ('user__username', 'user__email', 'description')
    date_hierarchy = 'interaction_date'
    
admin.site.register(User, CustomUserAdmin)
admin.site.register(ClientInteraction, ClientInteractionAdmin)
