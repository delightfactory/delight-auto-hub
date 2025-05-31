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

const SHIPPING_COST = 15;

// Formatter for currency with English digits
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);

// قائمة المحافظات والمدن في مصر
const egyptCitiesByGovernorate: Record<string, string[]> = {
  'القاهرة': ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'وسط البلد', 'المقطم', 'الزمالك', 'شبرا', 'عين شمس', 'المرج', 'حلوان', 'التجمع الخامس', 'الشروق', '15 مايو', 'السلام', 'المطرية'],
  'الجيزة': ['الدقي', 'المهندسين', 'العجوزة', 'الهرم', 'فيصل', 'أكتوبر', '6 أكتوبر', 'الشيخ زايد', 'حدائق الأهرام', 'البدرشين', 'العياط', 'الواحات البحرية'],
  'الإسكندرية': ['المنتزه', 'شرق الإسكندرية', 'وسط الإسكندرية', 'الجمرك', 'العامرية', 'العجمي', 'برج العرب', 'سموحة', 'سيدي جابر', 'الأزاريطة', 'محرم بك', 'كفر الدوار'],
  'الدقهلية': ['المنصورة', 'طلخا', 'ميت غمر', 'دكرنس', 'أجا', 'منية النصر', 'السنبلاوين', 'الجمالية', 'المنزلة', 'بلقاس', 'شربين', 'المطرية'],
  'البحر الأحمر': ['الغردقة', 'رأس غارب', 'سفاجا', 'القصير', 'مرسى علم', 'شلاتين', 'حلايب'],
  'البحيرة': ['دمنهور', 'كفر الدوار', 'رشيد', 'إدكو', 'أبو المطامير', 'أبو حمص', 'الدلنجات', 'المحمودية', 'الرحمانية', 'إيتاي البارود', 'حوش عيسى', 'شبراخيت', 'كوم حمادة', 'وادي النطرون'],
  'الفيوم': ['الفيوم', 'طامية', 'سنورس', 'إطسا', 'إبشواي', 'يوسف الصديق'],
  'الغربية': ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'السنطة', 'قطور', 'بسيون', 'سمنود'],
  'الإسماعيلية': ['الإسماعيلية', 'فايد', 'القنطرة شرق', 'القنطرة غرب', 'التل الكبير', 'أبو صوير', 'القصاصين'],
  'المنوفية': ['شبين الكوم', 'منوف', 'أشمون', 'الباجور', 'قويسنا', 'بركة السبع', 'تلا', 'الشهداء', 'سرس الليان'],
  'المنيا': ['المنيا', 'العدوة', 'مغاغة', 'بني مزار', 'مطاي', 'سمالوط', 'ملوي', 'دير مواس', 'أبو قرقاص'],
  'القليوبية': ['بنها', 'قليوب', 'شبرا الخيمة', 'القناطر الخيرية', 'الخانكة', 'كفر شكر', 'طوخ', 'شبين القناطر', 'الخصوص', 'العبور'],
  'الوادي الجديد': ['الخارجة', 'باريس', 'بلاط', 'موط', 'الفرافرة', 'الداخلة'],
  'السويس': ['السويس', 'الأربعين', 'عتاقة', 'الجناين'],
  'أسوان': ['أسوان', 'دراو', 'كوم أمبو', 'نصر النوبة', 'إدفو', 'كلابشة', 'أبو سمبل السياحية'],
  'أسيوط': ['أسيوط', 'ديروط', 'منفلوط', 'القوصية', 'أبنوب', 'الفتح', 'ساحل سليم', 'البداري', 'صدفا', 'الغنايم', 'أبو تيج'],
  'بني سويف': ['بني سويف', 'الواسطى', 'ناصر', 'إهناسيا', 'ببا', 'سمسطا', 'الفشن'],
  'بورسعيد': ['بورسعيد', 'بورفؤاد', 'العرب', 'الضواحي', 'المناخ', 'الزهور', 'الجنوب'],
  'دمياط': ['دمياط', 'دمياط الجديدة', 'رأس البر', 'فارسكور', 'كفر سعد', 'الزرقا', 'السرو', 'الروضة', 'كفر البطيخ'],
  'الشرقية': ['الزقازيق', 'منيا القمح', 'بلبيس', 'مشتول السوق', 'الإبراهيمية', 'ههيا', 'أبو حماد', 'أبو كبير', 'الحسينية', 'صان الحجر', 'الصالحية الجديدة', 'فاقوس', 'الإسماعيلية', 'كفر صقر', 'أولاد صقر', 'ديرب نجم'],
  'جنوب سيناء': ['الطور', 'شرم الشيخ', 'دهب', 'نويبع', 'طابا', 'سانت كاترين', 'أبو رديس', 'أبو زنيمة', 'رأس سدر'],
  'كفر الشيخ': ['كفر الشيخ', 'دسوق', 'فوه', 'مطوبس', 'بيلا', 'الرياض', 'الحامول', 'البرلس', 'قلين', 'سيدي سالم', 'الحامول'],
  'مطروح': ['مرسى مطروح', 'الحمام', 'العلمين', 'الضبعة', 'النجيلة', 'سيدي براني', 'السلوم', 'سيوة'],
  'الأقصر': ['الأقصر', 'الأقصر الجديدة', 'طيبة الجديدة', 'الزينية', 'البياضية', 'القرنة', 'أرمنت', 'الطود', 'إسنا'],
  'قنا': ['قنا', 'قنا الجديدة', 'أبو تشت', 'نجع حمادي', 'دشنا', 'الوقف', 'قفط', 'نقادة', 'فرشوط'],
  'شمال سيناء': ['العريش', 'الشيخ زويد', 'رفح', 'بئر العبد', 'الحسنة', 'نخل'],
  'سوهاج': ['سوهاج', 'سوهاج الجديدة', 'أخميم', 'أخميم الجديدة', 'البلينا', 'المراغة', 'المنشاة', 'دار السلام', 'جرجا', 'جهينة', 'ساقلتة', 'طما', 'طهطا']
};

