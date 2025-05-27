/**
 * ملف تكوين لتحسين الصور
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
}

/**
 * دالة لتحسين الصور وإضافة معلمات التحسين
 */
export const imageOptimization = (url: string, options: ImageOptimizationOptions = {}) => {
  if (!url) return '';

  // إذا كانت الصورة من مصدر خارجي أو من رابط كامل
  if (url.startsWith('http') || url.startsWith('blob:')) {
    return url;
  }

  // إذا كانت الصورة من مجلد public
  if (url.startsWith('/')) {
    // إضافة معلمات التحسين
    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('fm', options.format);
    
    const queryString = params.toString();
    
    return queryString ? `${url}?${queryString}` : url;
  }

  return url;
};

/**
 * دالة لتحويل الصور إلى تنسيق WebP مع دعم المتصفحات القديمة
 */
export const getSrcSet = (url: string, widths: number[] = [640, 750, 828, 1080, 1200]) => {
  if (!url) return '';
  
  // إذا كانت الصورة من مصدر خارجي
  if (url.startsWith('http') || url.startsWith('blob:')) {
    return url;
  }
  
  return widths
    .map((width) => {
      const optimizedUrl = imageOptimization(url, { width, format: 'webp' });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * دالة لتوفير صورة بديلة للمتصفحات التي لا تدعم WebP
 */
export const getFallbackSrc = (url: string, width: number = 800) => {
  if (!url) return '';
  return imageOptimization(url, { width, format: 'jpeg', quality: 80 });
};
