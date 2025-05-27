import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * خطاف لتأخير قيمة متغيرة
 * مفيد لتقليل عدد عمليات إعادة التصيير عند تغير القيمة بشكل متكرر
 * @param value القيمة المراد تأخيرها
 * @param delay مدة التأخير بالمللي ثانية
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * خطاف لتنفيذ عملية بعد تأخير
 * مفيد لتأخير البحث أو التحقق من صحة البيانات
 * @param callback الدالة المراد تنفيذها
 * @param delay مدة التأخير بالمللي ثانية
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  // تحديث مرجع الدالة عند تغيرها
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // دالة مؤخرة
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // دالة لإلغاء التأخير
  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // إلغاء التأخير عند إزالة المكون
  useEffect(() => {
    return cancelDebounce;
  }, [cancelDebounce]);

  return [debouncedCallback, cancelDebounce];
}

/**
 * خطاف لتنفيذ عملية بعد فترة زمنية محددة
 * مفيد للعمليات التي تحدث بشكل متكرر مثل التمرير أو تغيير حجم النافذة
 * @param callback الدالة المراد تنفيذها
 * @param delay الفترة الزمنية بين كل تنفيذ بالمللي ثانية
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  // تحديث مرجع الدالة عند تغيرها
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastRun.current;

      const runCallback = () => {
        lastRun.current = Date.now();
        callbackRef.current(...args);
      };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (elapsed >= delay) {
        runCallback();
      } else {
        timeoutRef.current = setTimeout(runCallback, delay - elapsed);
      }
    },
    [delay]
  );
}

/**
 * خطاف لمراقبة تقاطع عنصر مع نافذة العرض
 * مفيد للتحميل الكسول للصور والمحتوى
 * @param options خيارات مراقبة التقاطع
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = {}
): [React.RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [ref, isIntersecting, entry];
}

/**
 * خطاف لتخزين القيم في ذاكرة التخزين المحلية
 * مع الحفاظ على التزامن بين علامات التبويب المختلفة
 * @param key مفتاح التخزين
 * @param initialValue القيمة الأولية
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // دالة لاستعادة القيمة من التخزين المحلي
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`خطأ في قراءة قيمة التخزين المحلي [${key}]:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // حالة القيمة المخزنة
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // دالة لتحديث القيمة في التخزين المحلي
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(`محاولة تعيين قيمة التخزين المحلي [${key}] أثناء تصيير الخادم`);
        return;
      }

      try {
        // السماح بالقيمة أن تكون دالة
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // حفظ القيمة في الحالة
        setStoredValue(valueToStore);
        
        // حفظ القيمة في التخزين المحلي
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // إرسال حدث لإعلام النوافذ الأخرى
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) }));
      } catch (error) {
        console.warn(`خطأ في تعيين قيمة التخزين المحلي [${key}]:`, error);
      }
    },
    [key, storedValue]
  );

  // الاستماع لتغييرات التخزين من النوافذ الأخرى
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

/**
 * خطاف لتتبع حجم النافذة
 * مفيد للتصميم المتجاوب
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, 200);

  useEffect(() => {
    // تعيين الحجم الأولي
    handleResize();
    
    // إضافة مستمع الحدث
    window.addEventListener('resize', handleResize);
    
    // إزالة مستمع الحدث عند إزالة المكون
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
}

/**
 * خطاف لتحسين الأداء عند التعامل مع قوائم كبيرة
 * يقوم بتقسيم العمليات الثقيلة إلى أجزاء صغيرة
 * @param items العناصر المراد معالجتها
 * @param batchSize حجم الدفعة
 * @param callback دالة المعالجة
 */
export function useBatchProcessing<T, R>(
  items: T[],
  batchSize: number,
  callback: (item: T) => R
): {
  processedItems: R[];
  isProcessing: boolean;
  progress: number;
  startProcessing: () => void;
  pauseProcessing: () => void;
  resetProcessing: () => void;
} {
  const [processedItems, setProcessedItems] = useState<R[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // حساب نسبة التقدم
  const progress = useMemo(() => {
    return items.length > 0 ? (currentIndex / items.length) * 100 : 0;
  }, [currentIndex, items.length]);

  // معالجة دفعة من العناصر
  const processBatch = useCallback(() => {
    if (!isProcessing || currentIndex >= items.length) {
      setIsProcessing(false);
      return;
    }

    const endIndex = Math.min(currentIndex + batchSize, items.length);
    const batch = items.slice(currentIndex, endIndex);
    const processed = batch.map(callback);

    setProcessedItems((prev) => [...prev, ...processed]);
    setCurrentIndex(endIndex);

    if (endIndex < items.length) {
      timeoutRef.current = setTimeout(processBatch, 0);
    } else {
      setIsProcessing(false);
    }
  }, [isProcessing, currentIndex, items, batchSize, callback]);

  // بدء المعالجة
  const startProcessing = useCallback(() => {
    if (!isProcessing) {
      setIsProcessing(true);
    }
  }, [isProcessing]);

  // إيقاف المعالجة مؤقتًا
  const pauseProcessing = useCallback(() => {
    setIsProcessing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // إعادة تعيين المعالجة
  const resetProcessing = useCallback(() => {
    pauseProcessing();
    setProcessedItems([]);
    setCurrentIndex(0);
  }, [pauseProcessing]);

  // بدء المعالجة عند تغيير حالة المعالجة
  useEffect(() => {
    if (isProcessing) {
      processBatch();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isProcessing, processBatch]);

  // إعادة تعيين المعالجة عند تغيير العناصر
  useEffect(() => {
    resetProcessing();
  }, [items, resetProcessing]);

  return {
    processedItems,
    isProcessing,
    progress,
    startProcessing,
    pauseProcessing,
    resetProcessing,
  };
}

/**
 * خطاف لتأخير تحميل المكونات الثقيلة
 * @param ComponentToLoad المكون المراد تحميله
 * @param delay مدة التأخير بالمللي ثانية
 * @param fallback مكون بديل يظهر أثناء التحميل
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  ComponentToLoad: T,
  delay: number = 0,
  fallback: React.ReactNode = null
): {
  Component: React.ComponentType<React.ComponentProps<T>>;
  isLoaded: boolean;
} {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const LazyComponent = useCallback(
    (props: React.ComponentProps<T>) => {
      if (isLoaded) {
        return React.createElement(ComponentToLoad, props);
      }
      return React.createElement(React.Fragment, null, fallback);
    },
    [ComponentToLoad, isLoaded, fallback]
  );

  return { Component: LazyComponent, isLoaded };
}

/**
 * خطاف لتحسين أداء الأحداث المتكررة مثل التمرير
 */
export function useOptimizedScroll(): {
  scrollY: number;
  scrollX: number;
  scrollDirection: 'up' | 'down' | 'none';
} {
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'none'>('none');
  const lastScrollY = useRef(0);

  const handleScroll = useThrottle(() => {
    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    
    setScrollY(currentScrollY);
    setScrollX(currentScrollX);
    
    if (currentScrollY > lastScrollY.current) {
      setScrollDirection('down');
    } else if (currentScrollY < lastScrollY.current) {
      setScrollDirection('up');
    }
    
    lastScrollY.current = currentScrollY;
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { scrollY, scrollX, scrollDirection };
}

/**
 * خطاف لتحسين أداء الرسوم المتحركة باستخدام requestAnimationFrame
 * @param callback دالة التحديث
 * @param dependencies مصفوفة التبعيات
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  dependencies: React.DependencyList = []
): void {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
