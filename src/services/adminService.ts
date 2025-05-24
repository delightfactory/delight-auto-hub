import { supabase } from "@/integrations/supabase/client";
import { Product, Comment } from "@/types/db";

// التحقق إذا كان المستخدم مسؤول
export const checkIfAdmin = async () => {
  try {
    const { data: isAdmin, error } = await supabase
      .rpc('is_admin');

    if (error) {
      console.error("خطأ في التحقق من صلاحيات المسؤول:", error);
      return false;
    }
    
    return isAdmin;
  } catch (error) {
    console.error("خطأ غير متوقع:", error);
    return false;
  }
};

// جلب إحصائيات لوحة التحكم
export const fetchDashboardStats = async () => {
  try {
    // إجمالي المنتجات
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // إجمالي الطلبات
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // إجمالي العملاء
    const { count: customersCount, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // آخر الطلبات
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (productsError || ordersError || customersError || recentOrdersError) {
      console.error("خطأ في جلب الإحصائيات:", { productsError, ordersError, customersError, recentOrdersError });
    }

    return {
      productsCount: productsCount || 0,
      ordersCount: ordersCount || 0,
      customersCount: customersCount || 0,
      recentOrders: recentOrders || []
    };
  } catch (error) {
    console.error("خطأ غير متوقع في جلب الإحصائيات:", error);
    return {
      productsCount: 0,
      ordersCount: 0,
      customersCount: 0,
      recentOrders: []
    };
  }
};

// خدمات إدارة المنتجات
export const productService = {
  // جلب جميع المنتجات
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("خطأ في جلب المنتجات:", error);
      throw error;
    }
    return data || [];
  },
  
  // جلب منتج بواسطة المعرف
  getProductById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`خطأ في جلب المنتج رقم ${id}:`, error);
      throw error;
    }
    return data as Product;
  },
  
  // إنشاء منتج جديد
  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    
    if (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      throw error;
    }
    return data?.[0] as Product;
  },
  
  // تحديث منتج موجود
  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    // تأكد من أن الفئة عبارة عن معرف UUID
    if (productData.category && typeof productData.category === 'string') {
      // تأكد من أن الفئة هي معرف UUID صالح، وإلا اجعلها null
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(productData.category)) {
        console.warn("تم توفير فئة غير صالحة، سيتم تعيينها إلى null");
        productData.category = null;
      }
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`خطأ في تحديث المنتج رقم ${id}:`, error);
      throw error;
    }
    return data?.[0] as Product;
  },
  
  // حذف منتج
  deleteProduct: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`خطأ في حذف المنتج رقم ${id}:`, error);
      throw error;
    }
    return true;
  },
};

// خدمات إدارة الطلبات
export const orderService = {
  // جلب جميع الطلبات
  getOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("خطأ في جلب الطلبات:", error);
      throw error;
    }
    return data || [];
  },
  
  // جلب طلب بواسطة المعرف
  getOrderById: async (id: string) => {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      console.error(`خطأ في جلب الطلب رقم ${id}:`, error);
      throw error || new Error("Order not found");
    }

    // جلب تفاصيل المنتجات وربطها بكل عنصر
    const productIds = order.order_items?.map(item => item.product_id).filter(pid => pid) ?? [];
    if (productIds.length) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds);
      if (!productsError && products) {
        const prodMap = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, any>);
        order.order_items = order.order_items.map(item => ({
          ...item,
          product: prodMap[item.product_id] ?? null
        }));
      }
    }

    return order;
  },
  
  // تحديث حالة طلب
  updateOrderStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`خطأ في تحديث حالة الطلب رقم ${id}:`, error);
      throw error;
    }
    return data?.[0];
  }
};

// خدمات إدارة العملاء
export const customerService = {
  // جلب جميع العملاء
  getCustomers: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("خطأ في جلب العملاء:", error);
      throw error;
    }
    return data || [];
  },
  
  // جلب عميل بواسطة المعرف
  getCustomerById: async (id: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`خطأ في جلب العميل رقم ${id}:`, error);
      throw error;
    }
    return data;
  },
  
  // تحديث دور عميل (ترقية أو تخفيض)
  updateCustomerRole: async (id: string, role: 'admin' | 'customer') => {
    const { data, error } = await supabase
      .from('customers')
      .update({ role })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`خطأ في تحديث دور العميل رقم ${id}:`, error);
      throw error;
    }
    return data?.[0];
  }
};

