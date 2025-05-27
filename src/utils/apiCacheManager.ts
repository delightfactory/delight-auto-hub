/**
 * مدير التخزين المؤقت للبيانات من API
 * يساعد في تحسين الأداء وتقليل عدد الطلبات إلى الخادم
 */

interface CacheOptions {
  maxAge: number; // مدة صلاحية التخزين المؤقت بالمللي ثانية
  staleWhileRevalidate?: boolean; // استخدام البيانات القديمة أثناء تحديثها
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * مدير التخزين المؤقت للبيانات من API
 */
class ApiCacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private defaultOptions: CacheOptions = {
    maxAge: 5 * 60 * 1000, // 5 دقائق
    staleWhileRevalidate: true,
  };

  /**
   * الحصول على البيانات من التخزين المؤقت أو من API
   * @param url رابط API
   * @param options خيارات التخزين المؤقت
   * @param fetchOptions خيارات الطلب
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
    
    // إذا كان هناك طلب معلق لنفس الرابط، انتظار نتيجته
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
  
  /**
   * الحصول على حجم التخزين المؤقت
   */
  getSize(): number {
    return this.cache.size;
  }
  
  /**
   * الحصول على قائمة بمفاتيح التخزين المؤقت
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * تصدير التخزين المؤقت إلى localStorage
   */
  exportToLocalStorage(key: string = 'api-cache'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = Array.from(this.cache.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, CacheItem<any>>);
      
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('فشل تصدير التخزين المؤقت إلى localStorage:', error);
    }
  }
  
  /**
   * استيراد التخزين المؤقت من localStorage
   */
  importFromLocalStorage(key: string = 'api-cache'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = localStorage.getItem(key);
      
      if (cacheData) {
        const parsedData = JSON.parse(cacheData) as Record<string, CacheItem<any>>;
        
        Object.entries(parsedData).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    } catch (error) {
      console.error('فشل استيراد التخزين المؤقت من localStorage:', error);
    }
  }
}

// إنشاء نسخة واحدة للاستخدام في جميع أنحاء التطبيق
export const apiCacheManager = new ApiCacheManager();
