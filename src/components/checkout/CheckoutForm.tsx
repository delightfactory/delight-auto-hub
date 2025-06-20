import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, CreditCard, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { getCurrentUserData, isUserLoggedIn, updateUserData } from '@/services/userService';
import { placeOrder } from '@/services/orderService';
import { Badge } from "@/components/ui/badge";
import ShippingForm from '@/components/shipping/ShippingForm';
import ShippingSummary from '@/components/shipping/ShippingSummary';
import FreeShippingIndicator from '@/components/shipping/FreeShippingIndicator';
import DeliveryMethodSelector, { DeliveryMethod } from '@/components/shipping/DeliveryMethodSelector';
import PickupSelector from '@/components/shipping/PickupSelector';
import PickupPointSelector from '@/components/shipping/PickupPointSelector';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  governorate: string;
  city: string;
  deliveryMethod: DeliveryMethod;
  selectedBranch: string;
  selectedPickupPoint: string;
  paymentMethod: 'cod' | 'card';
  notes: string;
}

// حد الشحن المجاني
const FREE_SHIPPING_THRESHOLD = 1000;

// تنسيق العملة مع ضمان ظهور الأرقام باللغة الإنجليزية
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);

/**
 * مكون نموذج إتمام الطلب - يعرض خطوات إتمام الطلب (الشحن، الدفع، التأكيد)
 */
