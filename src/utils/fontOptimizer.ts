/**
 * أدوات لتحسين تحميل الخطوط وتقليل تأثير CLS (تغير تخطيط الصفحة)
 */

/**
 * تحميل الخطوط بشكل مسبق
 * @param fontUrls قائمة بروابط الخطوط
 */
export const preloadFonts = (fontUrls: string[]): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * تحميل الخطوط بشكل غير متزامن
 * @param fontUrls قائمة بروابط الخطوط
 */
export const loadFontsAsync = (fontUrls: string[]): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // استخدام Font Loading API إذا كانت متوفرة
  if ('fonts' in document) {
    fontUrls.forEach(url => {
      // إنشاء عنصر style لتعريف الخط
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'AsyncFont';
          src: url('${url}') format('woff2');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);

      // تحميل الخط باستخدام Font Loading API
      document.fonts.load('1em AsyncFont').then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    });
  } else {
    // استخدام طريقة بديلة إذا كانت Font Loading API غير متوفرة
    fontUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

/**
 * تحميل الخطوط عند الحاجة فقط
 * @param fontUrls قائمة بروابط الخطوط
 */
export const loadFontsOnDemand = (fontUrls: string[]): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // تحميل الخطوط عندما يكون المتصفح غير مشغول
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      loadFontsAsync(fontUrls);
    });
  } else {
    // للمتصفحات التي لا تدعم requestIdleCallback
    setTimeout(() => {
      loadFontsAsync(fontUrls);
    }, 1000);
  }
};

/**
 * إضافة CSS لتجنب تغير تخطيط الصفحة (CLS) أثناء تحميل الخطوط
 */
export const addFontFaceObserverStyles = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    /* تطبيق خطوط النظام حتى يتم تحميل الخطوط المخصصة */
    .fonts-loading {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
    
    /* تطبيق الخطوط المخصصة بعد تحميلها */
    .fonts-loaded {
      font-family: 'CustomFont', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
    
    /* منع تغير تخطيط الصفحة عن طريق تعيين أبعاد ثابتة للنص */
    .prevent-cls {
      font-size-adjust: 0.5;
      max-height: 999999px;
    }
  `;
  document.head.appendChild(style);
  
  // إضافة فئة fonts-loading إلى عنصر HTML
  document.documentElement.classList.add('fonts-loading');
};

/**
 * استخدام خطوط النظام المحلية بدلاً من تحميل خطوط خارجية
 * هذا يحسن الأداء بشكل كبير ويقلل من تغير تخطيط الصفحة
 */
export const useSystemFonts = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
  `;
  document.head.appendChild(style);
};

/**
 * تهيئة تحسينات الخطوط
 * @param options خيارات التهيئة
 */
export const initFontOptimizations = (options: {
  preload?: boolean;
  useSystemFonts?: boolean;
  preventCLS?: boolean;
  fontUrls?: string[];
} = {}): void => {
  const {
    preload = true,
    useSystemFonts: useSystemFontsOption = false,
    preventCLS = true,
    fontUrls = []
  } = options;

  // استخدام خطوط النظام إذا تم تحديد ذلك
  if (useSystemFontsOption) {
    useSystemFonts();
    return;
  }

  // إضافة أنماط لمنع تغير تخطيط الصفحة
  if (preventCLS) {
    addFontFaceObserverStyles();
  }

  // تحميل الخطوط بشكل مسبق إذا تم تحديد ذلك
  if (preload && fontUrls.length > 0) {
    preloadFonts(fontUrls);
  }

  // تحميل الخطوط عند الحاجة
  loadFontsOnDemand(fontUrls);
};
