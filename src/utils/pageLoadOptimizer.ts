/**
 * أدوات لتحسين تحميل الصفحات وتقليل وقت التحميل الأولي
 */

/**
 * تحميل المكونات والموارد بشكل كسول
 */
export const lazyLoadResources = () => {
  if (typeof window === 'undefined') return;

  // تأجيل تحميل الصور غير المرئية
  const lazyLoadImages = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // استخدام خاصية loading="lazy" المدمجة في المتصفح
      document.querySelectorAll('img[data-src]').forEach(img => {
        if (img instanceof HTMLImageElement) {
          img.src = img.dataset.src || '';
          img.loading = 'lazy';
          img.removeAttribute('data-src');
        }
      });
    } else {
      // استخدام Intersection Observer للمتصفحات القديمة
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  };

  // تأجيل تحميل الخطوط
  const lazyLoadFonts = () => {
    // تحميل الخطوط بعد تحميل المحتوى الأساسي
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(() => {
        document.querySelectorAll('link[data-font]').forEach(link => {
          if (link instanceof HTMLLinkElement) {
            link.href = link.dataset.font || '';
            link.removeAttribute('data-font');
          }
        });
      });
    } else {
      // للمتصفحات التي لا تدعم requestIdleCallback
      setTimeout(() => {
        document.querySelectorAll('link[data-font]').forEach(link => {
          if (link instanceof HTMLLinkElement) {
            link.href = link.dataset.font || '';
            link.removeAttribute('data-font');
          }
        });
      }, 2000);
    }
  };

  // تأجيل تحميل الأكواد غير الضرورية
  const lazyLoadScripts = () => {
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(() => {
        document.querySelectorAll('script[data-src]').forEach(script => {
          if (script instanceof HTMLScriptElement) {
            script.src = script.dataset.src || '';
            script.removeAttribute('data-src');
          }
        });
      });
    } else {
      // للمتصفحات التي لا تدعم requestIdleCallback
      setTimeout(() => {
        document.querySelectorAll('script[data-src]').forEach(script => {
          if (script instanceof HTMLScriptElement) {
            script.src = script.dataset.src || '';
            script.removeAttribute('data-src');
          }
        });
      }, 2000);
    }
  };

  // تنفيذ التحميل الكسول
  if (document.readyState === 'complete') {
    lazyLoadImages();
    lazyLoadFonts();
    lazyLoadScripts();
  } else {
    window.addEventListener('load', () => {
      lazyLoadImages();
      lazyLoadFonts();
      lazyLoadScripts();
    });
  }
};

/**
 * تحميل مسبق للصفحات الشائعة
 * @param routes قائمة المسارات المراد تحميلها مسبقًا
 */
export const prefetchRoutes = (routes: string[]) => {
  if (typeof window === 'undefined') return;

  // تحميل مسبق للصفحات عندما يكون المتصفح غير مشغول
  if ('requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
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
        link.as = 'document';
        document.head.appendChild(link);
      });
    }, 2000);
  }
};

/**
 * تحميل مسبق للصور الهامة
 * @param imageUrls قائمة روابط الصور المراد تحميلها مسبقًا
 */
export const prefetchImages = (imageUrls: string[]) => {
  if (typeof window === 'undefined') return;

  // تحميل مسبق للصور عندما يكون المتصفح غير مشغول
  if ('requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback(() => {
      imageUrls.forEach(imageUrl => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = imageUrl;
        link.as = 'image';
        document.head.appendChild(link);
      });
    });
  } else {
    // للمتصفحات التي لا تدعم requestIdleCallback
    setTimeout(() => {
      imageUrls.forEach(imageUrl => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = imageUrl;
        link.as = 'image';
        document.head.appendChild(link);
      });
    }, 2000);
  }
};

/**
 * قياس أداء تحميل الصفحة
 */
export const measurePagePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return null;

  const performanceMetrics = {
    // وقت تحميل الصفحة
    pageLoadTime: 0,
    // وقت تحميل الموارد
    resourceLoadTime: 0,
    // وقت تنفيذ JavaScript
    scriptExecutionTime: 0,
    // وقت تصيير الصفحة
    renderTime: 0,
  };

  // قياس وقت تحميل الصفحة
  window.addEventListener('load', () => {
    if (window.performance.timing) {
      const timing = window.performance.timing;
      
      // وقت تحميل الصفحة
      performanceMetrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      
      // وقت تحميل الموارد
      performanceMetrics.resourceLoadTime = timing.responseEnd - timing.requestStart;
      
      // وقت تنفيذ JavaScript
      performanceMetrics.scriptExecutionTime = timing.domComplete - timing.domInteractive;
      
      // وقت تصيير الصفحة
      performanceMetrics.renderTime = timing.domComplete - timing.domLoading;
      
      // طباعة المقاييس في وحدة التحكم
      console.log('مقاييس الأداء:', performanceMetrics);
    }
  });

  return performanceMetrics;
};

/**
 * تحسين تحميل الصفحة
 */
export const optimizePageLoad = () => {
  // تحميل الموارد بشكل كسول
  lazyLoadResources();
  
  // قياس أداء تحميل الصفحة
  measurePagePerformance();
  
  // تحميل مسبق للصفحات الشائعة
  prefetchRoutes([
    '/',
    '/products',
    '/about',
    '/contact',
  ]);
};
