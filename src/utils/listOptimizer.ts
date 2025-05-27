/**
 * أدوات لتحسين أداء القوائم الكبيرة وتقليل وقت التحميل
 */

import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * خيارات تحسين القوائم
 */
export interface ListOptimizationOptions {
  itemHeight: number; // ارتفاع العنصر الواحد
  overscan?: number; // عدد العناصر الإضافية المراد تحميلها خارج نطاق الرؤية
  threshold?: number; // عتبة التمرير للتحميل المزيد
  initialItems?: number; // عدد العناصر المراد تحميلها في البداية
}

/**
 * استخدام القوائم الافتراضية لتحسين أداء القوائم الكبيرة
 * @param items قائمة العناصر
 * @param options خيارات التحسين
 */
export function useVirtualList<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  options: ListOptimizationOptions
) {
  const {
    itemHeight,
    overscan = 3,
    threshold = 0.5,
    initialItems = 20
  } = options;

  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(Math.min(initialItems, items.length));
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // تحديث أبعاد الحاوية عند تغير حجم النافذة
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateContainerHeight();

    const resizeObserver = new ResizeObserver(updateContainerHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  // معالجة حدث التمرير
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop } = containerRef.current;
    setScrollTop(scrollTop);

    // حساب العناصر المرئية
    const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
    const newEndIndex = Math.min(items.length, newStartIndex + visibleCount);

    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [containerRef, containerHeight, itemHeight, items.length, overscan]);

  // إضافة مستمع لحدث التمرير
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // تحديث العناصر المرئية عند التحميل

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, handleScroll]);

  // تحديث العناصر المرئية عند تغير العناصر
  useEffect(() => {
    setVisibleItems(items.slice(startIndex, endIndex));
  }, [items, startIndex, endIndex]);

  // إرجاع البيانات اللازمة للعرض
  return {
    visibleItems,
    startIndex,
    totalHeight: items.length * itemHeight,
    virtualItemProps: {
      style: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${startIndex * itemHeight}px)`,
      }
    }
  };
}

/**
 * استخدام التحميل المتدرج للقوائم الكبيرة
 * @param items قائمة العناصر الكاملة
 * @param options خيارات التحميل
 */
export function useInfiniteScroll<T>(
  items: T[],
  options: {
    initialCount?: number;
    loadMoreCount?: number;
    threshold?: number;
  } = {}
) {
  const {
    initialCount = 10,
    loadMoreCount = 10,
    threshold = 200
  } = options;

  const [visibleItems, setVisibleItems] = useState<T[]>(items.slice(0, initialCount));
  const [hasMore, setHasMore] = useState(items.length > initialCount);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // تحميل المزيد من العناصر
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    // محاكاة تأخير الشبكة
    setTimeout(() => {
      const currentLength = visibleItems.length;
      const newItems = items.slice(0, currentLength + loadMoreCount);
      
      setVisibleItems(newItems);
      setHasMore(newItems.length < items.length);
      setLoading(false);
    }, 300);
  }, [items, visibleItems, loading, hasMore, loadMoreCount]);

  // إضافة مراقب التمرير
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold
      ) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [loadMore, threshold]);

  return {
    visibleItems,
    hasMore,
    loading,
    containerRef,
    loadMore
  };
}

/**
 * تحسين أداء القوائم باستخدام تقنية الصفحات
 * @param items قائمة العناصر الكاملة
 * @param options خيارات التصفح
 */
export function usePaginatedList<T>(
  items: T[],
  options: {
    pageSize?: number;
    initialPage?: number;
  } = {}
) {
  const { pageSize = 10, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // حساب إجمالي عدد الصفحات
  const totalPages = Math.ceil(items.length / pageSize);
  
  // الحصول على العناصر المرئية في الصفحة الحالية
  const visibleItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // التنقل بين الصفحات
  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return {
    visibleItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}
