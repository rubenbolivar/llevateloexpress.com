from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FinancingPlanViewSet,
    FinancingCalculatorView,
    ProductFinancingOptionsView,
    SaveSimulationView,
    UserSimulationsView
)

app_name = 'financing'

urlpatterns = [
    # Planes de financiamiento
    path('plans/', FinancingPlanViewSet.as_view({'get': 'list'}), name='financing-plans'),
    
    # Calculadora
    path('calculator/', FinancingCalculatorView.as_view(), name='financing-calculator'),
    
    # Opciones de financiamiento para un producto
    path('products/<int:product_id>/options/', ProductFinancingOptionsView.as_view(), name='product-financing-options'),
    
    # Simulaciones
    path('simulations/save/', SaveSimulationView.as_view(), name='save-simulation'),
    path('simulations/user/', UserSimulationsView.as_view(), name='user-simulations'),
] 