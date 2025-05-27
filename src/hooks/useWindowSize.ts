import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * خطاف لتتبع حجم النافذة
 * يستخدم لتحسين الأداء عند تغيير حجم النافذة
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // التأكد من أننا في بيئة المتصفح
    if (typeof window === 'undefined') {
      return;
    }

    // دالة لتحديث حجم النافذة
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // إضافة مستمع لتغيير حجم النافذة
    window.addEventListener('resize', handleResize);
    
    // استدعاء الدالة مرة واحدة للتأكد من القيم الأولية
    handleResize();
    
    // إزالة المستمع عند تفكيك المكون
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
