/**
 * أدوات لتحسين استدعاءات API وتخزينها مؤقتًا
 */

interface CacheOptions {
  maxAge: number; // بالمللي ثانية
  staleWhileRevalidate?: boolean;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private defaultOptions: CacheOptions = {
    maxAge: 5 * 60 * 1000, // 5 دقائق
    staleWhileRevalidate: true,
  };

  /**
   * استدعاء API مع تخزين النتائج مؤقتًا
   * @param url رابط API
   * @param options خيارات التخزين المؤقت
   * @param fetchOptions خيارات الاستدعاء
   */
  async fetch<T>(url: string, options?: Partial<CacheOptions>, fetchOptions?: RequestInit): Promise<T> {
    const cacheKey = this.getCacheKey(url, fetchOptions);
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // التحقق من وجود البيانات في التخزين المؤقت
    const cachedItem = this.cache.get(cacheKey);
    const now = Date.now();
    
    // إذا كانت البيانات موجودة وصالحة، إرجاعها فورًا
    if (cachedItem && now - cachedItem.timestamp < mergedOptions.maxAge) {
      return cachedItem.data;
    }
    
    // إذا كان هناك طلب معلق لنفس الرابط، انتظر نتيجته
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // إذا كانت البيانات موجودة ولكنها قديمة، وتم تفعيل staleWhileRevalidate
    if (cachedItem && mergedOptions.staleWhileRevalidate) {
      // إرسال طلب جديد في الخلفية وتحديث التخزين المؤقت
      this.fetchAndUpdateCache<T>(url, cacheKey, fetchOptions, mergedOptions);
      return cachedItem.data;
    }
    
    // إذا لم تكن البيانات موجودة أو كانت قديمة، إرسال طلب جديد
    const promise = this.fetchAndUpdateCache<T>(url, cacheKey, fetchOptions, mergedOptions);
    this.pendingRequests.set(cacheKey, promise);
    
    try {
      return await promise;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  /**
   * إرسال طلب وتحديث التخزين المؤقت
   */
  private async fetchAndUpdateCache<T>(
    url: string,
    cacheKey: string,
    fetchOptions?: RequestInit,
    options?: CacheOptions
  ): Promise<T> {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`فشل الاستدعاء: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // تحديث التخزين المؤقت
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      
      return data;
    } catch (error) {
      console.error('خطأ في استدعاء API:', error);
      throw error;
    }
  }
  
  /**
   * إنشاء مفتاح فريد للتخزين المؤقت
   */
  private getCacheKey(url: string, fetchOptions?: RequestInit): string {
    if (!fetchOptions) return url;
    
    const { method = 'GET', headers = {}, body } = fetchOptions;
    const headerString = JSON.stringify(headers);
    const bodyString = body ? JSON.stringify(body) : '';
    
    return `${method}:${url}:${headerString}:${bodyString}`;
  }
  
  /**
   * حذف عنصر من التخزين المؤقت
   */
  invalidate(url: string, fetchOptions?: RequestInit): void {
    const cacheKey = this.getCacheKey(url, fetchOptions);
    this.cache.delete(cacheKey);
  }
  
  /**
   * حذف جميع العناصر من التخزين المؤقت
   */
  clear(): void {
    this.cache.clear();
  }
}

// إنشاء نسخة واحدة للاستخدام في جميع أنحاء التطبيق
export const apiCache = new ApiCache();
