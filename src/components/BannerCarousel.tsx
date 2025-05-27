import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/types/db';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BannerCarouselProps {
  pageName: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ pageName }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { data: banners = [], isLoading } = useQuery<Banner[], Error>({
    queryKey: ['active-banners', pageName],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_banners', { page_name: pageName });
      if (error) throw error;
      return data as Banner[];
    },
    enabled: !!pageName,
  });

  // فلترة البنرات حسب الصفحة ووقت البدء والانتهاء
  const filteredBanners = useMemo(() => {
    const now = new Date();
    return banners.filter(b =>
      b.pages.includes(pageName) &&
      (b.start_at ? new Date(b.start_at) <= now : true) &&
      (b.end_at ? new Date(b.end_at) >= now : true)
    );
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

  if (isLoading) return <div className="w-full flex justify-center py-4"><Loader2 className="animate-spin h-6 w-6 text-red-600"/></div>;
  if (!filteredBanners.length) return null;

  return (
    <div className="w-full mt-2 mb-6">
      <div className="relative">
        <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory">
          {filteredBanners.map((b) => {
            const linkUrl = b.link_url || '';
            const isInternal = !!linkUrl && !isExternal(linkUrl);
            if (isInternal) {
              const urlObj = new URL(linkUrl, window.location.origin);
              const to = `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
              return (
                <Link key={b.id} to={to} className="flex-shrink-0 w-full snap-start">
                  <div className="relative w-full pb-[28%] md:pb-[23.333%] lg:pb-[17.5%]">
                    <img
                      src={b.image_url}
                      alt={b.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </Link>
              );
            }
            return (
              <a
                key={b.id}
                href={linkUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-full snap-start"
              >
                <div className="relative w-full pb-[28%] md:pb-[23.333%] lg:pb-[17.5%]">
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
