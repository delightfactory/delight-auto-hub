// Service Worker الرئيسي
const CACHE_NAME = 'delight-auto-hub-v1';

// الموارد التي سيتم تخزينها مؤقتًا عند تثبيت Service Worker
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// عند تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('تم فتح ذاكرة التخزين المؤقت');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // تفعيل Service Worker فورًا دون انتظار إغلاق النسخة القديمة
        return self.skipWaiting();
      })
  );
});

// عند تفعيل Service Worker
self.addEventListener('activate', (event) => {
  // حذف ذاكرة التخزين المؤقت القديمة
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف ذاكرة التخزين المؤقت القديمة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // أخذ السيطرة على جميع العملاء بدون تحديث الصفحة
      return self.clients.claim();
    })
  );
});

// استراتيجية التخزين المؤقت للطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات API
  if (event.request.url.includes('/api/')) {
    return;
  }

  // استراتيجية الشبكة أولاً ثم التخزين المؤقت
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // تخزين نسخة من الاستجابة في ذاكرة التخزين المؤقت
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            // تخزين الطلبات GET فقط
            if (event.request.method === 'GET') {
              cache.put(event.request, responseClone);
            }
          });
        return response;
      })
      .catch(() => {
        // إذا فشل الطلب، استخدم النسخة المخزنة مؤقتًا
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // إذا كان الطلب لصفحة، عرض صفحة الوضع غير المتصل
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // إذا لم يتم العثور على الطلب في التخزين المؤقت، إرجاع خطأ
            return new Response('غير متصل بالإنترنت', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// معالجة رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
