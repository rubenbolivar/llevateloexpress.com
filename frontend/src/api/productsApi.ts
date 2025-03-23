import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios para productos
const productsApi = axios.create({
  baseURL: `${BASE_URL}/products`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  image: string | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  category: Category;
  brand: Brand;
  model: string;
  year: number;
  price: string;
  discounted_price: string | null;
  condition: 'new' | 'used';
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  featured: boolean;
  primary_image: ProductImage | null;
}

export interface MotorcycleDetails {
  engine_capacity: string;
  horsepower: string;
  fuel_tank_capacity: string;
  transmission: string;
  mileage: string;
}

export interface VehicleDetails {
  engine: string;
  transmission: 'manual' | 'automatic' | 'semi_auto';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  mileage: number | null;
  seats: number;
  doors: number;
  features: string;
}

export interface MachineryDetails {
  machinery_type: string;
  engine_power: string;
  operating_hours: number | null;
  features: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  color: string;
  images: ProductImage[];
  motorcycle_details?: MotorcycleDetails;
  vehicle_details?: VehicleDetails;
  machinery_details?: MachineryDetails;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchParams {
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  condition?: 'new' | 'used';
  year_min?: number;
  year_max?: number;
  search?: string;
  ordering?: 'price' | '-price' | 'year' | '-year' | 'created_at' | '-created_at';
}

// Funciones para categorías
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await productsApi.get('/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryProducts = async (slug: string): Promise<ProductListItem[]> => {
  try {
    const response = await productsApi.get(`/categories/${slug}/products/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${slug}:`, error);
    return [];
  }
};

// Funciones para marcas
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const response = await productsApi.get('/brands/');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
};

export const getBrandProducts = async (slug: string): Promise<ProductListItem[]> => {
  try {
    const response = await productsApi.get(`/brands/${slug}/products/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for brand ${slug}:`, error);
    return [];
  }
};

// Funciones para productos
export const getProductsList = async (): Promise<ProductListItem[]> => {
  try {
    const response = await productsApi.get('/items/');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<ProductListItem[]> => {
  try {
    const response = await productsApi.get('/items/featured/');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const getProductDetail = async (slug: string): Promise<ProductDetail | null> => {
  try {
    const response = await productsApi.get(`/items/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product detail for ${slug}:`, error);
    return null;
  }
};

export const searchProducts = async (params: ProductSearchParams): Promise<ProductListItem[]> => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.condition) queryParams.append('condition', params.condition);
    if (params.year_min) queryParams.append('year_min', params.year_min.toString());
    if (params.year_max) queryParams.append('year_max', params.year_max.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    const url = `/search/${queryString ? `?${queryString}` : ''}`;
    
    const response = await productsApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export default {
  getCategories,
  getCategoryProducts,
  getBrands,
  getBrandProducts,
  getProductsList,
  getFeaturedProducts,
  getProductDetail,
  searchProducts
}; 