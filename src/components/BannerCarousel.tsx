import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/types/db';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface BannerCarouselProps {
  pageName: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ pageName }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { data: banners = [], isLoading, isError, error } = useQuery<Banner[], Error>({
    queryKey: ['active-banners', pageName],
    queryFn: async () => {
      console.log('جاري جلب البانرات للصفحة:', pageName);
      
      try {
        // استخدام وظيفة RPC للحصول على البانرات النشطة
        const { data, error } = await supabase.rpc('get_active_banners', { page_name: pageName });
        
        if (error) {
          console.error('خطأ في وظيفة RPC للبانرات:', error);
          throw error;
        }
        
        if (data && Array.isArray(data)) {
          console.log(`تم جلب ${data.length} بانر بنجاح`);
          return data as Banner[];
        }
        
        // إذا لم يتم العثور على بيانات، نستخدم استعلام مباشر كحل بديل
        console.log('استخدام الاستعلام المباشر كحل بديل');
        const now = new Date().toISOString();
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('banners')
          .select('*')
          .or(`start_at.is.null,start_at.lte.${now}`)
          .or(`end_at.is.null,end_at.gte.${now}`)
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (fallbackError) {
          console.error('خطأ في الاستعلام المباشر:', fallbackError);
          throw fallbackError;
        }
        
        console.log(`تم جلب ${fallbackData?.length || 0} بانر بنجاح من الاستعلام المباشر`);
        return fallbackData as Banner[];
      } catch (err) {
        console.error('خطأ أثناء جلب البانرات:', err);
        toast({
          title: "خطأ في تحميل البانرات",
          description: "حدث خطأ أثناء تحميل البانرات، يرجى المحاولة مرة أخرى لاحقاً",
          variant: "destructive"
        });
        throw err;
      }
    },
    enabled: !!pageName,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  // فلترة البنرات حسب الصفحة ووقت البدء والانتهاء
  const filteredBanners = useMemo(() => {
    if (!banners || banners.length === 0) return [];
    
    const now = new Date();
    console.log(`فلترة ${banners.length} بانر للصفحة ${pageName}`);
    
    // طباعة جميع البانرات للتشخيص
    banners.forEach((banner, index) => {
      console.log(`بانر ${index + 1}:`, {
        id: banner.id,
        title: banner.title,
        image_url: banner.image_url,
        pages: banner.pages,
        is_active: banner.is_active,
        start_at: banner.start_at,
        end_at: banner.end_at
      });
    });
    
    const filtered = banners.filter(b => {
      // التأكد من أن b.pages موجود ويحتوي على القيمة المطلوبة
      let pagesMatch = false;
      
      // التحقق من أن b.pages موجود وأنه مصفوفة
      if (b.pages) {
        if (Array.isArray(b.pages)) {
          pagesMatch = b.pages.includes(pageName);
        } else if (typeof b.pages === 'string') {
          // محاولة تحليل النص إذا كان بتنسيق JSON
          try {
            const parsedPages = JSON.parse(b.pages);
            pagesMatch = Array.isArray(parsedPages) && parsedPages.includes(pageName);
          } catch (e) {
            // إذا لم يكن JSON صالح، نتحقق من النص مباشرة
            pagesMatch = typeof b.pages === 'string' && b.pages.includes(pageName);
          }
        }
      }
      
      // التحقق من تاريخ البدء والانتهاء
      const startDateValid = !b.start_at || new Date(b.start_at) <= now;
      const endDateValid = !b.end_at || new Date(b.end_at) >= now;
      
      // التأكد من أن البانر نشط
      const isActive = b.is_active !== false; // اعتباره نشطاً إذا لم يتم تحديده صراحةً
      
      const result = pagesMatch && startDateValid && endDateValid && isActive;
      console.log(`بانر ${b.id} (${b.title}): pagesMatch=${pagesMatch}, startDateValid=${startDateValid}, endDateValid=${endDateValid}, isActive=${isActive}, result=${result}`);
      
      return result;
    });
    
    console.log(`تم تصفية ${filtered.length} بانر للعرض`);
    
    // إذا لم تكن هناك بانرات مطابقة للصفحة، نحاول عرض بانرات الصفحة الرئيسية
    if (filtered.length === 0 && pageName !== 'home') {
      console.log('لم يتم العثور على بانرات لهذه الصفحة، جاري محاولة عرض بانرات الصفحة الرئيسية');
      return banners.filter(b => {
        let pagesMatch = false;
        
        if (b.pages) {
          if (Array.isArray(b.pages)) {
            pagesMatch = b.pages.includes('home');
          } else if (typeof b.pages === 'string') {
            try {
              const parsedPages = JSON.parse(b.pages);
              pagesMatch = Array.isArray(parsedPages) && parsedPages.includes('home');
            } catch (e) {
              pagesMatch = typeof b.pages === 'string' && b.pages.includes('home');
            }
          }
        }
        
        const startDateValid = !b.start_at || new Date(b.start_at) <= now;
        const endDateValid = !b.end_at || new Date(b.end_at) >= now;
        const isActive = b.is_active !== false;
        
        return pagesMatch && startDateValid && endDateValid && isActive;
      });
    }
    
    return filtered;
  }, [banners, pageName]);

  // إعادة ضبط current إذا تغيرت قائمة البنرات المفلترة
  useEffect(() => {
    if (current >= filteredBanners.length) setCurrent(0);
  }, [filteredBanners]);

  useEffect(() => {
    if (!filteredBanners.length) return;
    
    // استخدام قيمة افتراضية 5 ثوانٍ إذا كانت display_interval غير محددة
    const interval = (filteredBanners[current]?.display_interval || 5) * 1000;
    
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % filteredBanners.length);
    }, interval);
    
    return () => clearTimeout(timer);
  }, [current, filteredBanners]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const children = container.children as HTMLCollectionOf<HTMLElement>;
    const el = children[current];
    if (el) {
      const left = el.offsetLeft;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [current]);

  // Helper to check if URL is external (different origin)
  const isExternal = (url?: string): boolean => {
    if (!url) return false;
    try {
      const link = new URL(url, window.location.origin);
      return link.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  // إظهار حالة التحميل
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-4">
        <Loader2 className="animate-spin h-6 w-6 text-red-600"/>
      </div>
    );
  }
  
  // إظهار رسالة الخطأ
  if (isError) {
    console.error('خطأ في تحميل البانرات:', error);
    return (
      <div className="w-full flex justify-center py-4 text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>حدث خطأ أثناء تحميل البانرات</span>
      </div>
    );
  }
  
  // عدم عرض أي شيء إذا لم تكن هناك بانرات
  if (!filteredBanners.length) {
    console.log('لا توجد بانرات للعرض');
    // لا نعرض أي بانر افتراضي
    return null;
  }

  return (
    <div className="w-full mt-2 mb-6">
      <div className="relative">
        <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar">
          {filteredBanners.map((b) => {
            // تسجيل معلومات البانر للتصحيح
            console.log(`عرض بانر: ${b.title}, URL: ${b.image_url}, رابط: ${b.link_url || 'لا يوجد'}`);
            
            const linkUrl = b.link_url || '';
            const isInternal = !!linkUrl && !isExternal(linkUrl);
            
            // إنشاء عنصر الصورة المشترك
            // التأكد من أن رابط الصورة مطلق وليس نسبي
            const imageUrl = b.image_url?.startsWith('http') 
              ? b.image_url 
              : `${import.meta.env.VITE_SUPABASE_URL || 'https://hxqxqvmvnqxgcxrxgpkw.supabase.co'}/storage/v1/object/public/banners/${b.image_url}`;
            
            console.log(`رابط الصورة النهائي: ${imageUrl}`);
            
            const imageElement = (
              <div className="aspect-w-16 aspect-h-5 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={b.title || 'صورة بانر'}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    console.error(`خطأ في تحميل صورة البانر: ${imageUrl}`);
                    // محاولة أخرى باستخدام مسار مختلف في حالة الفشل
                    if (!e.currentTarget.src.includes('placeholder')) {
                      e.currentTarget.src = 'https://via.placeholder.com/1200x400?text=Error+Loading+Banner';
                    }
                  }}
                  loading="eager" // تغيير من lazy إلى eager لضمان التحميل السريع
                  crossOrigin="anonymous" // إضافة لحل مشاكل CORS
                />
              </div>
            );
            
            // إذا كان الرابط داخلي، استخدم مكون Link
            if (isInternal) {
              try {
                const urlObj = new URL(linkUrl, window.location.origin);
                const to = `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
                return (
                  <Link key={b.id} to={to} className="flex-shrink-0 w-full snap-start">
                    {imageElement}
                  </Link>
                );
              } catch (err) {
                console.error(`خطأ في تحليل الرابط الداخلي: ${linkUrl}`, err);
                // إذا فشل تحليل الرابط، عرض الصورة فقط بدون رابط
                return (
                  <div key={b.id} className="flex-shrink-0 w-full snap-start">
                    {imageElement}
                  </div>
                );
              }
            }
            
            // إذا كان الرابط خارجي، استخدم وسم a
            if (linkUrl) {
              return (
                <a
                  key={b.id}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-full snap-start"
                >
                  {imageElement}
                </a>
              );
            }
            
            // إذا لم يكن هناك رابط، عرض الصورة فقط
            return (
              <div key={b.id} className="flex-shrink-0 w-full snap-start">
                {imageElement}
              </div>
            );
          })}
        </div>
        
        {/* أزرار التنقل */}
        {filteredBanners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrent((prev) => (prev - 1 + filteredBanners.length) % filteredBanners.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
              aria-label="السابق"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button 
              onClick={() => setCurrent((prev) => (prev + 1) % filteredBanners.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
              aria-label="التالي"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
        
        {/* مؤشرات الشرائح */}
        {filteredBanners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {filteredBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-delight-600 w-4' : 'bg-white/70'}`}
                aria-label={`الانتقال إلى الشريحة ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// إضافة أنماط CSS لإخفاء شريط التمرير
const styleElement = document.createElement('style');
styleElement.textContent = `
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
`;
document.head.appendChild(styleElement);

export default BannerCarousel;
