import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductDataService } from '@/services/productDataService';
import { Button } from '@/components/ui/button';

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

  return (
    <>
      {/* PageHeader تمت إزالته */}
      <section className="py-16">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-delight-600 mb-4" />
              <p className="text-lg font-medium">جارِ تحميل العروض...</p>
            </div>
          ) : bestDeals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestDeals.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold mb-4">لا توجد صفقات متاحة</p>
              <Button onClick={() => window.location.reload()} variant="outline">تحديث</Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BestDealsPage;
