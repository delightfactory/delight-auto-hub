import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ShippingSummaryProps {
  subtotal: number;
  shippingCost: number;
  governorateName?: string;
  cityName?: string;
}

export default function ShippingSummary({ 
  subtotal, 
  shippingCost, 
  governorateName, 
  cityName 
}: ShippingSummaryProps) {
  // الدالة لتنسيق العملة بالجنيه المصري مع ضمان ظهور الأرقام باللغة الإنجليزية
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);

  // حساب الإجمالي مع الشحن
  const total = subtotal + shippingCost;
  
  // حالة للتحقق من أن البيانات تم تحميلها بشكل صحيح
  const [isLoaded, setIsLoaded] = useState(false);
  
  // التحقق من أن البيانات موجودة
  useEffect(() => {
    if (subtotal !== undefined) {
      setIsLoaded(true);
    }
  }, [subtotal]);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-base">ملخص الطلب</h3>
          {isLoaded ? (
            <Badge variant="outline" className="text-xs bg-gray-50">
              {cityName ? `الشحن إلى: ${cityName}` : 'لم يتم اختيار مدينة'}
            </Badge>
          ) : null}
        </div>
        
        {isLoaded ? (
          <>
            <div className="flex justify-between text-sm">
              <span>إجمالي المنتجات</span>
              <span dir="ltr" className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="flex flex-col">
                <span>رسوم الشحن</span>
                {cityName && governorateName && (
                  <span className="text-xs text-gray-500">
                    {`${governorateName} - ${cityName}`}
                  </span>
                )}
              </div>
              <span dir="ltr" className={shippingCost > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                {shippingCost > 0 ? formatCurrency(shippingCost) : 'مجاني'}
              </span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-bold">
              <span>الإجمالي</span>
              <span dir="ltr" className="text-primary">{formatCurrency(total)}</span>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-gray-500 text-sm">
            جاري تحميل ملخص الطلب...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
