import { supabase } from "@/integrations/supabase/client";
import type { Review } from "@/types/db";

// خدمة إدارة التقييمات والتعليقات
export const ReviewService = {
  getReviews: async (productId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Review[]) || [];
  },

  // تحقق إن كان المستخدم مؤهلاً لكتابة تقييم (شراء مُسلم)
  canReview: async (productId: string): Promise<boolean> => {
    const getUserRes = await supabase.auth.getUser();
    if (getUserRes.error) throw getUserRes.error;
    const user = getUserRes.data.user;
    if (!user) return false;
    const ordersRes = await supabase
      .from("orders")
      .select("id")
      .eq("customer_id", user.id)
      .eq("status", "delivered")
      .limit(1);
    if (ordersRes.error) throw ordersRes.error;
    return ((ordersRes.data as { id: string }[])?.length || 0) > 0;
  },

  createReview: async (productId: string, rating: number, comment?: string): Promise<void> => {
    const getUserRes = await supabase.auth.getUser();
    if (getUserRes.error) throw getUserRes.error;
    const user = getUserRes.data.user;
    if (!user) throw new Error("يجب تسجيل الدخول لكتابة تقييم");
    // التحقق من أهليّة التقييم
    const eligible = await ReviewService.canReview(productId);
    if (!eligible) throw new Error("لا يمكنك تقييم هذا المنتج بدون شراء مؤكد");

    const { error } = await supabase
      .from("reviews")
      .insert({ user_id: user.id, product_id: productId, rating, comment, approved: true });
    if (error) throw error;
  },
};
