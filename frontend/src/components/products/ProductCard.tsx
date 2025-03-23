'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { ProductListItem } from '@/api/productsApi';
import CurrencyDisplay from '@/components/ui/CurrencyDisplay';

interface ProductCardProps {
  product: ProductListItem;
}

const DEFAULT_IMAGE = '/images/placeholder-product.jpg';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    slug,
    name,
    brand,
    model,
    year,
    price,
    discounted_price,
    condition,
    availability,
    primary_image
  } = product;

  const imageUrl = primary_image?.image || DEFAULT_IMAGE;
  const hasDiscount = discounted_price && Number(discounted_price) < Number(price);
  
  // Función para traducir la disponibilidad
  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'En stock';
      case 'out_of_stock':
        return 'Agotado';
      case 'pre_order':
        return 'Pre-orden';
      default:
        return availability;
    }
  };
  
  // Función para traducir la condición
  const getConditionLabel = (condition: string) => {
    return condition === 'new' ? 'Nuevo' : 'Usado';
  };
  
  // Función para obtener el color del chip de disponibilidad
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'success';
      case 'out_of_stock':
        return 'error';
      case 'pre_order':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card elevation={2} sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}>
      <Link href={`/catalogo/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box sx={{ position: 'relative', paddingTop: '70%' }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          {/* Condición: nuevo o usado */}
          <Chip
            label={getConditionLabel(condition)}
            size="small"
            color={condition === 'new' ? 'primary' : 'default'}
            sx={{ 
              position: 'absolute', 
              top: 10, 
              left: 10,
              fontWeight: 'bold'
            }}
          />
          
          {/* Disponibilidad */}
          <Chip
            label={getAvailabilityLabel(availability)}
            size="small"
            color={getAvailabilityColor(availability) as any}
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10,
              fontWeight: 'bold'
            }}
          />
        </Box>
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" component="div" fontWeight="bold" noWrap>
            {name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {brand.name} {model} ({year})
          </Typography>
          
          <Box mt={2} display="flex" alignItems="baseline">
            {hasDiscount ? (
              <>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ textDecoration: 'line-through', mr: 1 }}
                >
                  <CurrencyDisplay amount={price} />
                </Typography>
                <Typography variant="h6" component="div" color="error" fontWeight="bold">
                  <CurrencyDisplay amount={discounted_price} />
                </Typography>
              </>
            ) : (
              <Typography variant="h6" component="div" color="primary" fontWeight="bold">
                <CurrencyDisplay amount={price} />
              </Typography>
            )}
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard; 