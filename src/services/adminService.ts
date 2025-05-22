import { supabase } from '@/integrations/supabase/client';
import { Product, Comment, OrderStatus } from '@/types/db';

// IMPORTANT: Note that the other services have been moved to separate files:
// - settingsService.ts contains siteSettingsService and appearanceService
// - We should consider further refactoring this file into smaller, focused service files

export const adminService = {
  // Products
  getAllProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  },

  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating product with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting product with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  },

  bulkUpdateProducts: async (products: Array<Partial<Product> & { id: string }>) => {
    try {
      for (const product of products) {
        const { error } = await supabase
          .from('products')
          .update(product)
          .eq('id', product.id);

        if (error) {
          console.error(`Error updating product with id ${product.id}:`, error);
          throw error;
        }
      }
      return true;
    } catch (error) {
      console.error('Error in bulkUpdateProducts:', error);
      throw error;
    }
  },

  // Categories
  getAllCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching category with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw error;
    }
  },

  createCategory: async (category: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  },

  updateCategory: async (id: string, category: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating category with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  },

  // Orders
  getAllOrders: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  },

  getOrderById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, email, phone, address),
          items:order_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching order with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating order status for id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  },

  // Customers
  getAllCustomers: async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      throw error;
    }
  },

  getCustomerById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching customer with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      throw error;
    }
  },

  updateCustomerRole: async (id: string, role: 'admin' | 'customer') => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ role })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating customer role for id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCustomerRole:', error);
      throw error;
    }
  },

  // Articles
  getAllArticles: async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllArticles:', error);
      throw error;
    }
  },

  getArticleById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching article with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getArticleById:', error);
      throw error;
    }
  },

  createArticle: async (article: any) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single();

      if (error) {
        console.error('Error creating article:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createArticle:', error);
      throw error;
    }
  },

  updateArticle: async (id: string, article: any) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(article)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating article with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateArticle:', error);
      throw error;
    }
  },

  deleteArticle: async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting article with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteArticle:', error);
      throw error;
    }
  },

  // For ArticlesPage.tsx
  toggleArticlePublished: async (id: string, publishState: boolean) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ published: publishState, published_at: publishState ? new Date().toISOString() : null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error toggling article publish state for id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in toggleArticlePublished:', error);
      throw error;
    }
  },

  // Comments
  getAllComments: async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:customers(name, email, avatar_url),
          product:products(name),
          article:articles(title, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      // Transform data to match Comment type
      const formattedComments = data?.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: {
          name: comment.author?.name || 'Anonymous',
          email: comment.author?.email || '',
          avatar_url: comment.author?.avatar_url || null,
        },
        product: comment.product ? {
          name: comment.product.name,
        } : undefined,
        article: comment.article ? {
          title: comment.article.title,
          slug: comment.article.slug,
        } : undefined,
        status: comment.status,
        created_at: comment.created_at,
      })) || [];

      return formattedComments;
    } catch (error) {
      console.error('Error in getAllComments:', error);
      throw error;
    }
  },

  updateCommentStatus: async (id: string, status: 'approved' | 'pending' | 'spam') => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating comment status for id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCommentStatus:', error);
      throw error;
    }
  },

  deleteComment: async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting comment with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  },
  
  // Dashboard stats
  fetchDashboardStats: async () => {
    try {
      // Get orders count
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' });
        
      if (ordersError) throw ordersError;
      
      // Get products count
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id', { count: 'exact' });
        
      if (productsError) throw productsError;
      
      // Get customers count
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' });
        
      if (customersError) throw customersError;
      
      // Get recent orders
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select('*, customer:customers(name)')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (recentOrdersError) throw recentOrdersError;
      
      return {
        ordersCount: ordersData.length,
        productsCount: productsData.length,
        customersCount: customersData.length,
        recentOrders: recentOrdersData
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

// Export service modules for legacy compatibility - these will be refactored later
export const productService = adminService;
export const categoryService = adminService;
export const orderService = adminService;
export const customerService = adminService;
export const articleService = adminService;
export const commentService = adminService;

// Make sure fetchDashboardStats is exported
export const fetchDashboardStats = adminService.fetchDashboardStats;