// خدمات إدارة المقالات
export const articleService = {
  // جلب جميع المقالات
  getArticles: async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:customers(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("خطأ في جلب المقالات:", error);
      throw error;
    }
    return data || [];
  },
  
  // جلب مقال بواسطة المعرف
  getArticleById: async (id: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:customers(name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`خطأ في جلب المقال رقم ${id}:`, error);
      throw error;
    }
    return data;
  },
  
  // إنشاء مقال جديد
  createArticle: async (articleData: any) => {
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select();
    
    if (error) {
      console.error("خطأ في إنشاء المقال:", error);
      throw error;
    }
    return data?.[0];
  },
  
  // تحديث مقال موجود
  updateArticle: async (id: string, articleData: any) => {
    const { data, error } = await supabase
      .from('articles')
      .update(articleData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`خطأ في تحديث المقال رقم ${id}:`, error);
      throw error;
    }
    return data?.[0];
  },
  
  // حذف مقال
  deleteArticle: async (id: string) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`خطأ في حذف المقال رقم ${id}:`, error);
      throw error;
    }
    return true;
  },
  
  // نشر أو إلغاء نشر مقال
  toggleArticlePublished: async (id: string, published: boolean) => {
    const { data, error } = await supabase
      .from('articles')
      .update({ 
        published, 
        published_at: published ? new Date().toISOString() : null 
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`خطأ في تغيير حالة نشر المقال رقم ${id}:`, error);
      throw error;
    }
    return data?.[0];
  }
};

// خدمات إدارة الفئات
export const categoryService = {
  // جلب جميع الفئات
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("خطأ في جلب الفئات:", error);
      throw error;
    }
    return data || [];
  },
  
  // جلب فئة بواسطة المعرف
  getCategoryById: async (id: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`خطأ في جلب الفئة رقم ${id}:`, error);
      throw error;
    }
    return data;
  },
  
  // إنشاء فئة جديدة
  createCategory: async (categoryData: any) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();
    
    if (error) {
      console.error("خطأ في إنشاء الفئة:", error);
      throw error;
    }
    return data?.[0];
  },
  
  // تحديث فئة موجودة
  updateCategory: async (id: string, categoryData: any) => {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`خطأ في تحديث الفئة رقم ${id}:`, error);
      throw error;
    }
    return data?.[0];
  },
  
  // حذف فئة
  deleteCategory: async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`خطأ في حذف الفئة رقم ${id}:`, error);
      throw error;
    }
    return true;
  }
};

// خدمات إدارة التعليقات
export const commentService = {
  getComments: async (): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `id, content, status, created_at,
         author:customers(name, email, avatar_url),
         product:products(name),
         article:articles(title, slug)`
      )
      .order('created_at', { ascending: false });
    if (error) {
      console.error("خطأ في جلب التعليقات:", error);
      throw error;
    }
    const rows = data ?? [];
    return rows.map(r => {
      const authorInfo = Array.isArray(r.author) ? r.author[0] : r.author;
      const productInfo = Array.isArray(r.product) ? r.product[0] : r.product;
      const articleInfo = r.article ? (Array.isArray(r.article) ? r.article[0] : r.article) : undefined;
      return {
        id: r.id,
        content: r.content,
        author: {
          name: authorInfo.name,
          email: authorInfo.email,
          avatar_url: authorInfo.avatar_url,
        },
        product: productInfo ? { name: productInfo.name } : undefined,
        article: articleInfo ? { title: articleInfo.title, slug: articleInfo.slug } : undefined,
        status: r.status,
        created_at: r.created_at,
      };
    });
  },
  updateCommentStatus: async (id: string, status: 'approved' | 'pending' | 'spam'): Promise<Comment> => {
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id)
      .select(
        `id, content, status, created_at,
         author:customers(name, email, avatar_url),
         product:products(name),
         article:articles(title, slug)`
      )
      .maybeSingle();
    if (error) {
      console.error(`خطأ في تحديث حالة التعليق رقم ${id}:`, error);
      throw error;
    }
    if (!data) throw new Error(`Comment ${id} not found`);
    const authorInfo = Array.isArray(data.author) ? data.author[0] : data.author;
    const productInfo = Array.isArray(data.product) ? data.product[0] : data.product;
    const articleInfo = data.article ? (Array.isArray(data.article) ? data.article[0] : data.article) : undefined;
    return {
      id: data.id,
      content: data.content,
      author: {
        name: authorInfo.name,
        email: authorInfo.email,
        avatar_url: authorInfo.avatar_url,
      },
      product: productInfo ? { name: productInfo.name } : undefined,
      article: articleInfo ? { title: articleInfo.title, slug: articleInfo.slug } : undefined,
      status: data.status,
      created_at: data.created_at,
    };
  },
  deleteComment: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(`خطأ في حذف التعليق رقم ${id}:`, error);
      throw error;
    }
    return true;
  }
};

// تصدير خدمات الإعدادات من الملف الجديد
export { siteSettingsService, appearanceService } from './settingsService';
