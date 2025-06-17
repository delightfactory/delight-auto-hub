import { supabase } from "@/integrations/supabase/client";
import { Product, Category } from "@/types/db";
import { caveService } from "./caveService";

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
  usage_instructions?: string;
  brand?: string;
  subtype?: string;
  vendor?: string;
  country_of_origin?: string;
  video_url?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
  points_earned?: number;
  points_required?: number;
  cave_enabled?: boolean;
  cave_price?: number;
  cave_required_points?: number;
  cave_max_quantity?: number;
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
    rating: 0,
    reviews: 0,
    image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
    images: product.images || ['/placeholder.svg'],
    features: Array.isArray(product.features) ? product.features : [],
    stock: typeof product.stock === 'number' ? product.stock : 0,
    isNew: product.is_new || false,
    isFeatured: product.is_featured || false,
    category: product.category || undefined,
    usage_instructions: product.usage_instructions || '',
    brand: product.brand || undefined,
    subtype: product.subtype || undefined,
    vendor: product.vendor || undefined,
    country_of_origin: product.country_of_origin || undefined,
    video_url: product.video_url || undefined,
    dimensions: product.dimensions,
    points_earned: product.points_earned ?? undefined,
    points_required: product.points_required ?? undefined,
    cave_enabled: product.cave_enabled ?? false,
    cave_price: product.cave_price ?? undefined,
    cave_required_points: product.cave_required_points ?? undefined,
    cave_max_quantity: product.cave_max_quantity ?? undefined,
  };
};

// مساعد لإضافة التقييمات الحقيقية لعرض المنتج
const addRatingsToDisplay = async (product: ProductDisplay): Promise<ProductDisplay> => {
  const { data: reviewsData, error: revErr } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', product.id)
    .eq('approved', true);
  if (revErr) console.error('Error fetching reviews for product', product.id, revErr);
  const count = reviewsData?.length || 0;
  const avgRating = count
    ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;
  return { ...product, rating: avgRating, reviews: count };
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
      
      const products = data || [];
      const displays = products.map(transformProductToDisplay);
      return await Promise.all(displays.map(addRatingsToDisplay));
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
      
      if (!data) return null;
      const display = transformProductToDisplay(data);
      return await addRatingsToDisplay(display);
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
      
      const products = data || [];
      const productsWithReviews = await Promise.all(
        products.map(async prod => {
          const display = transformProductToDisplay(prod);
          const { data: reviewsData, error: revErr } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', prod.id)
            .eq('approved', true);
          if (revErr) {
            console.error('Error fetching reviews for product', prod.id, revErr);
            return display;
          }
          const count = reviewsData?.length || 0;
          const avgRating = count
            ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / count
            : 0;
          return { ...display, rating: avgRating, reviews: count };
        })
      );
      return productsWithReviews;
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
      
      const products = data || [];
      const productsWithReviews = await Promise.all(
        products.map(async prod => {
          const display = transformProductToDisplay(prod);
          const { data: reviewsData, error: revErr } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', prod.id)
            .eq('approved', true);
          if (revErr) {
            console.error('Error fetching reviews for product', prod.id, revErr);
            return display;
          }
          const count = reviewsData?.length || 0;
          const avgRating = count
            ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / count
            : 0;
          return { ...display, rating: avgRating, reviews: count };
        })
      );
      return productsWithReviews;
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
      
      const products = data || [];
      const displays = products.map(transformProductToDisplay);
      return await Promise.all(displays.map(addRatingsToDisplay));
    } catch (error) {
      console.error('خطأ غير متوقع في البحث:', error);
      return [];
    }
  },

  // جلب المنتجات ذات الصلة (بناءً على الفئة)
  getRelatedProducts: async (productId: string, categoryId?: string): Promise<ProductDisplay[]> => {
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .limit(4);
      if (categoryId) {
        queryBuilder = queryBuilder.eq('category', categoryId);
      }
      const { data, error } = await queryBuilder;
      
      if (error) {
        console.error('خطأ في جلب المنتجات ذات الصلة:', error);
        return [];
      }
      
      const products = data || [];
      const displays = products.map(transformProductToDisplay);
      return await Promise.all(displays.map(addRatingsToDisplay));
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات ذات الصلة:', error);
      return [];
    }
  },

  // جلب منتجات المغارة
  getCaveProducts: async (category?: string): Promise<ProductDisplay[]> => {
    try {
      // استخدام خدمة المغارة لجلب المنتجات
      const products = await caveService.getCaveProducts(category);
      
      // تحويل البيانات إلى تنسيق العرض
      const displays = products.map(transformProductToDisplay);
      return await Promise.all(displays.map(addRatingsToDisplay));
    } catch (error) {
      console.error('خطأ في جلب منتجات المغارة:', error);
      return [];
    }
  },

  // جلب فئات منتجات المغارة
  getCaveCategories: async (): Promise<Category[]> => {
    try {
      // استخدام خدمة المغارة لجلب الفئات
      return await caveService.getCaveCategories();
    } catch (error) {
      console.error('خطأ في جلب فئات منتجات المغارة:', error);
      return [];
    }
  },

  // جلب منتج المغارة بواسطة المعرف
  getCaveProductById: async (productId: string): Promise<ProductDisplay | null> => {
    try {
      // استخدام خدمة المغارة لجلب المنتج
      const product = await caveService.getCaveProductById(productId);
      
      if (!product) return null;
      
      // تحويل البيانات إلى تنسيق العرض
      const display = transformProductToDisplay(product);
      return await addRatingsToDisplay(display);
    } catch (error) {
      console.error(`خطأ في جلب منتج المغارة رقم ${productId}:`, error);
      return null;
    }
  }
};
