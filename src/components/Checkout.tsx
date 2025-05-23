
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
    const shipping = 30; // Shipping cost for Egypt
    setTotalWithShipping(`${numericTotal + shipping} جنيه`);
  }, [total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
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
    
    // التحقق من صحة رقم الهاتف (تنسيق مصري)
    const phonePattern = /^(01)[0-2,5]{1}[0-9]{8}$/;
    if (!phonePattern.test(formData.phone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "الرجاء إدخال رقم هاتف مصري صحيح مثل: 01012345678",
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
    toast({
      title: "تم إتمام الطلب بنجاح",
      description: "سنتواصل معك قريباً للتأكيد والشحن",
      variant: "default",
    });
    
    // Clear the cart properly
    try {
      clearCart();
      console.log("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
    
    // Close the checkout modal
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Checkout Steps */}
      <div className="bg-delight-50 p-4">
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
                    placeholder="01012345678"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="أدخل العنوان التفصيلي"
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
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full">
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
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer flex-1 flex items-center">
                    <CreditCard className="ml-2 h-5 w-5 text-delight-600" />
                    <span>بطاقة ائتمانية</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="cursor-pointer flex-1 flex items-center">
                    <Truck className="ml-2 h-5 w-5 text-delight-600" />
                    <span>الدفع عند الاستلام</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="fawry" id="fawry" />
                  <Label htmlFor="fawry" className="cursor-pointer flex-1 flex items-center">
                    <img src="https://placehold.co/30/orange/white?text=F" className="ml-2 h-5 w-5" />
                    <span>فوري</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="vodafone_cash" id="vodafone_cash" />
                  <Label htmlFor="vodafone_cash" className="cursor-pointer flex-1 flex items-center">
                    <img src="https://placehold.co/30/e60000/white?text=V" className="ml-2 h-5 w-5" />
                    <span>فودافون كاش</span>
                  </Label>
                </div>
              </RadioGroup>
              
              {formData.paymentMethod === 'card' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center text-sm text-gray-500">
                    سيتم توجيهك إلى صفحة الدفع الآمنة لإتمام العملية
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="أي ملاحظات أو تعليمات خاصة بالطلب"
                  className="min-h-[100px]"
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span>{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الشحن:</span>
                  <span>30 جنيه</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
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
                >
                  العودة
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
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
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="h-8 w-8 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              شكراً لك على طلبك. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.
              سيتم التواصل معك قريباً لتأكيد موعد الشحن.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-right">
              <div className="mb-2">
                <span className="text-gray-600">رقم الطلب: </span>
                <span className="font-mono">{orderId.substring(0, 8)}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">الاسم: </span>
                <span>{formData.name}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">العنوان: </span>
                <span>{formData.address}، {formData.city}</span>
              </div>
              <div>
                <span className="text-gray-600">طريقة الدفع: </span>
                <span>
                  {formData.paymentMethod === 'card' && 'بطاقة ائتمانية'}
                  {formData.paymentMethod === 'cod' && 'الدفع عند الاستلام'}
                  {formData.paymentMethod === 'fawry' && 'فوري'}
                  {formData.paymentMethod === 'vodafone_cash' && 'فودافون كاش'}
                </span>
              </div>
            </div>
            <Button onClick={handleCompleteCheckout} className="w-full">
              العودة للتسوق
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
