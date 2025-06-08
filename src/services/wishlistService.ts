import { supabase } from "@/integrations/supabase/client";
import type { Favorite } from "@/types/db";

// خدمة إدارة المفضلات
export const WishlistService = {
  getFavorites: async (): Promise<string[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((f) => f.product_id);
    } catch (err) {
      // No auth session or other error, return empty favorites
      console.debug('WishlistService.getFavorites:', err);
      return [];
    }
  },

  addFavorite: async (productId: string): Promise<void> => {
    const { data: userData, error: getUserError } = await supabase.auth.getUser();
    if (getUserError) throw getUserError;
    const user = userData.user;
    if (!user) throw new Error("يجب تسجيل الدخول لإضافة للمفضلة");
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, product_id: productId });
    if (error) throw error;
  },

  removeFavorite: async (productId: string): Promise<void> => {
    const { data: userData, error: getUserError } = await supabase.auth.getUser();
    if (getUserError) throw getUserError;
    const user = userData.user;
    if (!user) throw new Error("يجب تسجيل الدخول لإزالة من المفضلة");
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) throw error;
  },
};
