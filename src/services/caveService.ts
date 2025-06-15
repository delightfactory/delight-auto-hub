import { supabase } from "@/integrations/supabase/client";
import { CaveEvent, CaveTicket, CaveSession, CaveOrder } from "@/types/db";

// خدمة إدارة نظام المغارة
export const caveService = {
  // ======== إدارة الأحداث ========
  getEvents: async (): Promise<CaveEvent[]> => {
    const { data, error } = await supabase
      .from("cave_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ في جلب أحداث المغارة:", error);
      throw error;
    }

    return data || [];
  },

  getActiveEvents: async (): Promise<CaveEvent[]> => {
    const { data, error } = await supabase
      .from("cave_events")
      .select("*")
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("خطأ في جلب أحداث المغارة النشطة:", error);
      throw error;
    }

    return data || [];
  },

  getEventById: async (eventId: string): Promise<CaveEvent> => {
    const { data, error } = await supabase
      .from("cave_events")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (error) {
      console.error(`خطأ في جلب حدث المغارة رقم ${eventId}:`, error);
      throw error;
    }

    return data;
  },

  createEvent: async (eventData: Partial<CaveEvent>): Promise<CaveEvent> => {
    const { data, error } = await supabase
      .from("cave_events")
      .insert([eventData])
      .select();

    if (error) {
      console.error("خطأ في إنشاء حدث المغارة:", error);
      throw error;
    }

    return data?.[0];
  },

  updateEvent: async (eventId: string, eventData: Partial<CaveEvent>): Promise<CaveEvent> => {
    const { data, error } = await supabase
      .from("cave_events")
      .update(eventData)
      .eq("event_id", eventId)
      .select();

    if (error) {
      console.error(`خطأ في تحديث حدث المغارة رقم ${eventId}:`, error);
      throw error;
    }

    return data?.[0];
  },

  deleteEvent: async (eventId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("cave_events")
      .delete()
      .eq("event_id", eventId);

    if (error) {
      console.error(`خطأ في حذف حدث المغارة رقم ${eventId}:`, error);
      throw error;
    }

    return true;
  },

  // ======== إدارة التذاكر ========
  getTickets: async (eventId?: string): Promise<CaveTicket[]> => {
    let query = supabase.from("cave_tickets").select("*");
    
    if (eventId) {
      query = query.eq("event_id", eventId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ في جلب تذاكر المغارة:", error);
      throw error;
    }

    return data || [];
  },

  getTicketById: async (ticketId: string): Promise<CaveTicket> => {
    const { data, error } = await supabase
      .from("cave_tickets")
      .select("*")
      .eq("ticket_id", ticketId)
      .single();

    if (error) {
      console.error(`خطأ في جلب تذكرة المغارة رقم ${ticketId}:`, error);
      throw error;
    }

    return data;
  },

  validateTicket: async (code: string, userId: string): Promise<{ valid: boolean; event?: CaveEvent; message?: string; }> => {
    // أولاً، نتحقق من وجود تذكرة نشطة بالكود المحدد
    const { data: tickets, error } = await supabase
      .from("cave_tickets")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error(`خطأ في التحقق من تذكرة المغارة:`, error);
      throw error;
    }

    if (!tickets) {
      return { valid: false, message: "التذكرة غير موجودة" };
    }

    const ticket = tickets;

    if (error) {
      if (error.code === "PGRST116") { // لم يتم العثور على نتائج
        return { valid: false, message: "التذكرة غير موجودة" };
      }
      console.error(`خطأ في التحقق من تذكرة المغارة:`, error);
      throw error;
    }

    // التحقق من صلاحية التذكرة
    if (ticket.is_personal && ticket.owner_user !== userId) {
      return { valid: false, message: "هذه التذكرة شخصية ولا يمكنك استخدامها" };
    }

    // التحقق من تاريخ انتهاء الصلاحية
    if (ticket.expiry && new Date(ticket.expiry) < new Date()) {
      return { valid: false, message: "انتهت صلاحية التذكرة" };
    }

    // الحصول على معلومات الحدث المرتبط بالتذكرة
    const { data: event, error: eventError } = await supabase
      .from("cave_events")
      .select("*")
      .eq("event_id", ticket.event_id)
      .single();

    if (eventError) {
      console.error(`خطأ في جلب معلومات الحدث:`, eventError);
      return { valid: false, message: "حدث خطأ في جلب معلومات الحدث" };
    }

    return { valid: true, event };
  },

  createTicket: async (ticketData: Partial<CaveTicket>): Promise<CaveTicket> => {
    // تأكد من أن owner_user هو إما UUID صالح أو null
    const processedData = {
      ...ticketData,
      owner_user: ticketData.is_personal ? ticketData.owner_user : null
    };

    // التحقق من نوع الحدث وحالة نشاطه قبل الإنشاء
    const { data: eventData, error: eventError } = await supabase
      .from('cave_events')
      .select('kind, is_active')
      .eq('event_id', ticketData.event_id)
      .single();

    if (eventError || !eventData || eventData.kind !== 'ticketed' || !eventData.is_active) {
      throw new Error('الحدث المحدد يجب أن يكون من نوع ticketed ونشط');
    }

    const { data, error } = await supabase
      .from("cave_tickets")
      .insert([processedData])
      .select();

    if (error) {
      console.error("خطأ في إنشاء تذكرة المغارة:", error);
      throw error;
    }

    return data?.[0];
  },

  updateTicket: async (ticketId: string, ticketData: Partial<CaveTicket>): Promise<CaveTicket> => {
    const { data, error } = await supabase
      .from("cave_tickets")
      .update(ticketData)
      .eq("ticket_id", ticketId)
      .select();

    if (error) {
      console.error(`خطأ في تحديث تذكرة المغارة رقم ${ticketId}:`, error);
      throw error;
    }

    return data?.[0];
  },

  deleteTicket: async (ticketId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("cave_tickets")
      .delete()
      .eq("ticket_id", ticketId);

    if (error) {
      console.error(`خطأ في حذف تذكرة المغارة رقم ${ticketId}:`, error);
      throw error;
    }

    return true;
  },

  // ======== إدارة الجلسات ========
  getSessions: async (eventId?: string, userId?: string): Promise<CaveSession[]> => {
    let query = supabase.from("cave_sessions").select("*");
    
    if (eventId) {
      query = query.eq("event_id", eventId);
    }
    
    if (userId) {
      query = query.eq("user_id", userId);
    }
    
    const { data, error } = await query.order("entered_at", { ascending: false });

    if (error) {
      console.error("خطأ في جلب جلسات المغارة:", error);
      throw error;
    }

    return data || [];
  },

  getActiveUserSession: async (userId: string): Promise<CaveSession | null> => {
    const { data, error } = await supabase
      .from("cave_sessions")
      .select("*")
      .eq("user_id", userId)
      .is("left_at", null)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") { // لم يتم العثور على نتائج
        return null;
      }
      console.error(`خطأ في جلب جلسة المغارة النشطة للمستخدم ${userId}:`, error);
      throw error;
    }

    return data;
  },

  createSession: async (sessionData: Partial<CaveSession>): Promise<CaveSession> => {
    const { data, error } = await supabase
      .from("cave_sessions")
      .insert([sessionData])
      .select();

    if (error) {
      console.error("خطأ في إنشاء جلسة المغارة:", error);
      throw error;
    }

    return data?.[0];
  },

  endSession: async (sessionId: string, totalSpent: number): Promise<CaveSession> => {
    const { data, error } = await supabase
      .from("cave_sessions")
      .update({
        left_at: new Date().toISOString(),
        total_spent: totalSpent
      })
      .eq("session_id", sessionId)
      .select();

    if (error) {
      console.error(`خطأ في إنهاء جلسة المغارة رقم ${sessionId}:`, error);
      throw error;
    }

    return data?.[0];
  },

  getSessionById: async (sessionId: string): Promise<CaveSession | null> => {
    const { data, error } = await supabase
      .from("cave_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") { // لم يتم العثور على نتائج
        return null;
      }
      console.error(`خطأ في جلب جلسة المغارة رقم ${sessionId}:`, error);
      throw error;
    }

    // التحقق من صلاحية الجلسة (إذا كانت لم تنتهي بعد)
    if (data && !data.left_at) {
      const expiryTime = new Date(data.expires_at).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime > expiryTime) {
        // الجلسة منتهية الصلاحية، لكن لم يتم تحديثها في قاعدة البيانات
        console.log(`جلسة المغارة رقم ${sessionId} منتهية الصلاحية`);
        return null;
      }
    } else if (data && data.left_at) {
      // الجلسة انتهت بالفعل
      return null;
    }

    return data;
  },

  // ======== إدارة الطلبات ========
  getOrders: async (eventId?: string, sessionId?: string, userId?: string): Promise<CaveOrder[]> => {
    let query = supabase.from("cave_orders").select("*");
    
    if (eventId) {
      query = query.eq("event_id", eventId);
    }
    
    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }
    
    if (userId) {
      query = query.eq("user_id", userId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ في جلب طلبات المغارة:", error);
      throw error;
    }

    return data || [];
  },

  createOrder: async (orderData: Partial<CaveOrder>): Promise<CaveOrder> => {
    const { data, error } = await supabase
      .from("cave_orders")
      .insert([orderData])
      .select();

    if (error) {
      console.error("خطأ في إنشاء طلب المغارة:", error);
      throw error;
    }

    return data?.[0];
  },

  // ======== إحصائيات المغارة ========
  getCaveStats: async (): Promise<any> => {
    try {
      const { data: events, error: eventsError } = await supabase
        .from("cave_events")
        .select("*");

      const { data: sessions, error: sessionsError } = await supabase
        .from("cave_sessions")
        .select("*");

      const { data: orders, error: ordersError } = await supabase
        .from("cave_orders")
        .select("*");

      if (eventsError || sessionsError || ordersError) {
        throw new Error("خطأ في جلب إحصائيات المغارة");
      }

      const activeEvents = events?.filter(event => event.is_active) || [];
      const totalRevenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0;
      const totalSessions = sessions?.length || 0;
      const activeSessions = sessions?.filter(session => !session.left_at).length || 0;

      return {
        totalEvents: events?.length || 0,
        activeEvents: activeEvents.length,
        totalSessions,
        activeSessions,
        totalOrders: orders?.length || 0,
        totalRevenue
      };
    } catch (error) {
      console.error("خطأ في جلب إحصائيات المغارة:", error);
      throw error;
    }
  },

  // ======== منتجات المغارة ========
  // جلب منتجات المغارة (المنتجات التي تحتوي على خاصية cave_enabled = true)
  getCaveProducts: async (category?: string): Promise<any[]> => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("cave_enabled", true);
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("خطأ في جلب منتجات المغارة:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("خطأ في جلب منتجات المغارة:", error);
      throw error;
    }
  },

  // جلب فئات منتجات المغارة
  getCaveCategories: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("cave_enabled", true);

      if (error) {
        console.error("خطأ في جلب فئات منتجات المغارة:", error);
        throw error;
      }

      // استخراج الفئات الفريدة
      const categories = [...new Set(data?.map(product => product.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error("خطأ في جلب فئات منتجات المغارة:", error);
      throw error;
    }
  },

  // جلب منتج المغارة بواسطة المعرف
  getCaveProductById: async (productId: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("cave_enabled", true)
        .single();

      if (error) {
        console.error(`خطأ في جلب منتج المغارة رقم ${productId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`خطأ في جلب منتج المغارة رقم ${productId}:`, error);
      throw error;
    }
  }
};