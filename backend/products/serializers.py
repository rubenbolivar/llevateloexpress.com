from rest_framework import serializers
from .models import (
    Category, Brand, Product, ProductImage,
    Motorcycle, Vehicle, AgriculturalMachinery
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'image']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

class MotorcycleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motorcycle
        exclude = ['product', 'id']

class VehicleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        exclude = ['product', 'id']

class AgriculturalMachineryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgriculturalMachinery
        exclude = ['product', 'id']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'brand', 'model', 'year', 
                 'price', 'discounted_price', 'condition', 'availability', 
                 'featured', 'primary_image']
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image:
            return ProductImageSerializer(primary_image).data
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    motorcycle_details = MotorcycleDetailSerializer(read_only=True)
    vehicle_details = VehicleDetailSerializer(read_only=True)
    machinery_details = AgriculturalMachineryDetailSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'brand', 'model', 'year', 
                 'description', 'price', 'discounted_price', 'condition', 
                 'availability', 'color', 'featured', 'images',
                 'motorcycle_details', 'vehicle_details', 'machinery_details',
                 'created_at', 'updated_at']

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'category', 'brand', 'model', 'year', 'description',
                 'price', 'discounted_price', 'condition', 'availability',
                 'color', 'featured', 'is_active']
    
    def create(self, validated_data):
        # Auto generate slug from name and year
        name = validated_data.get('name')
        year = validated_data.get('year')
        slug = f"{name.lower().replace(' ', '-')}-{year}"
        
        # Check for uniqueness
        counter = 0
        temp_slug = slug
        while Product.objects.filter(slug=temp_slug).exists():
            counter += 1
            temp_slug = f"{slug}-{counter}"
        
        validated_data['slug'] = temp_slug
        return super().create(validated_data)

class MotorcycleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motorcycle
        exclude = ['product']

class VehicleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        exclude = ['product']

class AgriculturalMachineryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgriculturalMachinery
        exclude = ['product'] 