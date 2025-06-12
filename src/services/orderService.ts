import { supabase } from "@/integrations/supabase/client";
import { notificationService } from './notificationService';

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
  delivery_method?: 'shipping' | 'branch_pickup' | 'pickup_point';
  pickup_branch_id?: string;
  pickup_point_id?: string;
}

export const placeOrder = async (customerData: CustomerData, orderData: OrderData) => {
  try {
    console.log('Starting order placement process...');
    
    // Get current authenticated user
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !user) {
      console.error('User authentication error:', getUserError);
      throw new Error("يجب تسجيل الدخول لإنشاء الطلب");
    }

    console.log('User authenticated:', user.id);

    // Validate input data
    if (!customerData.name || !customerData.email || !customerData.phone || 
        (orderData.delivery_method === 'shipping' && !customerData.address) || 
        !customerData.city) {
      throw new Error("جميع بيانات العميل مطلوبة");
    }

    if (!orderData.paymentMethod) {
      throw new Error("طريقة الدفع مطلوبة");
    }

    // 1. جلب الدور الحالي لبناء upsert آمن
    const { data: existing, error: existingError } = await supabase
      .from('customers')
      .select('role')
      .eq('id', user.id)
      .single();
    if (existingError) {
      console.error('خطأ في جلب دور العميل الحالي:', existingError);
    }

    const customerBody: any = {
      id: user.id,
      user_id: user.id,
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city
    };
    // إضافة role للعميل الجديد فقط
    if (!existing) {
      customerBody.role = 'customer';
    }

    const { data: customerRecord, error: customerError } = await supabase
      .from('customers')
      .upsert(customerBody, { onConflict: 'id' })
      .select()
      .single();

    if (customerError) {
      console.error("خطأ في حفظ بيانات العميل:", customerError);
      throw new Error("فشل في حفظ بيانات العميل");
    }
    
    console.log('Customer record saved:', customerRecord.id);
    
    // استرجاع سلة المشتريات من المتصفح
    const cartData = localStorage.getItem('cart');
    if (!cartData) {
      throw new Error("سلة التسوق فارغة");
    }
    
    const cartItems = JSON.parse(cartData);
    
    if (!cartItems.items || cartItems.items.length === 0) {
      throw new Error("لا توجد منتجات في سلة التسوق");
    }
    
    // حساب السعر الإجمالي عددياً
    const numericTotal = parseInt(cartItems.total?.replace(/\D/g, '')) || 0;
    
    // جلب تكلفة الشحن للمدينة المختارة
    let shippingCost = 0;
    
    // إذا كانت طريقة التسليم هي الشحن، نقوم بجلب تكلفة الشحن للمدينة
    if (orderData.delivery_method === 'shipping' || !orderData.delivery_method) {
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('delivery_fee')
        .eq('id', customerData.city)
        .single();
      
      if (cityError) {
        console.error("خطأ في جلب تكلفة الشحن للمدينة:", cityError);
        // استخدام القيمة الافتراضية في حالة الخطأ
        shippingCost = 0;
      } else if (cityData) {
        // التحقق من حد الشحن المجاني
        const FREE_SHIPPING_THRESHOLD = 1000;
        shippingCost = numericTotal >= FREE_SHIPPING_THRESHOLD ? 0 : cityData.delivery_fee;
      }
    }
    
    const finalTotal = numericTotal + shippingCost;
    
    console.log('Order total calculated:', finalTotal, 'with shipping cost:', shippingCost);
    
    // 2. إنشاء الطلب
    const orderPayload = {
      customer_id: customerRecord.id,
      total_amount: finalTotal,
      status: 'pending',
      pickup_branch_id: orderData.pickup_branch_id || null,
      pickup_point_id: orderData.pickup_point_id || null,
      payment_method: orderData.paymentMethod,
      shipping_address: customerData.address,
      shipping_city: customerData.city,
      notes: orderData.notes || '',
      shipping_cost: shippingCost
    };
    
    // إذا كانت طريقة التسليم هي الاستلام الذاتي، نقوم بتعديل حالة الطلب
    if (orderData.delivery_method === 'branch_pickup' || orderData.delivery_method === 'pickup_point') {
      orderPayload.status = 'processing'; // تغيير الحالة إلى قيد المعالجة مباشرة
    }
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error("خطأ في إنشاء الطلب:", orderError);
      throw new Error("فشل في إنشاء الطلب");
    }

    console.log('Order created:', order.id);

    // 3. إنشاء قائمة عناصر الطلب
    const orderItems = cartItems.items.map((item: any) => {
      const itemPrice = parseInt(item.price?.replace(/\D/g, '')) || 0;
      return {
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: itemPrice,
        quantity: item.quantity || 1
      };
    });

    // إضافة عناصر الطلب
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("خطأ في إضافة عناصر الطلب:", itemsError);
      // حذف الطلب إذا فشلت إضافة العناصر
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`فشل في إضافة عناصر الطلب: ${itemsError.message}`);
    }

    console.log('Order items added successfully');

    // Clear cart on successful order
    try {
      localStorage.removeItem('cart');
      console.log('Cart cleared successfully');
    } catch (error) {
      console.warn('Error clearing cart from localStorage:', error);
    }
      
    // إرسال إشعارات للمستخدم والإدمن عند إنشاء الطلب
    try {
      const shortId = order.id.slice(0, 8);
      // إشعار للمستخدم
      await notificationService.sendNotification(
        user.id,
        'order_created',
        'تم استلام طلبك',
        `شكراً لك! تم استلام طلبك رقم ${shortId} بنجاح. يمكنك متابعة حالة طلبك من صفحة طلباتي.`,
        { orderId: order.id, status: order.status },
        1
      );
      // إشعار للإدمن
      await notificationService.sendBroadcastNotification(
        'order_created',
        'طلب جديد',
        `تم إنشاء طلب جديد رقم ${shortId} من قبل ${customerData.name}.`,
        'admin',
        { orderId: order.id, customerId: user.id },
        1
      );
    } catch (notifError) {
      console.error('خطأ في إرسال إشعارات الطلب:', notifError);
    }

    return {
      success: true,
      orderId: order.id,
      order: order
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
  try {
    if (!orderId) {
      throw new Error("معرف الطلب مطلوب");
    }

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
  } catch (error) {
    console.error("Error in getOrderById:", error);
    throw error;
  }
};

export const getCustomerOrders = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("معرف المستخدم مطلوب");
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        customer:customers(*)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("خطأ في استرجاع طلبات العميل:", error);
      throw error;
    }

    return { orders: orders || [] };
  } catch (error) {
    console.error("Error in getCustomerOrders:", error);
    throw error;
  }
};

// Function to cancel an order by its ID
export const cancelOrder = async (orderId: string) => {
  try {
    if (!orderId) {
      throw new Error("معرف الطلب مطلوب");
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
      
    if (error) {
      console.error("خطأ في إلغاء الطلب:", error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    throw error;
  }
};
