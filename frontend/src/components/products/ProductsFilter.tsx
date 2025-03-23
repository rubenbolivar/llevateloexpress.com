'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  Theme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Category, Brand, ProductSearchParams } from '@/api/productsApi';
import { formatCurrency } from '@/lib/utils';

interface ProductsFilterProps {
  categories: Category[];
  brands: Brand[];
  onFilterChange: (filters: ProductSearchParams) => void;
  initialFilters?: ProductSearchParams;
}

const ProductsFilter = ({ 
  categories, 
  brands, 
  onFilterChange,
  initialFilters = {}
}: ProductsFilterProps) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  
  // Estados para los filtros
  const [categorySlug, setCategorySlug] = useState<string | undefined>(initialFilters.category);
  const [brandSlug, setBrandSlug] = useState<string | undefined>(initialFilters.brand);
  const [priceRange, setPriceRange] = useState<number[]>([
    initialFilters.min_price || 0,
    initialFilters.max_price || 100000
  ]);
  const [yearRange, setYearRange] = useState<number[]>([
    initialFilters.year_min || new Date().getFullYear() - 10,
    initialFilters.year_max || new Date().getFullYear()
  ]);
  const [condition, setCondition] = useState<'new' | 'used' | undefined>(initialFilters.condition);
  
  // Efecto para notificar cambios en los filtros
  useEffect(() => {
    const filters: ProductSearchParams = {};
    
    if (categorySlug) filters.category = categorySlug;
    if (brandSlug) filters.brand = brandSlug;
    if (priceRange[0] > 0) filters.min_price = priceRange[0];
    if (priceRange[1] < 100000) filters.max_price = priceRange[1];
    if (yearRange[0] > new Date().getFullYear() - 10) filters.year_min = yearRange[0];
    if (yearRange[1] < new Date().getFullYear()) filters.year_max = yearRange[1];
    if (condition) filters.condition = condition;
    
    onFilterChange(filters);
  }, [categorySlug, brandSlug, priceRange, yearRange, condition, onFilterChange]);
  
  // Función para resetear filtros
  const resetFilters = () => {
    setCategorySlug(undefined);
    setBrandSlug(undefined);
    setPriceRange([0, 100000]);
    setYearRange([new Date().getFullYear() - 10, new Date().getFullYear()]);
    setCondition(undefined);
  };
  
  // Obtener formato de moneda para el slider
  const getPriceText = (value: number) => {
    return formatCurrency(value);
  };
  
  // Renderizar el contenido del filtro
  const filterContent = (
    <>
      {/* Filtro de Categoría */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Categoría
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="category-select-label">Seleccionar categoría</InputLabel>
          <Select
            labelId="category-select-label"
            value={categorySlug || ''}
            onChange={(e) => setCategorySlug(e.target.value || undefined)}
            label="Seleccionar categoría"
          >
            <MenuItem value="">Todas las categorías</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.slug} value={category.slug}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Filtro de Marca */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Marca
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="brand-select-label">Seleccionar marca</InputLabel>
          <Select
            labelId="brand-select-label"
            value={brandSlug || ''}
            onChange={(e) => setBrandSlug(e.target.value || undefined)}
            label="Seleccionar marca"
          >
            <MenuItem value="">Todas las marcas</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.slug} value={brand.slug}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Filtro de Precio */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Precio
        </Typography>
        <Box px={1}>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue as number[])}
            valueLabelDisplay="auto"
            valueLabelFormat={getPriceText}
            min={0}
            max={100000}
            step={1000}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              {getPriceText(priceRange[0])}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getPriceText(priceRange[1])}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Filtro de Año */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Año
        </Typography>
        <Box px={1}>
          <Slider
            value={yearRange}
            onChange={(_, newValue) => setYearRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={new Date().getFullYear() - 10}
            max={new Date().getFullYear()}
            step={1}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              {yearRange[0]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {yearRange[1]}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Filtro de Condición */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Condición
        </Typography>
        <RadioGroup
          value={condition || ''}
          onChange={(e) => setCondition(e.target.value as 'new' | 'used' | undefined || undefined)}
        >
          <FormControlLabel value="" control={<Radio />} label="Todas" />
          <FormControlLabel value="new" control={<Radio />} label="Nuevo" />
          <FormControlLabel value="used" control={<Radio />} label="Usado" />
        </RadioGroup>
      </Box>
      
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        onClick={resetFilters}
        sx={{ mt: 2 }}
      >
        Limpiar Filtros
      </Button>
    </>
  );
  
  // Renderizar responsive
  return isMobile ? (
    <Accordion sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center">
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Filtros
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {filterContent}
      </AccordionDetails>
    </Accordion>
  ) : (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        Filtros
      </Typography>
      {filterContent}
    </Box>
  );
};

export default ProductsFilter; 