import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  CreditCard, 
  MapPin, 
  Truck, 
  ChevronRight, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Percent, 
  ArrowLeft,
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { placeOrder } from '@/services/orderService';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface CheckoutProps {
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onClose }) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [checkoutMounted, setCheckoutMounted] = useState(false);
  
  // ضمان عرض المكون بطريقة سلسة بعد تحميل الصفحة
  useEffect(() => {
    setCheckoutMounted(true);
    return () => setCheckoutMounted(false);
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
    notes: ''
  });
  
  // حساب إجمالي التوفير
  const [totalSavings, setTotalSavings] = useState<string>('0');
  const [savingsPercentage, setSavingsPercentage] = useState<number>(0);
  
  // Calculate total including shipping
  const [totalWithShipping, setTotalWithShipping] = useState('0');
  
  // Fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      }));
    } else {
      // Redirect to auth if not logged in
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول أو إنشاء حساب جديد لمتابعة عملية الشراء",
        variant: "default"
      });
      onClose();
      navigate('/auth');
    }
  }, [user, navigate, onClose]);
  
  useEffect(() => {
    // حساب إجمالي التوفير
    let savings = 0;
    let originalTotal = 0;
    
    items.forEach(item => {
      const currentPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
      const originalPrice = item.originalPrice ? parseFloat(item.originalPrice.replace(/[^\d.]/g, '')) : currentPrice;
      
      if (originalPrice > currentPrice) {
        savings += (originalPrice - currentPrice) * item.quantity;
      }
      
      originalTotal += originalPrice * item.quantity;
    });
    
    setTotalSavings(`${savings.toFixed(2)} جنيه`);
    setSavingsPercentage(originalTotal > 0 ? (savings / originalTotal) * 100 : 0);

    // Parse the total price from string format (e.g., "120 جنيه") to number
    const numericTotal = parseFloat(total.replace(/[^\d.]/g, '')) || 0;
    const shipping = 15; // Shipping cost
    setTotalWithShipping(`${(numericTotal + shipping).toFixed(2)} جنيه`);
  }, [items, total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone: string): boolean => {
    // تحسين التحقق من أرقام الهاتف المصرية والعربية
    const egyptianPhonePattern = /^(\+20|0020|20|0)?1[0125][0-9]{8}$/;
    const arabicPhonePattern = /^(\+966|00966|966|0)?5[0-9]{8}$/;
    const generalPhonePattern = /^[\+]?[1-9][\d]{7,14}$/;
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    return egyptianPhonePattern.test(cleanPhone) || 
           arabicPhonePattern.test(cleanPhone) || 
           generalPhonePattern.test(cleanPhone);
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من صحة رقم الهاتف
    if (!validatePhone(formData.phone)) {
      toast({
        title: "رقم هاتف غير صالح",
        description: "يرجى إدخال رقم هاتف صحيح",
        variant: "destructive"
      });
      return;
    }
    
    // الانتقال إلى خطوة الدفع
    setStep('payment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // إرسال طلب إلى الخادم
      const shippingInfo = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      };
      
      const paymentInfo = {
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };
      
      const result = await placeOrder(shippingInfo, paymentInfo);
      
      if (result.success) {
        // تمت معالجة الطلب بنجاح
        setOrderId(result.orderId);
        setStep('confirmation');
        
        // تنظيف سلة التسوق
        clearCart();
        
        toast({
          title: "تم تقديم الطلب بنجاح",
          description: `رقم الطلب: ${result.orderId.substring(0, 8)}`,
          variant: "default"
        });
      } else {
        throw new Error(result.error || "حدث خطأ أثناء معالجة الطلب");
      }
    } catch (error) {
      console.error("خطأ في إرسال الطلب:", error);
      toast({
        title: "خطأ في تقديم الطلب",
        description: "حدث خطأ أثناء محاولة إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckout = () => {
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {checkoutMounted && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden relative my-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* رأس الصفحة */}
            <div className="bg-delight-50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-delight-900">
                {step === 'shipping' && 'معلومات الشحن'}
                {step === 'payment' && 'معلومات الدفع'}
                {step === 'confirmation' && 'تأكيد الطلب'}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            
            {/* مؤشر تقدم عملية التسوق */}
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'shipping' || step === 'payment' || step === 'confirmation' 
                      ? 'bg-delight-600 text-white' 
                      : 'bg-gray-200'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs mt-1">الشحن</span>
                </div>
                
                <div className={`h-0.5 flex-grow mx-2 ${
                  step === 'payment' || step === 'confirmation' 
                    ? 'bg-delight-600' 
                    : 'bg-gray-200'
                }`} />
                
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'payment' || step === 'confirmation' 
                      ? 'bg-delight-600 text-white' 
                      : 'bg-gray-200'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs mt-1">الدفع</span>
                </div>
                
                <div className={`h-0.5 flex-grow mx-2 ${
                  step === 'confirmation' 
                    ? 'bg-delight-600' 
                    : 'bg-gray-200'
                }`} />
                
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'confirmation' 
                      ? 'bg-delight-600 text-white' 
                      : 'bg-gray-200'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs mt-1">التأكيد</span>
                </div>
              </div>
            </div>

            {/* المحتوى الرئيسي */}
            <div className="p-6">
              {step === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-xl font-bold mb-4 text-delight-800">معلومات الشحن</h2>
                  <form onSubmit={handleSubmitShipping} className="space-y-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                          id="name"
                          name="name" 
                          className="pr-10" 
                          value={formData.name}
                          onChange={handleInputChange} 
                          placeholder="أدخل الاسم الكامل"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                          type="email"
                          id="email"
                          name="email" 
                          className="pr-10" 
                          value={formData.email}
                          onChange={handleInputChange} 
                          placeholder="أدخل البريد الإلكتروني"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                          id="phone"
                          name="phone" 
                          className="pr-10" 
                          value={formData.phone}
                          onChange={handleInputChange} 
                          placeholder="أدخل رقم الهاتف"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                          id="address"
                          name="address" 
                          className="pr-10" 
                          value={formData.address}
                          onChange={handleInputChange} 
                          placeholder="أدخل العنوان بالتفصيل"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة</Label>
                      <Input 
                        id="city"
                        name="city" 
                        value={formData.city}
                        onChange={handleInputChange} 
                        placeholder="أدخل اسم المدينة"
                        required
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" className="w-full" size="lg">
                        متابعة للدفع
                        <ChevronRight className="mr-2 h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
              
              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl font-bold mb-4 text-delight-800">طريقة الدفع</h2>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold mb-3">ملخص الطلب</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{parseInt(item.price.replace(/\D/g, '')) * item.quantity} جنيه</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between font-medium">
                      <span>المجموع</span>
                      <span>{total}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-1">
                      <span>رسوم الشحن</span>
                      <span>15 جنيه</span>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>الإجمالي</span>
                      <span>{totalWithShipping}</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmitPayment} className="space-y-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <RadioGroup 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                      className="gap-4"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">الدفع عند الاستلام</div>
                            <div className="text-sm text-gray-500">ادفع نقداً عند استلام المنتجات</div>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">بطاقة ائتمانية</div>
                            <div className="text-sm text-gray-500">الدفع باستخدام بطاقة الائتمان</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                      <Textarea 
                        id="notes"
                        name="notes" 
                        value={formData.notes}
                        onChange={handleInputChange} 
                        placeholder="أي ملاحظات خاصة بالطلب"
                        rows={3}
                      />
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setStep('shipping')}
                      >
                        العودة للشحن
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        size="lg" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>جارٍ المعالجة...</>
                        ) : (
                          <>
                            إتمام الطلب
                            <Check className="mr-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
                      <ShieldCheck className="h-4 w-4" />
                      <span>تعاملاتك آمنة ومشفرة</span>
                    </div>
                  </form>
                </motion.div>
              )}
              
              {step === 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-delight-800 mb-2">تم تأكيد طلبك بنجاح!</h2>
                  <p className="text-gray-600 mb-8">
                    سنقوم بمراجعة طلبك والتواصل معك في أقرب وقت ممكن. يمكنك متابعة حالة طلبك من صفحة الطلبات في حسابك.
                  </p>
                  
                  {savingsPercentage > 0 && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Percent className="h-5 w-5 text-red-600" />
                        </div>
                        <span className="font-medium text-red-700">إجمالي التوفير</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600 text-lg">{totalSavings}</div>
                        <div className="text-sm text-red-500">{savingsPercentage.toFixed(1)}% من قيمة مشترياتك</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white border shadow-sm p-6 rounded-lg mb-6 text-right">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-delight-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-delight-600" />
                        </div>
                        <span className="font-bold text-delight-900">تفاصيل الطلب</span>
                      </div>
                      <div className="bg-delight-100 text-delight-700 px-3 py-1 rounded-full text-sm font-medium">
                        رقم الطلب: {orderId.substring(0, 8)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block">الاسم:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">الهاتف:</span>
                        <span className="font-medium">{formData.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">البريد الإلكتروني:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">المدينة:</span>
                        <span className="font-medium">{formData.city}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 block">العنوان:</span>
                        <span className="font-medium">{formData.address}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">طريقة الدفع:</span>
                        <span className="font-medium flex items-center gap-1">
                          {formData.paymentMethod === 'card' ? (
                            <>
                              <CreditCard className="h-4 w-4 text-blue-500" />
                              <span>بطاقة ائتمانية</span>
                            </>
                          ) : (
                            <>
                              <Package className="h-4 w-4 text-green-500" />
                              <span>الدفع عند الاستلام</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">المجموع:</span>
                        <span className="font-bold text-delight-600">{totalWithShipping}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleCompleteCheckout} size="lg" className="w-full py-6">
                      العودة للتسوق
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Checkout;