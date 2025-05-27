import React, { lazy, Suspense } from 'react';

/**
 * مكون لعرض حالة التحميل
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * دالة مساعدة للتحميل الكسول للمكونات
 * تستخدم React.lazy و Suspense لتحسين الأداء
 */
export const lazyLoad = (importFunc: () => Promise<any>, fallback: React.ReactNode = <LoadingSpinner />) => {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFunc();
      return { default: module.default };
    } catch (error) {
      console.error('خطأ في تحميل المكون:', error);
      return {
        default: () => (
          <div className="p-4 text-red-600 bg-red-100 rounded-md">
            حدث خطأ أثناء تحميل المكون
          </div>
        )
      };
    }
  });

  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * مكون لتحميل الصفحات بشكل كسول
 */
export const LazyPage = (importFunc: () => Promise<any>) => {
  return lazyLoad(importFunc, 
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">جاري تحميل الصفحة...</p>
    </div>
  );
};
