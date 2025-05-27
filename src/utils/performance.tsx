import React, { useCallback, useMemo, useState, useEffect } from 'react';

/**
 * مكون مُحسن باستخدام React.memo
 * يمنع إعادة التصيير غير الضرورية
 */
export function createMemoComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return React.memo(Component, propsAreEqual);
}

/**
 * Hook لتتبع ما إذا كان المكون مرئيًا في الشاشة
 * يستخدم لتحميل المكونات عند الحاجة فقط
 */
export function useInView(ref: React.RefObject<HTMLElement>, options = {}) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
        ...options,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Hook لتأخير تحميل المكونات الثقيلة
 */
export function useDeferredLoading(shouldLoad: boolean, delay = 200) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!shouldLoad) return;

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldLoad, delay]);

  return isLoaded;
}

/**
 * Hook لتحسين الأداء عند التعامل مع قوائم كبيرة
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

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    []
  );

  return {
    visibleList,
    totalHeight: items.length * itemHeight,
    onScroll,
  };
}

/**
 * مكون لتحميل الصور بشكل كسول
 */
export const LazyImage = createMemoComponent(
  ({ src, alt, className, width, height, placeholder = '/placeholder.jpg' }: {
    src: string;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    placeholder?: string;
  }) => {
    const [loaded, setLoaded] = useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);
    const isInView = useInView(imgRef);
    const shouldLoad = useDeferredLoading(isInView);

    useEffect(() => {
      if (!shouldLoad) return;

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoaded(true);
      };

      return () => {
        img.onload = null;
      };
    }, [src, shouldLoad]);

    return (
      <div
        className={`relative overflow-hidden ${className || ''}`}
        style={{ width, height }}
        ref={imgRef}
      >
        <img
          src={loaded ? src : placeholder}
          alt={alt}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-50'
          }`}
          width={width}
          height={height}
          loading="lazy"
        />
      </div>
    );
  }
);
