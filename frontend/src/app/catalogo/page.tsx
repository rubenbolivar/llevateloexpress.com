'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Skeleton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {
  getCategories,
  getBrands,
  getProductsList,
  searchProducts,
  Category,
  Brand,
  ProductListItem,
  ProductSearchParams
} from '@/api/productsApi';
import ProductCard from '@/components/products/ProductCard';
import ProductsFilter from '@/components/products/ProductsFilter';

export default function CatalogoPage() {
  // Estados para datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductSearchParams>({});
  const [ordering, setOrdering] = useState<string>('-created_at');
  
  // Obtener parámetros de la URL
  const searchParams = useSearchParams();
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Obtener categorías y marcas para los filtros
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands()
        ]);
        
        setCategories(categoriesData);
        setBrands(brandsData);
        
        // Construir filtros iniciales desde la URL
        const initialFilters: ProductSearchParams = {};
        
        const category = searchParams.get('category');
        const brand = searchParams.get('brand');
        const min_price = searchParams.get('min_price');
        const max_price = searchParams.get('max_price');
        const condition = searchParams.get('condition');
        const year_min = searchParams.get('year_min');
        const year_max = searchParams.get('year_max');
        const search = searchParams.get('search');
        const sort = searchParams.get('ordering');
        
        if (category) initialFilters.category = category;
        if (brand) initialFilters.brand = brand;
        if (min_price) initialFilters.min_price = Number(min_price);
        if (max_price) initialFilters.max_price = Number(max_price);
        if (condition && (condition === 'new' || condition === 'used')) {
          initialFilters.condition = condition;
        }
        if (year_min) initialFilters.year_min = Number(year_min);
        if (year_max) initialFilters.year_max = Number(year_max);
        if (search) {
          initialFilters.search = search;
          setSearchTerm(search);
        }
        if (sort) {
          initialFilters.ordering = sort as any;
          setOrdering(sort);
        }
        
        setFilters(initialFilters);
        
        // Cargar productos con los filtros iniciales
        const productsData = Object.keys(initialFilters).length > 0
          ? await searchProducts(initialFilters)
          : await getProductsList();
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('No se pudieron cargar los productos. Por favor, intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [searchParams]);
  
  // Actualizar productos cuando cambian los filtros o la ordenación
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        
        const searchFilters = { ...filters };
        
        // Añadir término de búsqueda si existe
        if (searchTerm) {
          searchFilters.search = searchTerm;
        }
        
        // Añadir ordenación
        if (ordering) {
          searchFilters.ordering = ordering as any;
        }
        
        // Buscar productos con los filtros
        const productsData = await searchProducts(searchFilters);
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
        setError('Error al aplicar los filtros.');
      } finally {
        setLoading(false);
      }
    };
    
    // Omitir la primera carga, ya manejada por el efecto inicial
    if (!loading) {
      fetchFilteredProducts();
    }
  }, [filters, ordering, searchTerm]);
  
  // Manejar cambio en los filtros
  const handleFilterChange = (newFilters: ProductSearchParams) => {
    setFilters(newFilters);
  };
  
  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda se realiza automáticamente por el efecto
  };
  
  // Renderizar esqueletos de carga
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="text" height={32} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" sx={{ mt: 2 }} />
        </Paper>
      </Grid>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Catálogo de Vehículos
        </Typography>
        
        <Grid container spacing={4}>
          {/* Sidebar con filtros */}
          <Grid item xs={12} md={3}>
            <ProductsFilter
              categories={categories}
              brands={brands}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </Grid>
          
          {/* Listado de productos */}
          <Grid item xs={12} md={9}>
            {/* Barra de búsqueda y ordenación */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
              <Box component="form" onSubmit={handleSearch} flexGrow={1}>
                <TextField
                  fullWidth
                  placeholder="Buscar vehículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear search"
                          onClick={() => setSearchTerm('')}
                          edge="end"
                        >
                          &times;
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="sort-label">Ordenar por</InputLabel>
                <Select
                  labelId="sort-label"
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  label="Ordenar por"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="-created_at">Más recientes</MenuItem>
                  <MenuItem value="price">Precio: menor a mayor</MenuItem>
                  <MenuItem value="-price">Precio: mayor a menor</MenuItem>
                  <MenuItem value="-year">Año: más nuevos</MenuItem>
                  <MenuItem value="year">Año: más antiguos</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Mensajes de error */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Resultados */}
            {!loading && products.length === 0 ? (
              <Alert severity="info">
                No se encontraron productos que coincidan con los criterios de búsqueda.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {loading ? renderSkeletons() : products.map(product => (
                  <Grid item xs={12} sm={6} md={4} lg={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
} 