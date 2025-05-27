/**
 * مجموعة من الأدوات لتحسين أداء التمرير في التطبيق
 */

/**
 * تحسين أداء التمرير عن طريق تقليل عدد عمليات إعادة الرسم
 * @param element العنصر المراد تحسين التمرير فيه
 */
export function optimizeScroll(element: HTMLElement | null): void {
  if (!element) return;
  
  // إضافة خصائص CSS لتحسين أداء التمرير
  element.style.willChange = 'transform';
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  
  // تفعيل تسريع GPU للتمرير على الأجهزة المحمولة
  if ('webkitOverflowScrolling' in document.documentElement.style) {
    (element.style as any).webkitOverflowScrolling = 'touch';
  }
}

/**
 * إيقاف التمرير المتسلسل (Passive Scroll) لتحسين الأداء
 * @param element العنصر المراد تطبيق التمرير المتسلسل عليه
 */
export function applyPassiveScroll(element: HTMLElement | null): () => void {
  if (!element) return () => {};
  
  const options = { passive: true };
  let isScrolling = false;
  let scrollTimeout: number | null = null;
  
  const handleScroll = () => {
    isScrolling = true;
    
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = window.setTimeout(() => {
      isScrolling = false;
    }, 150) as unknown as number;
  };
  
  element.addEventListener('scroll', handleScroll, options);
  
  // إرجاع دالة لإزالة المستمع
  return () => {
    element.removeEventListener('scroll', handleScroll);
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }
  };
}

/**
 * تحسين أداء التمرير عن طريق تقليل عدد عمليات إعادة الرسم أثناء التمرير
 * @param element العنصر المراد تحسين التمرير فيه
 * @param callback الدالة التي يتم استدعاؤها عند التمرير
 */
export function optimizeScrollWithCallback(
  element: HTMLElement | null,
  callback: () => void
): () => void {
  if (!element) return () => {};
  
  optimizeScroll(element);
  
  const options = { passive: true };
  let isScrolling = false;
  let scrollTimeout: number | null = null;
  let lastScrollTop = 0;
  let scrollDistance = 0;
  
  const handleScroll = () => {
    if (!isScrolling) {
      lastScrollTop = element.scrollTop;
      isScrolling = true;
      
      // استدعاء requestAnimationFrame لتحسين الأداء
      window.requestAnimationFrame(() => {
        scrollDistance = Math.abs(element.scrollTop - lastScrollTop);
        
        // استدعاء الدالة فقط إذا كانت مسافة التمرير كبيرة بما يكفي
        if (scrollDistance > 50) {
          callback();
          lastScrollTop = element.scrollTop;
        }
        
        isScrolling = false;
      });
    }
    
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = window.setTimeout(() => {
      callback();
    }, 150) as unknown as number;
  };
  
  element.addEventListener('scroll', handleScroll, options);
  
  // إرجاع دالة لإزالة المستمع
  return () => {
    element.removeEventListener('scroll', handleScroll);
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }
  };
}
