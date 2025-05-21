
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/db";

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
  getProducts: async () => {
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
  getProductById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`خطأ في جلب المنتج رقم ${id}:`, error);
      throw error;
    }
    return data;
  },
  
  // إنشاء منتج جديد
  createProduct: async (productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    
    if (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      throw error;
    }
    return data?.[0];
  },
  
  // تحديث منتج موجود
  updateProduct: async (id: string, productData: Partial<Product>) => {
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
    return data?.[0];
  },
  
  // حذف منتج
  deleteProduct: async (id: string) => {
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
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`خطأ في جلب الطلب رقم ${id}:`, error);
      throw error;
    }
    return data;
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

// خدمات إدارة إعدادات الموقع
export const siteSettingsService = {
  // جلب إعدادات الموقع
  getSiteSettings: async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error("خطأ في جلب إعدادات الموقع:", error);
      // إرجاع إعدادات افتراضية في حالة عدم وجود إعدادات محفوظة
      return {
        siteName: "ديلايت للعناية بالسيارات",
        siteDescription: "منتجات العناية بالسيارات عالية الجودة",
        contactEmail: "info@delight.com",
        phoneNumber: "+123456789",
        address: "المملكة العربية السعودية، الرياض",
        enableRegistration: true,
        enableComments: true,
        theme: {
          primaryColor: "#FF0000",
          secondaryColor: "#0000FF",
          textColor: "#333333",
          backgroundColor: "#FFFFFF"
        }
      };
    }
    return data;
  },
  
  // تحديث إعدادات الموقع
  updateSiteSettings: async (settingsData: any) => {
    // التحقق من وجود إعدادات سابقة
    const { data: existingSettings, error: fetchError } = await supabase
      .from('site_settings')
      .select('id')
      .maybeSingle();
    
    let data;
    let error;
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("خطأ في التحقق من وجود إعدادات:", fetchError);
      throw fetchError;
    }
    
    if (existingSettings) {
      // تحديث الإعدادات الموجودة
      const result = await supabase
        .from('site_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .select();
      
      data = result.data;
      error = result.error;
    } else {
      // إنشاء إعدادات جديدة
      const result = await supabase
        .from('site_settings')
        .insert([settingsData])
        .select();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error("خطأ في حفظ إعدادات الموقع:", error);
      throw error;
    }
    
    return data?.[0];
  }
};

// خدمات إدارة المظهر
export const appearanceService = {
  // جلب إعدادات المظهر
  getAppearanceSettings: async () => {
    const { data, error } = await supabase
      .from('appearance_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error("خطأ في جلب إعدادات المظهر:", error);
      // إرجاع إعدادات افتراضية في حالة عدم وجود إعدادات محفوظة
      return {
        theme: {
          primaryColor: "#FF0000",
          secondaryColor: "#0000FF",
          textColor: "#333333",
          backgroundColor: "#FFFFFF"
        },
        layout: "fluid",
        contentWidth: "large",
        darkMode: true,
        responsive: {
          mobile: { enabled: true, collapsibleMenu: true },
          tablet: { enabled: true, sidebarMenu: true },
          desktop: { enabled: true, topMenu: true }
        },
        fonts: {
          heading: "Cairo",
          body: "Tajawal"
        }
      };
    }
    return data;
  },
  
  // تحديث إعدادات المظهر
  updateAppearanceSettings: async (settingsData: any) => {
    // التحقق من وجود إعدادات سابقة
    const { data: existingSettings, error: fetchError } = await supabase
      .from('appearance_settings')
      .select('id')
      .maybeSingle();
    
    let data;
    let error;
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("خطأ في التحقق من وجود إعدادات المظهر:", fetchError);
      throw fetchError;
    }
    
    if (existingSettings) {
      // تحديث الإعدادات الموجودة
      const result = await supabase
        .from('appearance_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .select();
      
      data = result.data;
      error = result.error;
    } else {
      // إنشاء إعدادات جديدة
      const result = await supabase
        .from('appearance_settings')
        .insert([settingsData])
        .select();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error("خطأ في حفظ إعدادات المظهر:", error);
      throw error;
    }
    
    return data?.[0];
  }
};
