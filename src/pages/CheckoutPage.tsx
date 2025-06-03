import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CheckoutForm from '../components/checkout/CheckoutForm';

/**
 * صفحة إتمام الطلب - تعرض نموذج إتمام الطلب كصفحة كاملة بدلاً من نافذة منبثقة
 */
const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total } = useCart();
  
  // التحقق من وجود منتجات في السلة
  const hasItems = items.length > 0;
  
  // إذا لم تكن هناك منتجات، عرض رسالة وزر للعودة إلى صفحة المنتجات
  if (!hasItems) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h1 className="text-xl font-bold mb-4">السلة فارغة</h1>
          <p className="text-gray-600 mb-6">لا توجد منتجات في سلة التسوق الخاصة بك.</p>
          <Button onClick={() => navigate('/products')} className="mx-auto">
            <ArrowRight className="ml-2 h-4 w-4" />
            تصفح المنتجات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="container max-w-4xl mx-auto py-6 px-4"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إتمام الطلب</h1>
        <p className="text-gray-600">أكمل بيانات الطلب للمتابعة</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <CheckoutForm />
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
