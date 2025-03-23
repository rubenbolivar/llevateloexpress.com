from django.shortcuts import render
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import (
    Category, Brand, Product, ProductImage,
    Motorcycle, Vehicle, AgriculturalMachinery
)
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    ProductImageSerializer, MotorcycleCreateSerializer,
    VehicleCreateSerializer, AgriculturalMachineryCreateSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products for a category"""
        category = self.get_object()
        products = Product.objects.filter(Q(category=category) | Q(category__parent=category))
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products for a brand"""
        brand = self.get_object()
        products = Product.objects.filter(brand=brand)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand__name', 'model']
    ordering_fields = ['price', 'created_at', 'year']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductDetailSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        featured = Product.objects.filter(featured=True, is_active=True)
        serializer = ProductListSerializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, slug=None):
        """Upload an image for a product"""
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_motorcycle_details(self, request, slug=None):
        """Add motorcycle specific details to a product"""
        product = self.get_object()
        serializer = MotorcycleCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_vehicle_details(self, request, slug=None):
        """Add vehicle specific details to a product"""
        product = self.get_object()
        serializer = VehicleCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_machinery_details(self, request, slug=None):
        """Add agricultural machinery specific details to a product"""
        product = self.get_object()
        serializer = AgriculturalMachineryCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductSearchView(generics.ListAPIView):
    """Advanced search for products"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Apply filters based on query params
        category_slug = self.request.query_params.get('category')
        brand_slug = self.request.query_params.get('brand')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        condition = self.request.query_params.get('condition')
        year_min = self.request.query_params.get('year_min')
        year_max = self.request.query_params.get('year_max')
        
        if category_slug:
            category = get_object_or_404(Category, slug=category_slug)
            queryset = queryset.filter(
                Q(category=category) | Q(category__parent=category)
            )
        
        if brand_slug:
            brand = get_object_or_404(Brand, slug=brand_slug)
            queryset = queryset.filter(brand=brand)
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        if condition:
            queryset = queryset.filter(condition=condition)
        
        if year_min:
            queryset = queryset.filter(year__gte=year_min)
        
        if year_max:
            queryset = queryset.filter(year__lte=year_max)
        
        return queryset
