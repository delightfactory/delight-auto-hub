/**
 * أدوات تحسين الصور وتحميلها بكفاءة
 * يوفر هذا الملف مجموعة من الأدوات لتحسين أداء الصور وتقليل وقت التحميل
 */

import { compressImage } from './compression';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  blur?: boolean; // إظهار نسخة ضبابية أثناء التحميل
  placeholder?: boolean; // إظهار صورة مؤقتة أثناء التحميل
  priority?: boolean; // تحميل الصورة بأولوية عالية
}

/**
 * تحويل الصور إلى تنسيق WebP مع دعم المتصفحات القديمة
 * @param url رابط الصورة الأصلية
 * @param options خيارات التحسين
 */
export const optimizeImage = async (url: string, options: ImageOptimizationOptions = {}): Promise<string> => {
  if (!url) return '';

  // إذا كانت الصورة مضغوطة مسبقًا (تبدأ بـ data:)
  if (url.startsWith('data:')) {
    return url;
  }

  // التعامل مع الصور الخارجية
  if (url.startsWith('http') || url.startsWith('blob:')) {
    try {
      // ضغط الصور الخارجية إذا كان ممكنًا
      const quality = options.quality || 0.8;
      const compressed = await compressImage(url, quality);
      return compressed;
    } catch (error) {
      console.error('فشل ضغط الصورة الخارجية:', error);
      return url;
    }
  }

  // إضافة معلمات التحسين للصور المحلية
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  
  // استخدام WebP إذا كان مدعومًا
  const isWebPSupported = await supportsWebP();
  const format = options.format || (isWebPSupported ? 'webp' : 'jpeg');
  params.append('fm', format);
  
  const queryString = params.toString();
  
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * إنشاء مجموعة من الصور بأحجام مختلفة للشاشات المختلفة
 * @param url رابط الصورة الأصلية
 * @param widths مجموعة الأحجام المطلوبة
 * @param options خيارات التحسين
 */
export const generateSrcSet = async (url: string, widths: number[] = [320, 480, 640, 768, 1024, 1280], options: ImageOptimizationOptions = {}) => {
  if (!url) return '';
  
  // التحقق من دعم WebP
  const isWebPSupported = await supportsWebP();
  const format = options.format || (isWebPSupported ? 'webp' : 'jpeg');
  const quality = options.quality || 0.8;
  
  // توليد مجموعة الصور بأحجام مختلفة
  const srcSetPromises = widths.map(async (width) => {
    const optimizedUrl = await optimizeImage(url, { width, format, quality });
    return `${optimizedUrl} ${width}w`;
  });
  
  const srcSetArray = await Promise.all(srcSetPromises);
  return srcSetArray.join(', ');
};

/**
 * توليد صورة ضبابية مصغرة للتحميل السريع
 * @param url رابط الصورة الأصلية
 * @param size حجم الصورة المصغرة
 */
export const generateBlurPlaceholder = async (url: string, size: number = 10): Promise<string> => {
  if (!url) return '';
  
  try {
    // إنشاء صورة مصغرة جدًا بجودة منخفضة
    return await compressImage(url, 0.1);
  } catch (error) {
    console.error('فشل إنشاء صورة ضبابية مصغرة:', error);
    return '';
  }
};

/**
 * تحسين أداء الصور باستخدام تقنية التحميل التدريجي
 * @param url رابط الصورة الأصلية
 */
export const createProgressiveImage = async (url: string): Promise<{ placeholder: string; full: string }> => {
  if (!url) return { placeholder: '', full: '' };
  
  try {
    // إنشاء صورة مصغرة للتحميل السريع
    const placeholder = await generateBlurPlaceholder(url);
    
    // تحسين الصورة الأصلية
    const full = await optimizeImage(url, { quality: 0.8 });
    
    return { placeholder, full };
  } catch (error) {
    console.error('فشل إنشاء صورة تدريجية:', error);
    return { placeholder: '', full: url };
  }
};

/**
 * تحسين أداء الصور في القوائم
 * @param urls قائمة بروابط الصور
 * @param options خيارات التحسين
 */
export const optimizeImageList = async (urls: string[], options: ImageOptimizationOptions = {}): Promise<string[]> => {
  if (!urls || urls.length === 0) return [];
  
  // تحسين كل صورة على حدة
  const optimizedUrls = await Promise.all(
    urls.map(url => optimizeImage(url, options))
  );
  
  return optimizedUrls;
};

/**
 * تحديد الحجم المناسب للصورة بناءً على حجم الشاشة
 * @param widths مجموعة الأحجام المتاحة
 */
export const generateSizes = (sizes: string[] = ['(max-width: 640px) 100vw', '50vw']) => {
  return sizes.join(', ');
};

/**
 * تحميل الصور مسبقًا لتحسين تجربة المستخدم
 * @param urls روابط الصور المراد تحميلها مسبقًا
 */
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * تحديد ما إذا كان المتصفح يدعم تنسيق WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = () => resolve(true);
    webP.onerror = () => resolve(false);
    webP.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  });
};

/**
 * الحصول على تنسيق الصورة المناسب بناءً على دعم المتصفح
 */
export const getOptimalFormat = async (): Promise<'webp' | 'jpeg'> => {
  const isWebPSupported = await supportsWebP();
  return isWebPSupported ? 'webp' : 'jpeg';
};