const CheckoutForm: React.FC = () => {
  const { items, getTotalValue, clearCart } = useCart();
  // استخدام دالة getTotalValue للحصول على القيمة الرقمية للإجمالي
  const total = getTotalValue();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', address: '', governorate: '', city: '', 
    deliveryMethod: 'shipping', selectedBranch: '', selectedPickupPoint: '',
    paymentMethod: 'cod', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [governorateName, setGovernorateName] = useState('');
  const [cityName, setCityName] = useState('');
  const [hasBranches, setHasBranches] = useState(false);
  const [hasPickupPoints, setHasPickupPoints] = useState(false);

  // التحقق من حالة تسجيل دخول المستخدم واسترجاع بياناته عند تحميل الصفحة
  useEffect(() => {
    const checkUserStatus = async () => {
      setLoading(true);
      try {
        // التحقق مما إذا كان المستخدم مسجل الدخول
        const loggedIn = await isUserLoggedIn();
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
          // جلب بيانات المستخدم من قاعدة البيانات
          const userData = await getCurrentUserData();
          
          if (userData) {
            console.log('تم جلب بيانات المستخدم:', userData);
            console.log('عنوان المستخدم:', userData.address);
            // تعيين بيانات المستخدم المسجل
            setFormData(prev => ({
              ...prev,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              governorate: userData.governorate || '',
              city: userData.city || ''
            }));
            
            // إذا كان لدى المستخدم محافظة محفوظة، نجلب اسمها دون إعادة تعيين المدينة
            if (userData.governorate) {
              try {
                const { data: govData, error: govError } = await supabase
                  .from('governorates')
                  .select('name_ar')
                  .eq('id', userData.governorate)
                  .single();
                if (!govError && govData) {
                  setGovernorateName(govData.name_ar);
                }
              } catch (err) {
                console.error('خطأ في جلب اسم المحافظة:', err);
              }
            }
            
            // إذا كان لدى المستخدم مدينة محفوظة، نقوم بجلب اسمها وتكلفة الشحن
            if (userData.city) {
              // استعلام عن تكلفة الشحن للمدينة المحفوظة
              const { data: cityData, error } = await supabase
                .from('cities')
                .select('name_ar, delivery_fee')
                .eq('id', userData.city)
                .single();
                
              if (!error && cityData) {
                setCityName(cityData.name_ar);
                // تطبيق تكلفة الشحن المناسبة
                const fee = total >= FREE_SHIPPING_THRESHOLD ? 0 : cityData.delivery_fee;
                setShippingCost(fee);
                console.log(`تم تحميل بيانات المدينة: ${cityData.name_ar} بتكلفة شحن: ${fee}`);
                
                // التحقق من وجود فروع ونقاط استلام في هذه المدينة
                checkAvailableDeliveryOptions(userData.city);
              }
            }
          }
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserStatus();
  }, []);

  // حساب الإجمالي مع الشحن (إذا كانت طريقة التسليم هي الشحن)
  const totalWithShipping = useMemo(() => {
    // إذا كانت طريقة التسليم هي الاستلام من فرع أو نقطة استلام، لا نضيف تكلفة الشحن
    if (formData.deliveryMethod === 'branch' || formData.deliveryMethod === 'pickup_point') {
      return total;
    }
    return total + shippingCost;
  }, [total, shippingCost, formData.deliveryMethod]);
  
  // تحديث تكلفة الشحن عندما يتغير إجمالي السلة أو عند تغيير المدينة
  useEffect(() => {
    // لا نقوم بأي شيء إذا لم يتم اختيار مدينة
    if (!formData.city) return;
    
    const updateShippingCost = async () => {
      try {
        // استعلام عن تكلفة الشحن للمدينة المختارة
        const { data: city, error } = await supabase
          .from('cities')
          .select('delivery_fee, name_ar')
          .eq('id', formData.city)
          .single();
          
        if (error) throw error;
        
        if (city) {
          // تطبيق الشحن المجاني إذا كان الإجمالي أكبر من الحد
          // أو إذا كانت طريقة التسليم هي الاستلام من فرع أو نقطة استلام
          const actualFee = (total >= FREE_SHIPPING_THRESHOLD || 
                            formData.deliveryMethod === 'branch' || 
                            formData.deliveryMethod === 'pickup_point') 
                            ? 0 : city.delivery_fee;
          setShippingCost(actualFee);
          
          console.log(`تم تحديث تكلفة الشحن تلقائياً: ${actualFee}`);
        }
      } catch (error) {
        console.error('خطأ في تحديث تكلفة الشحن:', error);
      }
    };
    
    updateShippingCost();
  }, [total, formData.city, formData.deliveryMethod, FREE_SHIPPING_THRESHOLD]);

  const handleChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  // التعامل مع تغيير المحافظة
  const handleGovernorateChange = useCallback(async (governorateId: string, fee: number = 0) => {
    try {
      // تحديث قيمة المحافظة في formData وإعادة تعيين المدينة
      setFormData(prev => ({
        ...prev,
        governorate: governorateId,
        city: '' // إعادة تعيين المدينة عند تغيير المحافظة
      }));
      
      if (governorateId) {
        // استعلام عن اسم المحافظة من قاعدة البيانات
        const { data: governorate, error } = await supabase
          .from('governorates')
          .select('name_ar')
          .eq('id', governorateId)
          .single();
          
        if (error) throw error;
        
        if (governorate) {
          setGovernorateName(governorate.name_ar);
        }
      } else {
        setGovernorateName('');
      }
    } catch (error) {
      console.error('خطأ في الحصول على اسم المحافظة:', error);
    }
  }, []);

  // التعامل مع تغيير المدينة
  const handleCityChange = useCallback(async (cityId: string, fee: number) => {
    try {
      // تحديث قيمة المدينة في formData
      setFormData(prev => ({
        ...prev,
        city: cityId,
        // إعادة تعيين الفرع ونقطة الاستلام عند تغيير المدينة
        selectedBranch: '',
        selectedPickupPoint: ''
      }));
      
      if (cityId) {
        // استعلام عن اسم المدينة وتكلفة الشحن من قاعدة البيانات
        const { data: city, error } = await supabase
          .from('cities')
          .select('name_ar, delivery_fee')
          .eq('id', cityId)
          .single();
          
        if (error) throw error;
        
        if (city) {
          setCityName(city.name_ar);
          
          // تحديد تكلفة الشحن بناءً على قيمة الطلب وحد الشحن المجاني وطريقة التسليم
          const actualFee = (total >= FREE_SHIPPING_THRESHOLD || 
                            formData.deliveryMethod === 'branch' || 
                            formData.deliveryMethod === 'pickup_point') 
                            ? 0 : (city.delivery_fee || fee);
          
          // تحديث تكلفة الشحن
          setShippingCost(actualFee);
          
          console.log(`تم تحديث تكلفة الشحن: ${actualFee} - المدينة: ${city.name_ar}`);
          
          // التحقق من وجود فروع ونقاط استلام في هذه المدينة
          checkAvailableDeliveryOptions(cityId);
        }
      } else {
        setCityName('');
        setShippingCost(0); // إعادة تعيين تكلفة الشحن إلى صفر عند إلغاء اختيار المدينة
        setHasBranches(false);
        setHasPickupPoints(false);
      }
    } catch (error) {
      console.error('خطأ في الحصول على اسم المدينة:', error);
    }
  }, [total, FREE_SHIPPING_THRESHOLD, formData.deliveryMethod]);
  
  // التحقق من وجود فروع ونقاط استلام في المدينة المختارة
  const checkAvailableDeliveryOptions = useCallback(async (cityId: string) => {
    if (!cityId) return;
    
    try {
      // التحقق من وجود فروع
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id')
        .eq('city_id', cityId)
        .eq('is_active', true);
        
      if (!branchesError) {
        setHasBranches(branchesData && branchesData.length > 0);
      }
      
      // التحقق من وجود نقاط استلام
      const { data: pickupPointsData, error: pickupPointsError } = await supabase
        .from('pickup_points')
        .select('id')
        .eq('city_id', cityId)
        .eq('is_active', true);
        
      if (!pickupPointsError) {
        setHasPickupPoints(pickupPointsData && pickupPointsData.length > 0);
      }
    } catch (error) {
      console.error('خطأ في التحقق من خيارات التسليم المتاحة:', error);
    }
  }, []);

  // التعامل مع تغيير طريقة التسليم
  const handleDeliveryMethodChange = useCallback((method: DeliveryMethod) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethod: method
    }));
    
    // إعادة حساب تكلفة الشحن عند تغيير طريقة التسليم
    if (method === 'branch' || method === 'pickup_point') {
      setShippingCost(0); // إلغاء تكلفة الشحن عند اختيار الاستلام الذاتي
    } else if (formData.city) {
      // إعادة حساب تكلفة الشحن للتوصيل المنزلي
      const updateShippingCost = async () => {
        try {
          const { data: city, error } = await supabase
            .from('cities')
            .select('delivery_fee')
            .eq('id', formData.city)
            .single();
            
          if (!error && city) {
            const actualFee = total >= FREE_SHIPPING_THRESHOLD ? 0 : city.delivery_fee;
            setShippingCost(actualFee);
          }
        } catch (error) {
          console.error('خطأ في تحديث تكلفة الشحن:', error);
        }
      };
      
      updateShippingCost();
    }
  }, [formData.city, total, FREE_SHIPPING_THRESHOLD]);
  
  // التعامل مع تغيير الفرع المختار
  const handleBranchChange = useCallback((branchId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBranch: branchId
    }));
  }, []);
  
  // التعامل مع تغيير نقطة الاستلام المختارة
  const handlePickupPointChange = useCallback((pickupPointId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPickupPoint: pickupPointId
    }));
  }, []);

  // التحقق من صحة النموذج
  const validateForm = useCallback(() => {
    // التحقق من الاسم
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال الاسم",
        variant: "destructive",
      });
      return false;
    }
    
    // التحقق من البريد الإلكتروني
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive",
      });
      return false;
    }
    
    // التحقق من رقم الهاتف - يجب أن يكون أرقام إنجليزية فقط
    if (!formData.phone.trim() || !/^[+0-9]{8,14}$/.test(formData.phone)) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال رقم هاتف صحيح (أرقام إنجليزية فقط)",
        variant: "destructive",
      });
      return false;
    }
    
    // التحقق من المحافظة والمدينة
    if (!formData.governorate || !formData.city) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار المحافظة والمدينة",
        variant: "destructive",
      });
      return false;
    }
    
    // التحقق من العنوان إذا كانت طريقة التسليم هي الشحن
    if (formData.deliveryMethod === 'shipping' && !formData.address.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال العنوان للتوصيل المنزلي",
        variant: "destructive",
      });
      return false;
    }
    
    // التحقق من اختيار فرع إذا كانت طريقة التسليم هي الاستلام من فرع
    if (formData.deliveryMethod === 'branch' && !formData.selectedBranch) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار فرع للاستلام",
        variant: "destructive",
      });
      return false;
    }
    
    // التحقق من اختيار نقطة استلام إذا كانت طريقة التسليم هي الاستلام من نقطة استلام
    if (formData.deliveryMethod === 'pickup_point' && !formData.selectedPickupPoint) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار نقطة استلام",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [formData, toast]);

  // إرسال الطلب
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'shipping') {
      if (validateForm()) {
        setStep('payment');
      }
    } else if (step === 'payment') {
      setLoading(true);
      try {
        // حفظ بيانات المستخدم إذا كان مسجل الدخول
        if (isLoggedIn) {
          await updateUserData({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            governorate: formData.governorate,
            city: formData.city
          });
        }
        
        // إعداد بيانات إضافية حسب طريقة التسليم
        const additionalOrderData: Record<string, any> = {};
        
        if (formData.deliveryMethod === 'branch') {
          additionalOrderData.pickup_branch_id = formData.selectedBranch;
          additionalOrderData.delivery_method = 'branch_pickup';
        } else if (formData.deliveryMethod === 'pickup_point') {
          additionalOrderData.pickup_point_id = formData.selectedPickupPoint;
          additionalOrderData.delivery_method = 'pickup_point';
        } else {
          additionalOrderData.delivery_method = 'shipping';
        }
        
        // إرسال الطلب إلى قاعدة البيانات
        await placeOrder(
          // بيانات العميل
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.deliveryMethod === 'shipping' ? formData.address : '',
            city: formData.city
          },
          // بيانات الطلب
          {
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            ...additionalOrderData
          }
        );
        clearCart();
        // الانتقال إلى خطوة التأكيد
        setStep('confirmation');
      } catch (error) {
        console.error('خطأ في إرسال الطلب:', error);
        toast({
          title: "خطأ في إرسال الطلب",
          description: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [step, formData, isLoggedIn, items, total, totalWithShipping, shippingCost, validateForm, governorateName, cityName, toast]);

  // إنهاء عملية الطلب والعودة إلى الصفحة الرئيسية
  const finish = useCallback(() => {
    clearCart();
    navigate('/');
  }, [clearCart, navigate]);

  return (
    <div className="p-0">
      {/* خطوات إتمام الطلب */}
      <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant={step === 'shipping' ? "default" : "outline"} className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
            1
          </Badge>
          <span className={`text-sm ${step === 'shipping' ? 'font-medium' : ''}`}>الشحن</span>
        </div>
        <div className="h-px bg-gray-300 flex-1 mx-2"></div>
        <div className="flex items-center gap-2">
          <Badge variant={step === 'payment' ? "default" : "outline"} className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
            2
          </Badge>
          <span className={`text-sm ${step === 'payment' ? 'font-medium' : ''}`}>الدفع</span>
        </div>
        <div className="h-px bg-gray-300 flex-1 mx-2"></div>
        <div className="flex items-center gap-2">
          <Badge variant={step === 'confirmation' ? "default" : "outline"} className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
            3
          </Badge>
          <span className={`text-sm ${step === 'confirmation' ? 'font-medium' : ''}`}>التأكيد</span>
        </div>
      </div>

      {/* محتوى الخطوات */}
      <AnimatePresence mode="wait">
        {step === 'shipping' && (
          <motion.form
            key="ship"
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="block flex-1">
                  <span className="text-sm font-medium mb-1 block">الاسم</span>
                  <Input 
                    value={formData.name} 
                    onChange={handleChange('name')} 
                    placeholder="الاسم الكامل" 
                    className="h-9 sm:h-10 text-sm" 
                    required 
                  />
                </label>
                <label className="block flex-1">
                  <span className="text-sm font-medium mb-1 block">البريد الإلكتروني</span>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange('email')} 
                    placeholder="example@domain.com" 
                    className="h-9 sm:h-10 text-sm" 
                    dir="ltr"
                    required 
                  />
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="block flex-1">
                  <span className="text-sm font-medium mb-1 block">رقم الهاتف</span>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => {
                      // التأكد من أن المدخلات أرقام إنجليزية فقط
                      const value = e.target.value.replace(/[^0-9+]/g, '');
                      setFormData(prev => ({ ...prev, phone: value }));
                    }} 
                    placeholder="01xxxxxxxxx" 
                    className="h-9 sm:h-10 text-sm" 
                    dir="ltr"
                    type="tel"
                    inputMode="numeric"
                    required 
                  />
                </label>
                <label className="block flex-1">
                  <span className="text-sm font-medium mb-1 block">العنوان</span>
                  <Input 
                    value={formData.address} 
                    onChange={handleChange('address')} 
                    placeholder="العنوان بالتفصيل" 
                    className="h-9 sm:h-10 text-sm" 
                    required 
                  />
                </label>
              </div>
              
              {/* نموذج اختيار المحافظة والمدينة */}
              <ShippingForm 
                selectedGovernorate={formData.governorate}
                selectedCity={formData.city}
                onGovernorateChange={(governorateId) => {
                  // استدعاء دالة handleGovernorateChange فقط لتجنب التكرار
                  handleGovernorateChange(governorateId, 0);
                }}
                onCityChange={(cityId, fee) => {
                  // استدعاء دالة handleCityChange فقط لتجنب التكرار
                  handleCityChange(cityId, fee);
                }}
                onShippingCostChange={setShippingCost}
              />
              
              <Separator className="my-2 sm:my-3" />
              
              {/* اختيار طريقة التسليم */}
              {formData.city && (
                <div className="mb-4">
                  <DeliveryMethodSelector
                    selectedMethod={formData.deliveryMethod}
                    onMethodChange={handleDeliveryMethodChange}
                    cityId={formData.city}
                    hasBranches={hasBranches}
                    hasPickupPoints={hasPickupPoints}
                  />
                </div>
              )}
              
              {/* عرض حقل العنوان فقط إذا كانت طريقة التسليم هي الشحن */}
              {formData.deliveryMethod === 'shipping' && (
                <label className="block mb-4">
                  <span className="text-sm font-medium mb-1 block">العنوان التفصيلي</span>
                  <Input 
                    value={formData.address} 
                    onChange={handleChange('address')} 
                    placeholder="العنوان بالتفصيل" 
                    className="h-9 sm:h-10 text-sm" 
                    required 
                  />
                </label>
              )}
              
              {/* عرض اختيار الفرع إذا كانت طريقة التسليم هي الاستلام من فرع */}
              {formData.deliveryMethod === 'branch' && formData.city && (
                <div className="mb-4">
                  <PickupSelector
                    cityId={formData.city}
                    selectedBranch={formData.selectedBranch}
                    onBranchChange={handleBranchChange}
                  />
                </div>
              )}
              
              {/* عرض اختيار نقطة الاستلام إذا كانت طريقة التسليم هي الاستلام من نقطة استلام */}
              {formData.deliveryMethod === 'pickup_point' && formData.city && (
                <div className="mb-4">
                  <PickupPointSelector
                    cityId={formData.city}
                    selectedPickupPoint={formData.selectedPickupPoint}
                    onPickupPointChange={handlePickupPointChange}
                  />
                </div>
              )}
              
              <Separator className="my-2 sm:my-3" />
              
              {/* إضافة مؤشر الشحن المجاني */}
              {formData.deliveryMethod === 'shipping' && total < FREE_SHIPPING_THRESHOLD && (
                <div className="mb-3">
                  <FreeShippingIndicator currentTotal={total} threshold={FREE_SHIPPING_THRESHOLD} />
                </div>
              )}
              
              {/* ملخص الطلب */}
              <div className="mt-4">
                <ShippingSummary 
                  subtotal={total}
                  shippingCost={formData.deliveryMethod === 'shipping' ? shippingCost : 0}
                  governorateName={governorateName}
                  cityName={cityName}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-9 sm:h-10 text-xs sm:text-sm" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 ml-1.5" />
                  متابعة للدفع
                </>
              )}
            </Button>
          </motion.form>
        )}

        {step === 'payment' && (
          <motion.form
            key="pay"
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">طريقة الدفع</h3>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as 'cod' | 'card' }))}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="cod" id="cod" />
                    <label htmlFor="cod" className="text-sm font-medium leading-none cursor-pointer">الدفع عند الاستلام</label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="card" id="card" />
                    <label htmlFor="card" className="text-sm font-medium leading-none cursor-pointer">بطاقة ائتمان</label>
                  </div>
                </RadioGroup>
              </div>
              {formData.paymentMethod === 'card' && (
                <label className="block">
                  <span className="sr-only">رقم البطاقة</span>
                  <Input 
                    placeholder="XXXX-XXXX-XXXX-XXXX" 
                    className="h-9 sm:h-10 text-sm" 
                    dir="ltr"
                  />
                </label>
              )}
              <label className="block">
                <span className="sr-only">ملاحظات</span>
                <Textarea 
                  value={formData.notes} 
                  onChange={handleChange('notes')} 
                  placeholder="ملاحظات إضافية للطلب (اختياري)" 
                  className="text-sm min-h-[60px] sm:min-h-[80px]" 
                />
              </label>
              <Separator className="my-2 sm:my-3" />
              <ShippingSummary 
                subtotal={total} 
                shippingCost={shippingCost}
                governorateName={governorateName}
                cityName={cityName}
              />
              <div className="flex gap-2 sm:gap-3 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm" 
                  onClick={() => setStep('shipping')}
                  disabled={loading}
                >
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" /> رجوع
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      جاري التنفيذ...
                    </>
                  ) : (
                    "تأكيد الطلب"
                  )}
                </Button>
              </div>
            </div>
          </motion.form>
        )}

        {step === 'confirmation' && (
          <motion.div
            key="conf"
            className="text-center space-y-3 sm:space-y-4 pt-2 p-4 sm:p-5 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
          >
            <div className="bg-green-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold">شكراً لك!</h3>
            <p className="text-sm sm:text-base text-gray-600">تم استلام طلبك بنجاح.</p>
            <p className="text-xs sm:text-sm text-gray-500">سيتم التواصل معك قريباً لتأكيد الطلب.</p>
            {/* عرض ملخص الشحن في صفحة التأكيد */}
            <div className="mt-4 mb-4">
              <ShippingSummary
                subtotal={total}
                shippingCost={formData.deliveryMethod === 'shipping' ? shippingCost : 0}
                governorateName={governorateName}
                cityName={cityName}
              />
            </div>
            <Button 
              onClick={finish} 
              className="w-full h-9 sm:h-10 text-xs sm:text-sm mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  جاري الانتقال...
                </>
              ) : (
                "العودة للرئيسية"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutForm;
