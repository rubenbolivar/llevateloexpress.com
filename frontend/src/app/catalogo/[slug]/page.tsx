'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Divider, 
  Table, 
  TableBody, 
  TableRow, 
  TableCell,
  Breadcrumbs,
  CircularProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getProductDetail, ProductDetail } from '@/api/productsApi';
import CurrencyDisplay from '@/components/ui/CurrencyDisplay';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Manejar navegación hacia atrás
  const handleBack = () => {
    router.back();
  };
  
  // Obtener datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.slug) return;
      
      try {
        setLoading(true);
        const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
        const productData = await getProductDetail(slug);
        
        if (productData) {
          setProduct(productData);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.slug]);
  
  // Función para traducir la condición
  const getConditionLabel = (condition: string) => {
    return condition === 'new' ? 'Nuevo' : 'Usado';
  };
  
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
  
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'No se pudo cargar el producto'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Volver al catálogo
        </Button>
      </Container>
    );
  }
  
  // Preparar imágenes para la galería
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.image) 
    : ['/images/placeholder-product.jpg'];
  
  // Determinar qué tipo de detalles específicos mostrar
  const hasMotorcycleDetails = !!product.motorcycle_details;
  const hasVehicleDetails = !!product.vehicle_details;
  const hasMachineryDetails = !!product.machinery_details;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Inicio
          </Link>
          <Link href="/catalogo" style={{ textDecoration: 'none', color: 'inherit' }}>
            Catálogo
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
        
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="text"
          sx={{ mb: 3 }}
        >
          Volver al catálogo
        </Button>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={4}>
            {/* Galería de imágenes */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', width: '100%', pb: '70%', mb: 2 }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              </Box>
              
              {/* Miniaturas */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {images.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      width: 80,
                      height: 60,
                      border: index === selectedImageIndex ? '2px solid #1976d2' : '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
            
            {/* Información del producto */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {product.name}
                </Typography>
                
                <Box>
                  <Chip
                    label={getConditionLabel(product.condition)}
                    color={product.condition === 'new' ? 'primary' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={getAvailabilityLabel(product.availability)}
                    color={getAvailabilityColor(product.availability) as any}
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {product.brand.name} - {product.model} ({product.year})
              </Typography>
              
              <Box sx={{ my: 3 }}>
                {product.discounted_price ? (
                  <>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ textDecoration: 'line-through', display: 'inline-block', mr: 2 }}
                    >
                      <CurrencyDisplay amount={product.price} />
                    </Typography>
                    <Typography variant="h4" color="error" fontWeight="bold" display="inline">
                      <CurrencyDisplay amount={product.discounted_price} />
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    <CurrencyDisplay amount={product.price} />
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<CalculateIcon />}
                  component={Link}
                  href={`/calculadora?vehiculo=${product.slug}`}
                  sx={{ mb: 2 }}
                >
                  Calcular Financiamiento
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  fullWidth
                  disabled={product.availability === 'out_of_stock'}
                  startIcon={<ShoppingCartIcon />}
                  component={Link}
                  href={`/solicitar?vehiculo=${product.slug}`}
                >
                  Solicitar Ahora
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Especificaciones técnicas */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Especificaciones Técnicas
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={4}>
            {/* Características generales */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Características Generales
              </Typography>
              
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                      Marca
                    </TableCell>
                    <TableCell>{product.brand.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                      Modelo
                    </TableCell>
                    <TableCell>{product.model}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                      Año
                    </TableCell>
                    <TableCell>{product.year}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                      Color
                    </TableCell>
                    <TableCell>{product.color}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                      Condición
                    </TableCell>
                    <TableCell>{getConditionLabel(product.condition)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
            
            {/* Características específicas según tipo */}
            <Grid item xs={12} md={6}>
              {hasMotorcycleDetails && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Especificaciones de Motocicleta
                  </Typography>
                  
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                          Cilindrada
                        </TableCell>
                        <TableCell>{product.motorcycle_details.engine_capacity}</TableCell>
                      </TableRow>
                      {product.motorcycle_details.horsepower && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Potencia
                          </TableCell>
                          <TableCell>{product.motorcycle_details.horsepower}</TableCell>
                        </TableRow>
                      )}
                      {product.motorcycle_details.fuel_tank_capacity && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Capacidad de Tanque
                          </TableCell>
                          <TableCell>{product.motorcycle_details.fuel_tank_capacity}</TableCell>
                        </TableRow>
                      )}
                      {product.motorcycle_details.transmission && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Transmisión
                          </TableCell>
                          <TableCell>{product.motorcycle_details.transmission}</TableCell>
                        </TableRow>
                      )}
                      {product.motorcycle_details.mileage && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Kilometraje
                          </TableCell>
                          <TableCell>{product.motorcycle_details.mileage}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
              
              {hasVehicleDetails && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Especificaciones de Vehículo
                  </Typography>
                  
                  <Table>
                    <TableBody>
                      {product.vehicle_details.engine && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                            Motor
                          </TableCell>
                          <TableCell>{product.vehicle_details.engine}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          Transmisión
                        </TableCell>
                        <TableCell>
                          {product.vehicle_details.transmission === 'manual' ? 'Manual' : 
                           product.vehicle_details.transmission === 'automatic' ? 'Automática' : 
                           'Semi-automática'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          Combustible
                        </TableCell>
                        <TableCell>
                          {product.vehicle_details.fuel_type === 'gasoline' ? 'Gasolina' : 
                           product.vehicle_details.fuel_type === 'diesel' ? 'Diésel' : 
                           product.vehicle_details.fuel_type === 'electric' ? 'Eléctrico' : 
                           'Híbrido'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          Asientos
                        </TableCell>
                        <TableCell>{product.vehicle_details.seats}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          Puertas
                        </TableCell>
                        <TableCell>{product.vehicle_details.doors}</TableCell>
                      </TableRow>
                      {product.vehicle_details.mileage && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Kilometraje
                          </TableCell>
                          <TableCell>{product.vehicle_details.mileage} km</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
              
              {hasMachineryDetails && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Especificaciones de Maquinaria Agrícola
                  </Typography>
                  
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                          Tipo de Maquinaria
                        </TableCell>
                        <TableCell>{product.machinery_details.machinery_type}</TableCell>
                      </TableRow>
                      {product.machinery_details.engine_power && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Potencia del Motor
                          </TableCell>
                          <TableCell>{product.machinery_details.engine_power}</TableCell>
                        </TableRow>
                      )}
                      {product.machinery_details.operating_hours !== null && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            Horas de Operación
                          </TableCell>
                          <TableCell>{product.machinery_details.operating_hours} horas</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </div>
  );
} 