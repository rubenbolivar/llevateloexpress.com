from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    """Product categories such as motorcycles, cars, trucks, etc."""
    name = models.CharField(_("Name"), max_length=100)
    slug = models.SlugField(_("Slug"), max_length=100, unique=True)
    description = models.TextField(_("Description"), blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                              related_name='children', verbose_name=_("Parent Category"))
    image = models.ImageField(_("Image"), upload_to='categories/', blank=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Brand(models.Model):
    """Vehicle and machinery brands"""
    name = models.CharField(_("Name"), max_length=100)
    slug = models.SlugField(_("Slug"), max_length=100, unique=True)
    logo = models.ImageField(_("Logo"), upload_to='brands/', blank=True)
    description = models.TextField(_("Description"), blank=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Brand")
        verbose_name_plural = _("Brands")
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    """Base product model for all types of vehicles and machinery"""
    CONDITION_CHOICES = (
        ('new', _('New')),
        ('used', _('Used')),
    )
    
    AVAILABILITY_CHOICES = (
        ('in_stock', _('In Stock')),
        ('out_of_stock', _('Out of Stock')),
        ('pre_order', _('Pre-Order')),
    )
    
    # Basic information
    name = models.CharField(_("Name"), max_length=200)
    slug = models.SlugField(_("Slug"), max_length=200, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products',
                                verbose_name=_("Category"))
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products',
                             verbose_name=_("Brand"))
    model = models.CharField(_("Model"), max_length=100)
    year = models.PositiveIntegerField(_("Year"))
    description = models.TextField(_("Description"))
    
    # Pricing and availability
    price = models.DecimalField(_("Price"), max_digits=12, decimal_places=2)
    discounted_price = models.DecimalField(_("Discounted Price"), max_digits=12, decimal_places=2, 
                                          null=True, blank=True)
    condition = models.CharField(_("Condition"), max_length=10, choices=CONDITION_CHOICES, default='new')
    availability = models.CharField(_("Availability"), max_length=15, 
                                   choices=AVAILABILITY_CHOICES, default='in_stock')
    
    # Features
    color = models.CharField(_("Color"), max_length=50)
    featured = models.BooleanField(_("Featured"), default=False)
    is_active = models.BooleanField(_("Active"), default=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.brand.name} {self.name} ({self.year})"

class ProductImage(models.Model):
    """Images for products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images',
                               verbose_name=_("Product"))
    image = models.ImageField(_("Image"), upload_to='products/')
    alt_text = models.CharField(_("Alternative text"), max_length=200, blank=True)
    is_primary = models.BooleanField(_("Primary image"), default=False)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Product Image")
        verbose_name_plural = _("Product Images")
    
    def __str__(self):
        return f"Image for {self.product.name}"

class Motorcycle(models.Model):
    """Motorcycle specific details"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='motorcycle_details',
                                  verbose_name=_("Product"))
    engine_capacity = models.CharField(_("Engine capacity"), max_length=50, help_text=_("e.g. 150cc, 250cc"))
    horsepower = models.CharField(_("Horsepower"), max_length=50, blank=True)
    fuel_tank_capacity = models.CharField(_("Fuel tank capacity"), max_length=50, blank=True)
    transmission = models.CharField(_("Transmission"), max_length=100, blank=True)
    mileage = models.CharField(_("Mileage"), max_length=50, blank=True, help_text=_("For used motorcycles"))
    
    class Meta:
        verbose_name = _("Motorcycle Details")
        verbose_name_plural = _("Motorcycle Details")
    
    def __str__(self):
        return f"Details for {self.product.name}"

class Vehicle(models.Model):
    """Car and truck specific details"""
    TRANSMISSION_CHOICES = (
        ('manual', _('Manual')),
        ('automatic', _('Automatic')),
        ('semi_auto', _('Semi-Automatic')),
    )
    
    FUEL_TYPE_CHOICES = (
        ('gasoline', _('Gasoline')),
        ('diesel', _('Diesel')),
        ('electric', _('Electric')),
        ('hybrid', _('Hybrid')),
    )
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='vehicle_details',
                                  verbose_name=_("Product"))
    engine = models.CharField(_("Engine"), max_length=100, blank=True)
    transmission = models.CharField(_("Transmission"), max_length=20, choices=TRANSMISSION_CHOICES)
    fuel_type = models.CharField(_("Fuel type"), max_length=20, choices=FUEL_TYPE_CHOICES)
    mileage = models.PositiveIntegerField(_("Mileage"), null=True, blank=True, help_text=_("For used vehicles"))
    seats = models.PositiveSmallIntegerField(_("Number of seats"), default=5)
    doors = models.PositiveSmallIntegerField(_("Number of doors"), default=5)
    features = models.TextField(_("Additional features"), blank=True)
    
    class Meta:
        verbose_name = _("Vehicle Details")
        verbose_name_plural = _("Vehicle Details")
    
    def __str__(self):
        return f"Details for {self.product.name}"

class AgriculturalMachinery(models.Model):
    """Agricultural machinery specific details"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='machinery_details',
                                  verbose_name=_("Product"))
    machinery_type = models.CharField(_("Machinery type"), max_length=100, 
                                    help_text=_("e.g. Tractor, Harvester, Planter"))
    engine_power = models.CharField(_("Engine power"), max_length=100, blank=True)
    operating_hours = models.PositiveIntegerField(_("Operating hours"), null=True, blank=True, 
                                                 help_text=_("For used machinery"))
    features = models.TextField(_("Additional features"), blank=True)
    
    class Meta:
        verbose_name = _("Agricultural Machinery Details")
        verbose_name_plural = _("Agricultural Machinery Details")
    
    def __str__(self):
        return f"Details for {self.product.name}"
