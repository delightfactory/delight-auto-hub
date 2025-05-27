/**
 * أداة لتحسين تحميل الخطوط وتطبيق تقنية Font Loading API
 */

interface FontConfig {
  family: string;
  weights?: number[];
  styles?: ('normal' | 'italic')[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

/**
 * التحقق من وجود document (للتوافق مع SSR)
 */
const isDocumentDefined = (): boolean => {
  return typeof document !== 'undefined';
};

/**
 * الحصول على عنصر documentElement بشكل آمن
 */
const getDocumentElement = (): HTMLElement | null => {
  if (!isDocumentDefined()) return null;
  return document.documentElement;
};

/**
 * إضافة فئة CSS إلى عنصر documentElement
 */
const addClassToHtml = (className: string): void => {
  const docElement = getDocumentElement();
  if (docElement) {
    docElement.classList.add(className);
  }
};

/**
 * تحميل الخطوط بشكل محسن
 * @param fonts قائمة الخطوط المراد تحميلها
 */
export const loadFonts = async (fonts: FontConfig[]): Promise<void> => {
  // التحقق من دعم Font Loading API
  if (isDocumentDefined() && 'fonts' in document) {
    try {
      // تحميل كل خط
      const fontPromises = fonts.map(async (font) => {
        const { family, weights = [400], styles = ['normal'], display = 'swap' } = font;
        
        // تحميل كل وزن وأسلوب للخط
        const fontFacePromises = weights.flatMap((weight) =>
          styles.map(async (style) => {
            try {
              // إنشاء كائن FontFace
              const fontFace = new FontFace(family, `url(https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=${display})`, {
                weight: weight.toString(),
                style,
                display,
              });
              
              // تحميل الخط
              const loadedFont = await fontFace.load();
              
              // إضافة الخط إلى مجموعة الخطوط
              document.fonts.add(loadedFont);
              
              return loadedFont;
            } catch (error) {
              console.error(`فشل تحميل الخط ${family} بوزن ${weight} وأسلوب ${style}:`, error);
              return null;
            }
          })
        );
        
        // انتظار تحميل جميع الأوزان والأساليب
        return Promise.all(fontFacePromises);
      });
      
      // انتظار تحميل جميع الخطوط
      await Promise.all(fontPromises);
      
      // إضافة فئة CSS للإشارة إلى اكتمال تحميل الخطوط
      addClassToHtml('fonts-loaded');
      
      console.log('تم تحميل جميع الخطوط بنجاح');
    } catch (error) {
      console.error('فشل تحميل الخطوط:', error);
      
      // إضافة فئة CSS للإشارة إلى فشل تحميل الخطوط
      addClassToHtml('fonts-failed');
    }
  } else {
    console.warn('متصفحك لا يدعم Font Loading API');
    
    // إضافة فئة CSS للإشارة إلى عدم دعم Font Loading API
    addClassToHtml('fonts-not-supported');
  }
};

/**
 * تحميل خط Cairo العربي
 */
export const loadArabicFonts = async (): Promise<void> => {
  return loadFonts([
    {
      family: 'Cairo',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      display: 'swap',
    },
  ]);
};

/**
 * إضافة رابط preload للخطوط
 * @param family اسم الخط
 * @param weights أوزان الخط
 */
export const preloadFont = (family: string, weights: number[] = [400]): void => {
  if (!isDocumentDefined()) return;
  
  weights.forEach((weight) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
    link.as = 'style';
    document.head.appendChild(link);
  });
};
