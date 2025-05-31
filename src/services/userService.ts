import { supabase } from "@/integrations/supabase/client";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  governorate: string;
  city: string;
}

/**
 * استرجاع بيانات المستخدم المسجل حالياً
 */
export const getCurrentUserData = async (): Promise<UserData | null> => {
  try {
    // الحصول على المستخدم الحالي المصادق عليه
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log("المستخدم غير مسجل الدخول:", authError);
      return null;
    }
    
    // استرجاع بيانات المستخدم من جدول العملاء
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (customerError) {
      console.error("خطأ في استرجاع بيانات العميل:", customerError);
      return null;
    }
    
    if (!customerData) {
      console.log("لا توجد بيانات مسجلة للعميل");
      return null;
    }
    
    // تحويل البيانات إلى الصيغة المطلوبة
    return {
      id: customerData.id,
      name: customerData.name || "",
      email: customerData.email || "",
      phone: customerData.phone || "",
      address: customerData.address || "",
      governorate: customerData.governorate || "",
      city: customerData.city || ""
    };
  } catch (error) {
    console.error("خطأ في استرجاع بيانات المستخدم:", error);
    return null;
  }
};

/**
 * تحديث بيانات المستخدم الحالي
 */
export const updateUserData = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
  try {
    // الحصول على المستخدم الحالي المصادق عليه
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "المستخدم غير مسجل الدخول" };
    }
    
    // تحديث بيانات المستخدم في جدول العملاء
    const { error: updateError } = await supabase
      .from('customers')
      .upsert({
        id: user.id,
        user_id: user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        governorate: userData.governorate,
        city: userData.city,
        updated_at: new Date()
      }, { onConflict: 'id' });
    
    if (updateError) {
      console.error("خطأ في تحديث بيانات العميل:", updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("خطأ في تحديث بيانات المستخدم:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" 
    };
  }
};

/**
 * التحقق مما إذا كان المستخدم مسجل الدخول
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return !error && !!user;
  } catch (error) {
    console.error("خطأ في التحقق من حالة تسجيل الدخول:", error);
    return false;
  }
};
