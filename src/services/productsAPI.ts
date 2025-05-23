
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/db";

export const ProductsAPI = {
  /**
   * Fetches all products from the database
   */
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  /**
   * Fetches a product by its ID
   */
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },

  /**
   * Fetches featured products
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(4);

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  },

  /**
   * Fetches new products
   */
  getNewProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .limit(4);

      if (error) {
        console.error('Error fetching new products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch new products:', error);
      throw error;
    }
  },

  /**
   * Fetches products by category
   */
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryId);

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      throw error;
    }
  }
};
