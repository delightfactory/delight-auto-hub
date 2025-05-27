import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache } from '@/utils/apiCache';

interface QueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<T>;
}

/**
 * Hook لتحسين استدعاءات API وتخزينها مؤقتًا
 * @param url رابط API
 * @param options خيارات الاستدعاء
 */
export function useOptimizedQuery<T = any>(
  url: string,
  options: QueryOptions = {}
): QueryResult<T> {
  const {
    enabled = true,
    refetchInterval = 0,
    cacheTime = 5 * 60 * 1000, // 5 دقائق
    staleTime = 0,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetchIntervalId = useRef<number | null>(null);
  const retryCount = useRef<number>(0);
  const lastFetchTime = useRef<number>(0);

  // دالة الاستدعاء
  const fetchData = useCallback(async (): Promise<T> => {
    try {
      setIsLoading(true);
      
      // التحقق من وقت آخر استدعاء
      const now = Date.now();
      const shouldUseCache = staleTime > 0 && now - lastFetchTime.current < staleTime;
      
      if (shouldUseCache && data !== null) {
        setIsLoading(false);
        return data;
      }
      
      // استدعاء API مع التخزين المؤقت
      const result = await apiCache.fetch<T>(url, { maxAge: cacheTime });
      
      // تحديث الحالة
      setData(result);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      
      // تحديث وقت آخر استدعاء
      lastFetchTime.current = now;
      
      // إعادة ضبط عدد المحاولات
      retryCount.current = 0;
      
      // استدعاء دالة النجاح
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      // زيادة عدد المحاولات
      retryCount.current += 1;
      
      // التحقق من عدد المحاولات
      if (retryCount.current <= retry) {
        // إعادة المحاولة بعد تأخير
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchData();
      }
      
      // تحديث حالة الخطأ
      const errorObj = err instanceof Error ? err : new Error('حدث خطأ أثناء استدعاء API');
      setIsError(true);
      setError(errorObj);
      setIsLoading(false);
      
      // استدعاء دالة الخطأ
      onError?.(errorObj);
      
      throw errorObj;
    }
  }, [url, cacheTime, staleTime, retry, retryDelay, onSuccess, onError, data]);

  // استدعاء البيانات عند تغيير الرابط أو تفعيل الاستدعاء
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    fetchData().catch(() => {
      // تم معالجة الخطأ في دالة fetchData
    });
    
    // إعداد إعادة الاستدعاء الدوري
    if (refetchInterval > 0) {
      refetchIntervalId.current = window.setInterval(() => {
        fetchData().catch(() => {
          // تم معالجة الخطأ في دالة fetchData
        });
      }, refetchInterval);
    }
    
    // تنظيف الاستدعاء الدوري عند إزالة المكون
    return () => {
      if (refetchIntervalId.current !== null) {
        clearInterval(refetchIntervalId.current);
      }
    };
  }, [enabled, fetchData, refetchInterval]);

  // دالة لإعادة الاستدعاء يدويًا
  const refetch = useCallback(async (): Promise<T> => {
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch };
}
