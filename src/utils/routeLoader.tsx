import React, { Suspense, lazy } from 'react';

/**
 * مكون لعرض حالة التحميل
 */
export const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600">جاري تحميل الصفحة...</p>
  </div>
);

/**
 * دالة لتحميل الصفحات بشكل كسول
 * تستخدم React.lazy و Suspense لتحسين الأداء
 */
export const lazyLoadPage = (importFunc: () => Promise<any>) => {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFunc();
      return { default: module.default };
    } catch (error) {
      console.error('خطأ في تحميل الصفحة:', error);
      return {
        default: () => (
          <div className="p-8 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">حدث خطأ أثناء تحميل الصفحة</p>
              <p>يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              تحديث الصفحة
            </button>
          </div>
        )
      };
    }
  });

  return (props: any) => (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * تحميل مسبق للصفحات الشائعة
 * يساعد في تحسين تجربة المستخدم عند التنقل
 */
export const preloadRoutes = (routes: string[]) => {
  // تنفيذ التحميل المسبق عندما يكون المتصفح غير مشغول
  if ('requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'script';
        document.head.appendChild(link);
      });
    });
  } else {
    // للمتصفحات التي لا تدعم requestIdleCallback
    setTimeout(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'script';
        document.head.appendChild(link);
      });
    }, 2000);
  }
};
