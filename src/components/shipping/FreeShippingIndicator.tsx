import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Truck } from 'lucide-react';

interface FreeShippingIndicatorProps {
  currentTotal: number;
  threshold: number;
}

/**
 * مكون مؤشر الشحن المجاني - يعرض شريط تقدم يوضح مدى اقتراب المستخدم من الحصول على شحن مجاني
 */
export default function FreeShippingIndicator({ currentTotal, threshold }: FreeShippingIndicatorProps) {
  // حساب نسبة التقدم نحو الشحن المجاني
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const isFreeShipping = currentTotal >= threshold;
  
  // تنسيق العملة مع ضمان ظهور الأرقام باللغة الإنجليزية
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);
  
  return (
    <div className="bg-white p-4 md:p-5 rounded-lg md:rounded-xl shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
          <Truck className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>الشحن المجاني</span>
        </div>
        <span className="text-xs md:text-sm" dir="ltr">
          {isFreeShipping 
            ? 'مؤهل للشحن المجاني' 
            : `أضف ${formatCurrency(threshold - currentTotal)} للحصول على شحن مجاني`}
        </span>
      </div>
      <Progress value={progress} className={`h-1.5 md:h-2 ${isFreeShipping ? 'bg-green-100' : 'bg-gray-100'}`} />
      {isFreeShipping && (
        <div className="text-xs text-green-600 font-medium mt-1 text-center">
          تهانينا! أنت مؤهل للحصول على شحن مجاني
        </div>
      )}
    </div>
  );
}
