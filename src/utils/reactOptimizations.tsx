import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';

/**
 * دالة لإنشاء مكون محسن باستخدام React.memo
 * @param Component المكون المراد تحسينه
 * @param propsAreEqual دالة للتحقق من تساوي الخصائص
 */
export function createMemoComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return React.memo(Component, propsAreEqual);
}

/**
 * Hook لتحسين الدوال باستخدام useCallback
 * @param callback الدالة المراد تحسينها
 * @param dependencies قائمة التبعيات
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList = []
): T {
  return useCallback(callback, dependencies);
}

/**
 * Hook لتحسين القيم المحسوبة باستخدام useMemo
 * @param factory دالة لإنشاء القيمة المحسوبة
 * @param dependencies قائمة التبعيات
 */
export function useStableMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList = []
): T {
  return useMemo(factory, dependencies);
}

/**
 * Hook لتحسين الحالة باستخدام useState و useCallback
 * @param initialState الحالة الأولية
 */
export function useStableState<S>(initialState: S | (() => S)) {
  const [state, setState] = useState<S>(initialState);
  
  const setStableState = useCallback((value: React.SetStateAction<S>) => {
    setState(value);
  }, []);
  
  return [state, setStableState] as const;
}

/**
 * Hook لتحسين الأداء عند التعامل مع الأحداث المتكررة
 * @param callback الدالة المراد تنفيذها
 * @param delay مدة التأخير بالمللي ثانية
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<number | null>(null);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Hook لتحسين الأداء عند التعامل مع الأحداث المتكررة
 * ينفذ الدالة فورًا ثم ينتظر المدة المحددة قبل تنفيذها مرة أخرى
 * @param callback الدالة المراد تنفيذها
 * @param delay مدة التأخير بالمللي ثانية
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<number | null>(null);
  const lastExecutedRef = useRef<number>(0);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecutedRef.current;
      
      if (timeSinceLastExecution >= delay) {
        lastExecutedRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = window.setTimeout(() => {
          lastExecutedRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastExecution);
      }
    },
    [callback, delay]
  );
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

/**
 * Hook لتحسين الأداء عند التعامل مع قوائم كبيرة
 * @param items العناصر المراد عرضها
 * @param itemHeight ارتفاع العنصر
 * @param visibleItems عدد العناصر المرئية
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  visibleItems: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + visibleItems * itemHeight) / itemHeight)
  );
  
  const visibleList = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);
  
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);
  
  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    []
  );
  
  return {
    visibleList,
    totalHeight,
    onScroll,
    startIndex,
    endIndex,
  };
}
