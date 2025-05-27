import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductDataService } from '@/services/productDataService';
import { Button } from '@/components/ui/button';
import { VirtualizedProductGrid } from '@/components/performance/VirtualizedProductGrid';
import { SmoothPageTransition } from '@/components/performance/SmoothPageTransition';
import { useNavigate } from 'react-router-dom';

// تم إزالة PageHeader لتوفير مساحة عرض

const BestDealsPage: React.FC = () => {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: ProductDataService.getAllProducts,
  });

  const bestDeals = useMemo(() => {
    const parse = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
    return products
      .filter(product => {
        if (!product.originalPrice) return false;
        const orig = parse(product.originalPrice);
        const curr = parse(product.price);
        return !isNaN(orig) && (orig - curr) / orig > 0.25;
      })
      .sort((a, b) => {
        const discountA = (parse(a.originalPrice!) - parse(a.price)) / parse(a.originalPrice!);
        const discountB = (parse(b.originalPrice!) - parse(b.price)) / parse(b.originalPrice!);
        return discountB - discountA;
      });
  }, [products]);

  if (error) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">حدث خطأ في تحميل الصفقات</h2>
          <p className="text-gray-600 mb-8">يرجى المحاولة مرة أخرى لاحقاً</p>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  
  // استخدام useCallback لتحسين الأداء
  const handleProductClick = useCallback((product) => {
    navigate(`/products/${product.id}`);
  }, [navigate]);

  return (
    <SmoothPageTransition transitionType="fade" duration={0.3}> {/* تقليل مدة الانتقال لتحسين الأداء */}
      <section className="py-16">
        <div className="container-custom" style={{ overflowX: 'hidden' }}> {/* منع التمرير الأفقي */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-delight-600 mb-4" />
              <p className="text-lg font-medium">جارِ تحميل العروض...</p>
            </div>
          ) : bestDeals.length > 0 ? (
            <VirtualizedProductGrid 
              products={bestDeals.map(product => ({
                ...product,
                // التأكد من أن السعر رقم لتجنب أخطاء التحويل
                price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : product.price
              }))} 
              columns={{
                default: 2, // عرض 2 منتجين في الصف على الأجهزة الصغيرة
                sm: 2,
                md: 3,
                lg: 4
              }}
              gap={4} // زيادة المسافة بين العناصر قليلاً لتحسين المظهر
              estimateSize={320} // تعديل الحجم التقديري للعناصر
              onProductClick={handleProductClick}
              className="mb-8"
              useWindowScroll={true} // استخدام تمرير النافذة بدلاً من التمرير الداخلي
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold mb-4">لا توجد صفقات متاحة</p>
              <Button onClick={() => window.location.reload()} variant="outline">تحديث</Button>
            </div>
          )}
        </div>
      </section>
    </SmoothPageTransition>
  );
};

export default BestDealsPage;
