import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';

/**
 * مكون محسن باستخدام React.memo
 * يمنع إعادة التصيير غير الضرورية
 */
export function createMemoComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return React.memo(Component, propsAreEqual);
}

/**
 * Hook لتحسين الدوال باستخدام useCallback
 * يمنع إعادة إنشاء الدالة عند كل تصيير
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList = []
): T {
  return useCallback(callback, dependencies);
}

/**
 * Hook لتحسين القيم المحسوبة باستخدام useMemo
 * يمنع إعادة حساب القيمة عند كل تصيير
 */
export function useStableMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList = []
): T {
  return useMemo(factory, dependencies);
}

/**
 * Hook لتأخير التحديثات المتكررة
 * يقلل من عدد عمليات إعادة التصيير
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook لتحديد ما إذا كان المكون مرئيًا في الشاشة
 * يساعد في تحميل المكونات عند الحاجة فقط
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView };
}

/**
 * Hook لتحسين الأداء عند التعامل مع قوائم كبيرة
 * يعرض فقط العناصر المرئية في الشاشة
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // حساب العناصر المرئية
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 2, items.length - 1);

  // إنشاء قائمة العناصر المرئية
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  // معالجة حدث التمرير
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight: items.length * itemHeight,
    handleScroll,
  };
}

/**
 * Hook لتحسين الأداء عند التعامل مع الأحداث المتكررة
 * يحد من عدد مرات تنفيذ الدالة
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const argsRef = useRef<Parameters<T> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      const now = Date.now();

      if (now - lastExecuted.current >= delay) {
        lastExecuted.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          if (argsRef.current) {
            callback(...argsRef.current);
          }
        }, delay - (now - lastExecuted.current));
      }
    },
    [callback, delay]
  );
}

/**
 * مكون لعرض قائمة افتراضية
 * يحسن الأداء عند التعامل مع قوائم كبيرة
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const { containerRef, visibleItems, totalHeight, handleScroll } = useVirtualizedList(
    items,
    itemHeight,
    containerHeight
  );

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto', position: 'relative' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