// قائمة المحافظات
const egyptGovernorates = Object.keys(egyptCitiesByGovernorate);

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
  const [fetchingUserData, setFetchingUserData] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // التحقق من حالة تسجيل دخول المستخدم واسترجاع بياناته عند فتح النافذة
  useEffect(() => {
    if (open) {
      const checkUserStatus = async () => {
        setFetchingUserData(true);
        try {
          // التحقق مما إذا كان المستخدم مسجل الدخول
          const loggedIn = await isUserLoggedIn();
          setIsLoggedIn(loggedIn);
          
          if (loggedIn) {
            // جلب بيانات المستخدم من قاعدة البيانات
            const userData = await getCurrentUserData();
            
            if (userData) {
              // التحقق من وجود المحافظة في قائمة المحافظات
              console.log("المحافظة المسترجعة من قاعدة البيانات:", userData.governorate);
              
              // البحث عن المحافظة بغض النظر عن التشكيل والمسافات
              let matchedGovernorate = userData.governorate || '';
              
              // التحقق من وجود المحافظة في القائمة
              const normalizedGov = userData.governorate?.trim().replace(/\s+/g, ' ');
              if (normalizedGov && !egyptCitiesByGovernorate[normalizedGov]) {
                // البحث عن مطابقة بغض النظر عن حالة الأحرف
                const matchedGov = egyptGovernorates.find(gov => 
                  gov.trim().toLowerCase() === normalizedGov.toLowerCase());
                  
                if (matchedGov) {
                  matchedGovernorate = matchedGov;
                  console.log("تم العثور على مطابقة للمحافظة:", matchedGov);
                }
              }
              
              // تعيين بيانات المستخدم المسجل
              setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                governorate: matchedGovernorate,
                city: userData.city || ''
              }));
              
              // قفل البريد الإلكتروني لأن المستخدم مسجل
              setEmailLocked(true);
              
              // تحديث المدن المتاحة بناءً على المحافظة
              if (matchedGovernorate && egyptCitiesByGovernorate[matchedGovernorate]) {
                setAvailableCities(egyptCitiesByGovernorate[matchedGovernorate]);
                
                // التحقق من وجود المدينة في قائمة المدن المتاحة
                if (userData.city && !egyptCitiesByGovernorate[matchedGovernorate].includes(userData.city)) {
                  console.log("المدينة غير موجودة في قائمة مدن المحافظة:", userData.city);
                }
              } else {
                // إذا لم تكن المحافظة موجودة، نترك قائمة المدن فارغة
                setAvailableCities([]);
              }
              
              toast({
                title: "تم تحميل بياناتك",
                description: "تم استرجاع بيانات الشحن الخاصة بك",
                variant: "default"
              });
              
              console.log('تم تحميل بيانات العميل من قاعدة البيانات', userData);
              setFetchingUserData(false);
              return;
            }
          }
          
          // إذا لم يكن المستخدم مسجلاً أو لم تكن هناك بيانات، نستخدم البيانات المحلية
          const savedData = localStorage.getItem('userShippingInfo');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              
              // تعيين البيانات المحفوظة محلياً
              setFormData(prev => ({
                ...prev,
                name: parsedData.name || '',
                email: parsedData.email || '',
                phone: parsedData.phone || '',
                address: parsedData.address || '',
                governorate: parsedData.governorate || '',
                city: parsedData.city || ''
              }));
              
              // لا نقفل البريد الإلكتروني لأن المستخدم غير مسجل
              
              // تحديث المدن المتاحة بناءً على المحافظة
              if (parsedData.governorate && egyptCitiesByGovernorate[parsedData.governorate]) {
                setAvailableCities(egyptCitiesByGovernorate[parsedData.governorate]);
              }
              
              console.log('تم تحميل بيانات العميل من التخزين المحلي', parsedData);
            } catch (error) {
              console.error('خطأ في تحليل بيانات الشحن المحفوظة:', error);
            }
          } else {
            console.log('لا توجد بيانات محفوظة للعميل');
          }
        } catch (error) {
          console.error('خطأ في جلب بيانات المستخدم:', error);
        } finally {
          setFetchingUserData(false);
        }
      };
      
      checkUserStatus();
    }
  }, [open, toast]);
  
  // تحديث المدن المتاحة عند تغيير المحافظة
  useEffect(() => {
    if (formData.governorate && egyptCitiesByGovernorate[formData.governorate]) {
      setAvailableCities(egyptCitiesByGovernorate[formData.governorate]);
      // إعادة تعيين المدينة إذا لم تكن موجودة في المحافظة الجديدة
      if (formData.city && !egyptCitiesByGovernorate[formData.governorate].includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.governorate]);

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

  // total with shipping
  const totalWithShipping = useMemo(() => total + SHIPPING_COST, [total]);

  const handleChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const validateShipping = useCallback(async () => {
    const { name, email, phone, address, governorate, city } = formData;
    if (!name || !email || !phone || !address || !governorate || !city) {
      toast({ title: 'الحقول مطلوبة', description: 'يرجى تعبئة جميع البيانات', variant: 'destructive' });
      return false;
    }
    if (!/^\+?\d{8,14}$/.test(phone)) {
      toast({ title: 'رقم هاتف غير صالح', description: 'يجب أن يتكون من أرقام صحيحة', variant: 'destructive' });
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

  // إضافة قيمة z-index عالية جداً وتعليمات CSS لضمان ظهور النافذة فوق جميع العناصر
  // إضافة أنماط CSS للتأكد من أن النافذة تظهر فوق كل شيء
  useEffect(() => {
    if (open) {
      // إنشاء عنصر أنماط مؤقت للتأكد من أن النافذة تظهر فوق كل شيء
      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        .checkout-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999 !important;
          isolation: isolate;
        }
        .checkout-modal-content {
          position: relative;
          z-index: 100000 !important;
          isolation: isolate;
        }
      `;
      styleEl.setAttribute('id', 'checkout-modal-styles');
      document.head.appendChild(styleEl);
      
      return () => {
        // إزالة الأنماط عند إغلاق النافذة
        const existingStyle = document.getElementById('checkout-modal-styles');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [open]);
  
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
              disabled={loading || fetchingUserData}
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
                key="ship"
                onSubmit={onSubmitShipping}
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                className="space-y-3 sm:space-y-4 pt-2 p-4 sm:p-5 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><MapPin className="h-4 w-4 sm:h-5 sm:w-5" /> معلومات الشحن</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className="block">
                    <span className="text-xs text-gray-600 mb-1 block">الاسم الكامل *</span>
                    <Input 
                      value={formData.name} 
                      onChange={handleChange('name')} 
                      placeholder="الاسم الكامل" 
                      className="h-9 sm:h-10 text-sm" 
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-600 mb-1 block">البريد الإلكتروني *</span>
                    <Input 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange('email')} 
                      placeholder="البريد الإلكتروني" 
                      className="h-9 sm:h-10 text-sm" 
                      dir="ltr"
                      required
                      disabled={emailLocked}
                    />
                    {emailLocked && (
                      <span className="text-xs text-blue-600 mt-1 block">البريد الإلكتروني مسجل مسبقاً</span>
                    )}
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs text-gray-600 mb-1 block">رقم الهاتف *</span>
                  <Input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange('phone')} 
                    placeholder="رقم الهاتف" 
                    className="h-9 sm:h-10 text-sm" 
                    dir="ltr"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-600 mb-1 block">العنوان التفصيلي *</span>
                  <Input 
                    value={formData.address} 
                    onChange={handleChange('address')} 
                    placeholder="العنوان التفصيلي" 
                    className="h-9 sm:h-10 text-sm" 
                    required
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className="block">
                    <span className="text-xs text-gray-600 mb-1 block">المحافظة *</span>
                    <select
                      value={formData.governorate}
                      onChange={(e) => setFormData(prev => ({ ...prev, governorate: e.target.value, city: '' }))}
                      className="w-full h-9 sm:h-10 text-sm rounded-md border border-input bg-background px-3 py-1"
                      required
                    >
                      <option value="" disabled>اختر المحافظة</option>
                      {egyptGovernorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-600 mb-1 block">المدينة *</span>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full h-9 sm:h-10 text-sm rounded-md border border-input bg-background px-3 py-1"
                      required
                      disabled={!formData.governorate}
                    >
                      <option value="" disabled>اختر المدينة</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {!formData.governorate && (
                      <span className="text-xs text-gray-500 mt-1 block">اختر المحافظة أولاً</span>
                    )}
                  </label>
                </div>
                <Separator className="my-2 sm:my-3" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between"><span>المجموع</span><span dir="ltr">{formatCurrency(total)}</span></div>
                  <div className="flex justify-between"><span>الشحن</span><span dir="ltr">{formatCurrency(SHIPPING_COST)}</span></div>
                  <div className="flex justify-between font-semibold"><span>الإجمالي</span><span dir="ltr">{formatCurrency(totalWithShipping)}</span></div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm mt-2" 
                  disabled={loading || fetchingUserData}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    "التالي"
                  )}
                </Button>
                {fetchingUserData && (
                  <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    جاري جلب بياناتك...
                  </div>
                )}
              </motion.form>
            )}

            {step === 'payment' && (
              <motion.form
                key="pay"
                onSubmit={onSubmitPayment}
                initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                className="space-y-3 sm:space-y-4 pt-2 p-4 sm:p-5 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
                <div className="flex justify-between font-semibold text-xs sm:text-sm">
                  <span>الإجمالي</span>
                  <span dir="ltr">{formatCurrency(totalWithShipping)}</span>
                </div>
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