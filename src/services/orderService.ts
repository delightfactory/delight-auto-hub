
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface OrderData {
  paymentMethod: string;
  notes?: string;
}

export const placeOrder = async (customerData: CustomerData, orderData: OrderData) => {
  try {
    // 1. إضافة أو تحديث بيانات العميل
    const { data: customerRecord, error: customerError } = await supabase
      .from('customers')
      .upsert(
        { 
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city
        },
        { onConflict: 'email', returning: 'minimal' }
      )
      .select()
      .single();

    if (customerError) {
      console.error("خطأ في حفظ بيانات العميل:", customerError);
      throw new Error("فشل في حفظ بيانات العميل");
    }
    
    // استرجاع سلة المشتريات من المتصفح
    const cartItems = JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":"0 ريال","itemCount":0}');
    
    // حساب السعر الإجمالي عددياً
    const numericTotal = parseInt(cartItems.total.replace(/\D/g, '')) || 0;
    
    // 2. إنشاء الطلب
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerRecord.id,
        total_amount: numericTotal,
        status: 'pending',
        payment_method: orderData.paymentMethod,
        shipping_address: customerData.address,
        shipping_city: customerData.city,
        notes: orderData.notes || null
      })
      .select()
      .single();

    if (orderError) {
      console.error("خطأ في إنشاء الطلب:", orderError);
      throw new Error("فشل في إنشاء الطلب");
    }

    // 3. إضافة عناصر الطلب
    const orderItems = cartItems.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: parseInt(item.price.replace(/\D/g, '')),
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("خطأ في إضافة عناصر الطلب:", itemsError);
      throw new Error("فشل في إضافة عناصر الطلب");
    }

    return {
      success: true,
      orderId: order.id,
      order
    };
  } catch (error) {
    console.error("خطأ في إتمام الطلب:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ غير متوقع"
    };
  }
};

export const getOrderById = async (orderId: string) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error("خطأ في استرجاع بيانات الطلب:", error);
    throw error;
  }

  return order;
};

export const getCustomerOrders = async (email: string) => {
  // أولاً، ابحث عن العميل حسب البريد الإلكتروني
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .single();

  if (customerError || !customer) {
    return { orders: [] };
  }

  // ثم استرجع طلبات هذا العميل
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error("خطأ في استرجاع طلبات العميل:", ordersError);
    throw ordersError;
  }

  return { orders: orders || [] };
};
