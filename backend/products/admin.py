from django.contrib import admin
from .models import (
    Category, Brand, Product, ProductImage,
    Motorcycle, Vehicle, AgriculturalMachinery
)

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    list_filter = ('parent',)

class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3

class MotorcycleInline(admin.StackedInline):
    model = Motorcycle
    can_delete = False

class VehicleInline(admin.StackedInline):
    model = Vehicle
    can_delete = False

class AgriculturalMachineryInline(admin.StackedInline):
    model = AgriculturalMachinery
    can_delete = False

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'model', 'year', 'price', 'condition', 'availability', 'featured')
    list_filter = ('category', 'brand', 'condition', 'availability', 'featured')
    search_fields = ('name', 'description', 'model')
    prepopulated_fields = {'slug': ('name', 'year')}
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'brand', 'model', 'year', 'description')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'discounted_price', 'condition', 'availability')
        }),
        ('Features', {
            'fields': ('color', 'featured', 'is_active')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [ProductImageInline, MotorcycleInline, VehicleInline, AgriculturalMachineryInline]

admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(Product, ProductAdmin)
