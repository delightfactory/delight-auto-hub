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
import { MapPin, CreditCard, Check, ArrowLeft, X, Loader2 } from 'lucide-react';
import { getCurrentUserData, isUserLoggedIn, updateUserData } from '@/services/userService';
import { placeOrder } from '@/services/orderService';
import { Badge } from "@/components/ui/badge";
import ShippingForm from '@/components/shipping/ShippingForm';
import ShippingSummary from '@/components/shipping/ShippingSummary';
import FreeShippingIndicator from '@/components/shipping/FreeShippingIndicator';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  governorate: string;
  city: string;
  paymentMethod: 'cod' | 'card';
  notes: string;
}

// Formatter for currency with English digits
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);

// حد الشحن المجاني
const FREE_SHIPPING_THRESHOLD = 1000;

const Checkout: React.FC<CheckoutProps> = ({ open, onClose }) => {
  const { items, total: totalString, clearCart } = useCart();
  const total = parseFloat(totalString.replace(/[^\d.]/g, '')) || 0;
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', address: '', governorate: '', city: '', paymentMethod: 'cod', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [governorateName, setGovernorateName] = useState('');
  const [cityName, setCityName] = useState('');

  // التحقق من حالة تسجيل دخول المستخدم واسترجاع بياناته عند فتح النافذة
  useEffect(() => {
    if (open) {
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
            }
          }
        } catch (error) {
          console.error('خطأ في جلب بيانات المستخدم:', error);
        } finally {
          setLoading(false);
        }
      };
      
      checkUserStatus();
    }
  }, [open, toast]);

  // حساب الإجمالي مع الشحن
  const totalWithShipping = useMemo(() => {
    return total + shippingCost;
  }, [total, shippingCost]);

  const handleChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  // التعامل مع تغيير المحافظة
  const handleGovernorateChange = async (governorateId: string) => {
    setFormData(prev => ({
      ...prev,
      governorate: governorateId,
      city: ''
    }));

    // جلب اسم المحافظة
    if (governorateId) {
      try {
        const { data, error } = await supabase
          .from('governorates')
          .select('name_ar')
          .eq('id', governorateId)
          .single();
        
        if (error) throw error;
        if (data) {
          setGovernorateName(data.name_ar);
        }
      } catch (error) {
        console.error('Error fetching governorate name:', error);
      }
    } else {
      setGovernorateName('');
    }
  };

  // التعامل مع تغيير المدينة
  const handleCityChange = async (cityId: string, fee: number) => {
    setFormData(prev => ({
      ...prev,
      city: cityId
    }));
    setShippingCost(fee);

    // جلب اسم المدينة
    if (cityId) {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('name_ar')
          .eq('id', cityId)
          .single();
        
        if (error) throw error;
        if (data) {
          setCityName(data.name_ar);
        }
      } catch (error) {
        console.error('Error fetching city name:', error);
      }
    } else {
      setCityName('');
    }
  };

  const validateShipping = useCallback(async () => {
    const { name, email, phone, address, governorate, city } = formData;
    if (!name || !email || !phone || !address || !governorate || !city) {
      toast({ title: 'الحقول مطلوبة', description: 'يرجى تعبئة جميع البيانات', variant: 'destructive' });
      return false;
    }
    // تحسين التحقق من رقم الهاتف للتأكد من أنه يحتوي على أرقام إنجليزية فقط
    if (!/^[0-9+]{8,14}$/.test(phone)) {
      toast({ title: 'رقم هاتف غير صالح', description: 'يجب أن يتكون من أرقام إنجليزية فقط', variant: 'destructive' });
      return false;
    }
    
    // حفظ بيانات المستخدم في التخزين المحلي والسيشن
    const userData = { name, email, phone, address, governorate, city };
    localStorage.setItem('userShippingInfo', JSON.stringify(userData));
    sessionStorage.setItem('userShippingInfo', JSON.stringify(userData));
    
    // إذا كان المستخدم مسجلاً، قم بتحديث بياناته في قاعدة البيانات
    if (isLoggedIn) {
      try {
        const result = await updateUserData({
          name,
          email,
          phone,
          address,
          governorate,
          city
        });
        
        if (result.success) {
          console.log('تم تحديث بيانات العميل في قاعدة البيانات');
        } else {
          console.error('خطأ في تحديث بيانات العميل:', result.error);
        }
      } catch (error) {
        console.error('خطأ في تحديث بيانات العميل:', error);
        // لا نوقف العملية في حالة الخطأ
      }
    }
    
    console.log('تم حفظ بيانات العميل', userData);
    return true;
  }, [formData, toast, isLoggedIn]);

  const onSubmitShipping = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const isValid = await validateShipping();
        if (isValid) {
          setStep('payment');
        }
      } catch (error) {
        console.error('خطأ في التحقق من بيانات الشحن:', error);
        toast({
          title: 'خطأ في التحقق من البيانات',
          description: 'يرجى المحاولة مرة أخرى',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    },
    [validateShipping, toast]
  );

  const onSubmitPayment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        // إعداد بيانات العميل والطلب
        const { name, email, phone, address, governorate, city, paymentMethod, notes } = formData;
        
        const customerData = {
          name,
          email,
          phone,
          address,
          city: `${governorate} - ${city}` // دمج المحافظة والمدينة للتوافق مع الواجهة الحالية
        };
        
        const orderData = {
          paymentMethod,
          notes
        };
        
        // حفظ بيانات العميل للاستخدام المستقبلي
        const userData = { name, email, phone, address, governorate, city };
        localStorage.setItem('userShippingInfo', JSON.stringify(userData));
        sessionStorage.setItem('userShippingInfo', JSON.stringify(userData));
        
        if (isLoggedIn) {
          // إذا كان المستخدم مسجلاً، استخدم خدمة الطلبات لإرسال الطلب
          const result = await placeOrder(customerData, orderData);
          
          if (result.success) {
            clearCart();
            toast({
              title: 'تم تقديم الطلب',
              description: `رقم: ${result.orderId}`,
              variant: 'default'
            });
            setStep('confirmation');
            console.log('تم إرسال الطلب بنجاح', result);
          } else {
            throw new Error(result.error || 'حدث خطأ في معالجة الطلب');
          }
        } else {
          // إذا لم يكن المستخدم مسجلاً، استخدم محاكاة محلية
          // حفظ بيانات الطلب في التخزين المحلي للاستخدام المستقبلي
          const payload = { customerData, orderData, items, total: totalWithShipping };
          localStorage.setItem('lastOrder', JSON.stringify(payload));
          
          // محاكاة التأخير لتقديم تجربة مستخدم أفضل
          setTimeout(() => {
            // إنشاء رقم طلب عشوائي
            const orderId = Math.floor(100000 + Math.random() * 900000);
            
            clearCart();
            toast({
              title: 'تم تقديم الطلب',
              description: `رقم: ${orderId}`,
              variant: 'default'
            });
            setStep('confirmation');
            
            console.log('تم إرسال الطلب بنجاح (محاكاة)', { orderId, ...payload });
          }, 1500);
        }
      } catch (error) {
        console.error('خطأ في معالجة الطلب:', error);
        toast({
          title: 'خطأ في الطلب',
          description: error instanceof Error ? error.message : 'حاول لاحقاً',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, items, totalWithShipping, clearCart, toast, isLoggedIn]
  );

  const finish = useCallback(() => {
    onClose();
    navigate('/');
  }, [onClose, navigate]);

  // prevent background scroll & handle Escape
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', onEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      };
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center p-4 checkout-modal-overlay">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
            style={{ backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] relative checkout-modal-content overflow-hidden flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-[102]"
              aria-label="إغلاق"
              disabled={loading}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            {isLoggedIn && (
              <div className="absolute top-3 left-3 z-[102]">
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs border-green-200">
                  <Check className="h-3 w-3 mr-1" /> مسجل الدخول
                </Badge>
              </div>
            )}
            {step === 'shipping' && (
              <motion.form
                key="shipping"
                className="space-y-4 p-4 sm:p-5 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep('payment');
                }}
              >
                <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><MapPin className="h-4 w-4 sm:h-5 sm:w-5" /> معلومات الشحن</h3>
                
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium mb-1 block">الاسم</span>
                    <Input 
                      value={formData.name} 
                      onChange={handleChange('name')} 
                      placeholder="الاسم الكامل" 
                      className="h-9 sm:h-10 text-sm" 
                      required 
                    />
                  </label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium mb-1 block">البريد الإلكتروني</span>
                    <Input 
                      value={formData.email} 
                      onChange={handleChange('email')} 
                      placeholder="example@domain.com" 
                      className="h-9 sm:h-10 text-sm" 
                      type="email" 
                      required 
                      disabled={isLoggedIn}
                    />
                  </label>
                  <label className="block">
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
                </div>
                
                <div className="space-y-3">
                  <label className="block">
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
                
                {/* استخدام مكون ShippingForm لاختيار المحافظة والمدينة */}
                <div className="space-y-3">
                  <ShippingForm 
                    onShippingCostChange={setShippingCost}
                    selectedGovernorate={formData.governorate}
                    selectedCity={formData.city}
                    onGovernorateChange={handleGovernorateChange}
                    onCityChange={handleCityChange}
                  />
                </div>
                
                <Separator className="my-2 sm:my-3" />
                
                {/* إضافة مؤشر الشحن المجاني */}
                {total < FREE_SHIPPING_THRESHOLD && (
                  <div className="mb-3">
                    <FreeShippingIndicator currentTotal={total} threshold={FREE_SHIPPING_THRESHOLD} />
                  </div>
                )}
                
                {/* عرض ملخص الطلب مع تكلفة الشحن */}
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
                    onClick={() => onClose()}
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" /> رجوع
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                    disabled={!formData.city} // تعطيل الزر إذا لم يتم اختيار المدينة
                  >
                    متابعة <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  </Button>
                </div>
              </motion.form>
            )}
            
            {step === 'payment' && (
              <motion.form
                key="payment"
                onSubmit={onSubmitPayment}
                initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                className="space-y-4 p-4 sm:p-5 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><CreditCard className="h-4 w-4 sm:h-5 sm:w-5" /> الدفع</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={value => setFormData(prev => ({ ...prev, paymentMethod: value as 'cod' | 'card' }))}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="cod" id="cod" className="h-4 w-4" />
                      <label htmlFor="cod" className="text-sm font-medium leading-none cursor-pointer">الدفع عند الاستلام</label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="card" id="card" className="h-4 w-4" />
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Checkout;