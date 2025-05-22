
// Re-export our improved ProductsAPI for backwards compatibility
import { Product } from '@/types/db';
import { ProductsAPI } from './productsAPI';

// Create a synchronous version of the product service for backward compatibility
export const ProductService = {
  getProductById: (id: string): Product => {
    // This is a synchronous function that returns a placeholder product
    // It's used in places where we can't easily switch to async
    return {
      id: id,
      name: 'Product',
      description: 'Loading...',
      price: 0,
      product_code: '',
      is_featured: false,
      is_new: false,
      images: ['https://placehold.co/40'],
    };
  }
};

export type { Product } from '@/types/db';
