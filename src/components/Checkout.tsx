import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    
    // التحقق من الحقول المطلوبة
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast({
        title: "خطأ في المعلومات",
        description: "الرجاء إكمال جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(formData.email)) {
      toast({
        title: "خطأ في البريد الإلكتروني",
        description: "الرجاء إدخال بريد إلكتروني صحيح",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من صحة رقم الهاتف باستخدام الدالة المحسنة
    if (!validatePhone(formData.phone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "الرجاء إدخال رقم هاتف صحيح (مثال: 01012345678 أو +201012345678)",
        variant: "destructive"
      });
      return;
    }
    
    setStep('payment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // التحقق من وجود منتجات في السلة
      if (items.length === 0) {
        toast({
          title: "سلة فارغة",
          description: "يرجى إضافة منتجات إلى السلة قبل إتمام الطلب",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // إرسال الطلب إلى خدمة الطلبات
      const result = await placeOrder(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        {
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        }
      );
      
      if (result.success) {
        // تفريغ السلة فورًا بعد إتمام الطلب
        clearCart();
        console.log('Cart cleared after order placement');
        
        setOrderId(result.orderId);
        setStep('confirmation');
        
        // إظهار رسالة نجاح
        toast({
          title: "تم إتمام الطلب بنجاح!",
          description: "تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني",
          variant: "default"
        });
      } else {
        toast({
          title: "خطأ في إتمام الطلب",
          description: result.error || "حدث خطأ أثناء معالجة الطلب. الرجاء المحاولة مرة أخرى.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء معالجة الطلب. الرجاء المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckout = () => {
    // Close the checkout modal
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // مكون مؤشر التقدم
  const StepIndicator = ({ currentStep }: { currentStep: 'shipping' | 'payment' | 'confirmation' }) => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-delight-600 text-white' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              {currentStep === 'payment' || currentStep === 'confirmation' ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>
            <span className={`text-xs mt-1 font-medium ${currentStep === 'shipping' ? 'text-delight-600' : currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-500' : 'text-gray-500'}`}>الشحن</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${currentStep === 'shipping' ? 'bg-gray-200' : 'bg-green-500'}`}></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-delight-600 text-white' : currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              {currentStep === 'confirmation' ? <Check className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            </div>
            <span className={`text-xs mt-1 font-medium ${currentStep === 'payment' ? 'text-delight-600' : currentStep === 'confirmation' ? 'text-green-500' : 'text-gray-500'}`}>الدفع</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${currentStep === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'confirmation' ? 'bg-delight-600 text-white' : 'bg-gray-200'}`}>
              <Check className="h-5 w-5" />
            </div>
            <span className={`text-xs mt-1 font-medium ${currentStep === 'confirmation' ? 'text-delight-600' : 'text-gray-500'}`}>التأكيد</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
      <StepIndicator currentStep={step} />
      {/* Checkout Steps */}
      <div className="bg-delight-50 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' || step === 'payment' || step === 'confirmation' ? 'bg-delight-600 text-white' : 'bg-gray-200'}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs mt-1">الشحن</span>
          </div>
          
          <div className={`h-0.5 flex-1 mx-2 ${step === 'payment' || step === 'confirmation' ? 'bg-delight-600' : 'bg-gray-200'}`} />
          
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' || step === 'confirmation' ? 'bg-delight-600 text-white' : 'bg-gray-200'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-xs mt-1">الدفع</span>
          </div>
          
          <div className={`h-0.5 flex-1 mx-2 ${step === 'confirmation' ? 'bg-delight-600' : 'bg-gray-200'}`} />
          
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-delight-600 text-white' : 'bg-gray-200'}`}>
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs mt-1">التأكيد</span>
          </div>
        </div>
      </div>
      
      {/* Checkout Forms */}
      <div className="p-6">
        {step === 'shipping' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-4">معلومات الشحن</h2>
            <form onSubmit={handleSubmitShipping} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="pr-10" 
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
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="pr-10" 
                    placeholder="example@example.com"
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
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="pr-10" 
                    placeholder="01012345678 أو +201012345678"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  يمكنك إدخال رقم الهاتف بصيغة: 01012345678 أو +201012345678
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="أدخل العنوان التفصيلي"
                  required
                />
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
            <h2 className="text-xl font-bold mb-4">طريقة الدفع</h2>
            
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
            </div>
            
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="cursor-pointer flex-1 flex items-center">
                    <Truck className="ml-3 h-5 w-5 text-delight-600" />
                    <div>
                      <span className="font-medium">الدفع عند الاستلام</span>
                      <p className="text-sm text-gray-500">ادفع عند وصول الطلب</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer flex-1 flex items-center">
                    <CreditCard className="ml-3 h-5 w-5 text-delight-600" />
                    <div>
                      <span className="font-medium">بطاقة ائتمانية</span>
                      <p className="text-sm text-gray-500">دفع آمن عبر الإنترنت</p>
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
                  placeholder="أي ملاحظات أو تعليمات خاصة بالطلب"
                  className="min-h-[80px]"
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  
                  {savingsPercentage > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5" />
                        التوفير:
                      </span>
                      <span className="font-medium">- {totalSavings}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن:</span>
                    <span className="font-medium">15 جنيه</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي:</span>
                    <span className="text-delight-700">{totalWithShipping}</span>
                  </div>
                  
                  {savingsPercentage > 0 && (
                    <div className="bg-red-50 p-2 rounded-md text-center text-sm text-red-600 mt-2">
                      لقد وفرت {savingsPercentage.toFixed(1)}% من قيمة مشترياتك!
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('shipping')} 
                  className="flex-1"
                  disabled={loading}
                  type="button"
                >
                  العودة
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? 'جاري المعالجة...' : 'إتمام الطلب'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
        
        {step === 'confirmation' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              
              {/* تأثيرات احتفالية */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
              >
                <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-yellow-400 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-delight-400 animate-ping" style={{ animationDuration: '2s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-green-400 animate-ping" style={{ animationDuration: '1.8s' }}></div>
              </motion.div>
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-3 text-green-600">تم استلام طلبك بنجاح!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              شكراً لك على طلبك من ديلايت. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.
              <br />
              سيتم التواصل معك خلال 24 ساعة لتأكيد موعد التوصيل.
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
    </div>
  );
};

export default Checkout;
