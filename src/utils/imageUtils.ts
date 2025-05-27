/**
 * أدوات لتحسين تحميل الصور وتحويلها إلى WebP
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
}

/**
 * تحويل الصور إلى تنسيق WebP
 * @param url رابط الصورة الأصلية
 * @param options خيارات التحويل
 */
export const convertToWebP = (url: string, options: ImageOptions = {}): string => {
  if (!url) return '';
  
  // تجاهل الصور الخارجية
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  
  // تحويل الصورة إلى WebP
  const extension = url.split('.').pop() || '';
  const basePath = url.substring(0, url.lastIndexOf('.'));
  
  return `${basePath}.webp`;
};

/**
 * إنشاء مجموعة من الصور بأحجام مختلفة
 * @param url رابط الصورة الأصلية
 * @param widths مجموعة الأحجام المطلوبة
 */
export const generateResponsiveImages = (
  url: string,
  widths: number[] = [320, 480, 640, 768, 1024, 1280]
): string[] => {
  if (!url) return [];
  
  // تجاهل الصور الخارجية
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return [url];
  }
  
  // إنشاء مجموعة من الصور بأحجام مختلفة
  const extension = url.split('.').pop() || '';
  const basePath = url.substring(0, url.lastIndexOf('.'));
  
  return widths.map((width) => `${basePath}-${width}.${extension}`);
};

/**
 * إنشاء srcset للصور
 * @param url رابط الصورة الأصلية
 * @param widths مجموعة الأحجام المطلوبة
 */
export const generateSrcSet = (
  url: string,
  widths: number[] = [320, 480, 640, 768, 1024, 1280]
): string => {
  if (!url) return '';
  
  // تجاهل الصور الخارجية
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  
  // إنشاء srcset
  const extension = url.split('.').pop() || '';
  const basePath = url.substring(0, url.lastIndexOf('.'));
  
  return widths
    .map((width) => `${basePath}-${width}.${extension} ${width}w`)
    .join(', ');
};

/**
 * إنشاء srcset للصور بتنسيق WebP
 * @param url رابط الصورة الأصلية
 * @param widths مجموعة الأحجام المطلوبة
 */
export const generateWebPSrcSet = (
  url: string,
  widths: number[] = [320, 480, 640, 768, 1024, 1280]
): string => {
  if (!url) return '';
  
  // تجاهل الصور الخارجية
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  
  // إنشاء srcset بتنسيق WebP
  const basePath = url.substring(0, url.lastIndexOf('.'));
  
  return widths
    .map((width) => `${basePath}-${width}.webp ${width}w`)
    .join(', ');
};

/**
 * تحديد ما إذا كان المتصفح يدعم تنسيق WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = () => resolve(true);
    webP.onerror = () => resolve(false);
    webP.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  });
};

/**
 * تحميل الصور مسبقًا
 * @param urls روابط الصور المراد تحميلها مسبقًا
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};
