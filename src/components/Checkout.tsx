
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, MapPin, Truck, ChevronRight, Mail, Phone, User } from 'lucide-react';
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
    // Parse the total price from string format (e.g., "120 جنيه") to number
    const numericTotal = parseInt(total.replace(/\D/g, '')) || 0;
    const shipping = 15; // Shipping cost
    setTotalWithShipping(`${numericTotal + shipping} جنيه`);
  }, [total]);

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
    // Clear the cart properly
    try {
      clearCart();
      console.log("Cart cleared successfully");
      
      toast({
        title: "شكراً لاختيارك ديلايت!",
        description: "سنتواصل معك خلال 24 ساعة لتأكيد موعد التوصيل",
        variant: "default",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
    
    // Close the checkout modal
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
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
              
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span>{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الشحن:</span>
                  <span>15 جنيه</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي:</span>
                  <span className="text-delight-700">{totalWithShipping}</span>
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
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="h-10 w-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-3 text-green-600">تم استلام طلبك بنجاح!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              شكراً لك على طلبك من ديلايت. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.
              <br />
              سيتم التواصل معك خلال 24 ساعة لتأكيد موعد التوصيل.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 block">رقم الطلب:</span>
                  <span className="font-mono font-bold">{orderId.substring(0, 8)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">الاسم:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">الهاتف:</span>
                  <span className="font-medium">{formData.phone}</span>
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
                  <span className="font-medium">{formData.paymentMethod === 'card' ? 'بطاقة ائتمانية' : 'الدفع عند الاستلام'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">المجموع:</span>
                  <span className="font-bold text-delight-600">{totalWithShipping}</span>
                </div>
              </div>
            </div>
            <Button onClick={handleCompleteCheckout} size="lg" className="w-full">
              العودة للتسوق
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
