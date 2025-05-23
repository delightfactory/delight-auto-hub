
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/db";

export interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  features?: string[];
  stock?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  category?: string;
}

// تحويل بيانات المنتج من قاعدة البيانات إلى تنسيق العرض
const transformProductToDisplay = (product: Product): ProductDisplay => {
  const priceText = `${product.price} جنيه`;
  const originalPriceText = product.discount_price ? `${product.discount_price} جنيه` : undefined;
  
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    fullDescription: product.description || '',
    price: product.discount_price ? `${product.discount_price} جنيه` : priceText,
    originalPrice: product.discount_price ? priceText : undefined,
    rating: 4.5, // يمكن إضافة نظام تقييم لاحقاً
    reviews: 0, // يمكن إضافة نظام مراجعات لاحقاً
    image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
    images: product.images || ['/placeholder.svg'],
    features: Array.isArray(product.features) ? product.features : [],
    stock: product.stock || 0,
    isNew: product.is_new || false,
    isFeatured: product.is_featured || false,
    category: product.category || undefined
  };
};

export const ProductDataService = {
  // جلب جميع المنتجات
  getAllProducts: async (): Promise<ProductDisplay[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('خطأ في جلب المنتجات:', error);
        return [];
      }
      
      return data?.map(transformProductToDisplay) || [];
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات:', error);
      return [];
    }
  },
  
  // جلب منتج واحد بالمعرف
  getProductById: async (id: string): Promise<ProductDisplay | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`خطأ في جلب المنتج ${id}:`, error);
        return null;
      }
      
      return data ? transformProductToDisplay(data) : null;
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتج:', error);
      return null;
    }
  },
  
  // جلب المنتجات المميزة
  getFeaturedProducts: async (): Promise<ProductDisplay[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(8);
      
      if (error) {
        console.error('خطأ في جلب المنتجات المميزة:', error);
        return [];
      }
      
      return data?.map(transformProductToDisplay) || [];
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات المميزة:', error);
      return [];
    }
  },
  
  // جلب المنتجات الجديدة
  getNewProducts: async (): Promise<ProductDisplay[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .limit(8);
      
      if (error) {
        console.error('خطأ في جلب المنتجات الجديدة:', error);
        return [];
      }
      
      return data?.map(transformProductToDisplay) || [];
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات الجديدة:', error);
      return [];
    }
  },
  
  // البحث في المنتجات
  searchProducts: async (query: string): Promise<ProductDisplay[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      
      if (error) {
        console.error('خطأ في البحث:', error);
        return [];
      }
      
      return data?.map(transformProductToDisplay) || [];
    } catch (error) {
      console.error('خطأ غير متوقع في البحث:', error);
      return [];
    }
  },

  // جلب المنتجات ذات الصلة (بناءً على الفئة)
  getRelatedProducts: async (productId: string, categoryId?: string): Promise<ProductDisplay[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .limit(4);
      
      if (categoryId) {
        query = query.eq('category', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('خطأ في جلب المنتجات ذات الصلة:', error);
        return [];
      }
      
      return data?.map(transformProductToDisplay) || [];
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات ذات الصلة:', error);
      return [];
    }
  }
};
