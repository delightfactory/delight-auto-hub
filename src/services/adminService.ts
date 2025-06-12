import { supabase } from "@/integrations/supabase/client";
import { Product, Comment, Banner, Category, CategoryNode } from "@/types/db";

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

    // حساب متوسط قيمة الطلبات من جميع total_amounts
    const { data: ordersList, error: ordersListError } = await supabase
      .from('orders')
      .select('total_amount');
    if (ordersListError) {
      console.error("خطأ في جلب قيم الطلبات لحساب المتوسط:", ordersListError);
    }
    const sumAmount = ordersList?.reduce((acc, o) => acc + (o.total_amount ?? 0), 0) ?? 0;
    const averageOrder = ordersList && ordersList.length > 0 ? sumAmount / ordersList.length : 0;

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

    // عدد الطلبات الجديدة (قيد المعالجة أو قيد الانتظار)
    const { count: newOrdersCount, error: newOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['processing', 'pending']);
    if (newOrdersError) {
      console.error("خطأ في جلب عدد الطلبات الجديدة:", newOrdersError);
    }

    return {
      productsCount: productsCount || 0,
      ordersCount: ordersCount || 0,
      customersCount: customersCount || 0,
      averageOrder,
      recentOrders: recentOrders || [],
      newOrdersCount: newOrdersCount || 0
    };
  } catch (error) {
    console.error("خطأ غير متوقع في جلب الإحصائيات:", error);
    return {
      productsCount: 0,
      ordersCount: 0,
      customersCount: 0,
      averageOrder: 0,
      recentOrders: [],
      newOrdersCount: 0
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
  // جلب الطلبات (جميعها أو الخاصة بعميل محدد)
  getOrders: async (customerId?: string) => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, email)
      `)
      .order('created_at', { ascending: false });
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    const { data, error } = await query;

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
        order_items(*),
        branch:branches!orders_pickup_branch_id_fkey(id, name, address),
        pickup_point:pickup_points(id, name, address, type)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      console.error(`خطأ في جلب الطلب رقم ${id}:`, error);
      throw error;
    }

    console.log('تم جلب الطلب:', order.id);
    console.log('عناصر الطلب:', order.order_items?.length || 0);

    // جلب تفاصيل المنتجات وربطها بكل عنصر
    const productIds = order.order_items?.map(item => item.product_id).filter(pid => pid && typeof pid === 'string') ?? [];
    console.log('معرفات المنتجات المطلوبة:', productIds);
    
    if (productIds.length) {
      try {
        // استخدام استعلام واحد لجلب جميع المنتجات دفعة واحدة
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, images, product_code')
          .in('id', productIds);
        
        if (productsError) {
          console.error(`خطأ في جلب المنتجات:`, productsError);
        } else if (productsData && productsData.length) {
          console.log(`تم جلب ${productsData.length} منتج من أصل ${productIds.length} مطلوب`);
          
          // تحويل بيانات المنتجات إلى التنسيق المطلوب
          const products = productsData.map(data => ({
            id: data.id,
            name: data.name,
            product_code: data.product_code,
            image_url: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg'
          }));
          
          // إنشاء خريطة للمنتجات بمعرفاتها
          const prodMap = products.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
          
          // ربط المنتجات بعناصر الطلب
          order.order_items = order.order_items.map(item => {
            const product = item.product_id && prodMap[item.product_id] ? prodMap[item.product_id] : null;
            console.log(`عنصر الطلب ${item.id}: المنتج=${item.product_id}, كود المنتج=${product?.product_code || 'غير متوفر'}`);
            return {
              ...item,
              product
            };
          });
        }
      } catch (err) {
        console.error("خطأ في معالجة بيانات المنتجات:", err);
        // استمر في إرجاع الطلب حتى لو فشل جلب المنتجات
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
  getCategories: async (): Promise<Category[]> => {
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
  getCategoryById: async (id: string): Promise<Category> => {
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
  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
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
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
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
  deleteCategory: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(`خطأ في حذف الفئة رقم ${id}:`, error);
      throw error;
    }
    return true;
  },
  
  // جلب شجرة الفئات (hierarchical)
  getCategoryTree: async (): Promise<CategoryNode[]> => {
    // يستدعي الـ service العادي ثم يبني الشجرة client-side
    const list = await categoryService.getCategories();
    const map: Record<string, CategoryNode> = {};
    // تهيئة العقد
    list.forEach(cat => map[cat.id] = { ...cat, children: [] });
    const tree: CategoryNode[] = [];
    list.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) map[cat.parent_id].children.push(map[cat.id]);
      else tree.push(map[cat.id]);
    });
    return tree;
  },
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

// خدمات إدارة البنرات
export const bannerService = {
  getAllBanners: async (): Promise<Banner[]> => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  getBannerById: async (id: string): Promise<Banner> => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Banner;
  },
  createBanner: async (banner: Partial<Banner>): Promise<Banner> => {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select();
    if (error) throw error;
    return data![0] as Banner;
  },
  updateBanner: async (id: string, banner: Partial<Banner>): Promise<Banner> => {
    const { data, error } = await supabase
      .from('banners')
      .update(banner)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data![0] as Banner;
  },
  deleteBanner: async (id: string): Promise<void> => {
    try {
      console.log(`محاولة حذف البانر بمعرف: ${id}`);
      
      // التحقق من صلاحيات المستخدم أولاً
      const isAdmin = await checkIfAdmin();
      if (!isAdmin) {
        console.error('ليس لديك صلاحيات كافية لحذف البانرات');
        throw new Error('ليس لديك صلاحيات كافية لحذف البانرات');
      }
      
      // محاولة حذف البانر باستخدام RPC بدلاً من الحذف المباشر
      const { data, error } = await supabase
        .rpc('delete_banner', { banner_id: id });
      
      if (error) {
        console.error(`خطأ في حذف البانر باستخدام RPC:`, error);
        
        // محاولة بديلة باستخدام الحذف المباشر
        console.log('جاري المحاولة باستخدام الحذف المباشر...');
        const { error: directError } = await supabase
          .from('banners')
          .delete()
          .eq('id', id);
        
        if (directError) {
          console.error(`خطأ في الحذف المباشر:`, directError);
          
          // محاولة ثالثة باستخدام التحديث بدلاً من الحذف
          console.log('جاري المحاولة باستخدام التحديث لإلغاء تنشيط البانر...');
          const { error: updateError } = await supabase
            .from('banners')
            .update({ is_active: false })
            .eq('id', id);
          
          if (updateError) {
            console.error(`خطأ في تحديث حالة البانر:`, updateError);
            throw updateError;
          }
          
          console.log(`تم إلغاء تنشيط البانر بنجاح بدلاً من حذفه`);
          return;
        }
        
        console.log(`تم حذف البانر بنجاح باستخدام الحذف المباشر`);
        return;
      }
      
      console.log(`تم حذف البانر بنجاح باستخدام RPC`);
    } catch (error) {
      console.error('خطأ غير متوقع في حذف البانر:', error);
      throw error;
    }
  },
};

// تصدير خدمات الإعدادات من الملف الجديد
export { siteSettingsService, appearanceService } from './settingsService';
