import React, { useState, useEffect, useRef, useMemo } from 'react';
import { compressImage } from '../../utils/compression';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  placeholderColor?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean; // للصور ذات الأولوية العالية
  quality?: number; // جودة الصورة (0-1)
  blur?: boolean; // إظهار نسخة ضبابية أثناء التحميل
  fallbackSrc?: string; // مصدر بديل في حالة الخطأ
  onLoad?: () => void;
  onError?: () => void;
  decoding?: 'async' | 'sync' | 'auto'; // نوع فك ترميز الصورة
  fetchPriority?: 'high' | 'low' | 'auto'; // أولوية تحميل الصورة
}

/**
 * مكون صورة محسن يدعم:
 * - التحميل الكسول
 * - تنسيق WebP
 * - أحجام متعددة للصور
 * - صورة مؤقتة أثناء التحميل
 * - ضغط الصور لتحسين الأداء
 * - صور مصغرة ضبابية للتحميل السريع
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  loading = 'lazy',
  placeholderColor = '#f3f4f6',
  objectFit = 'cover',
  priority = false,
  quality = 0.8,
  blur = false,
  fallbackSrc = '',
  onLoad,
  onError,
  decoding = 'async',
  fetchPriority = 'auto',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // إنشاء مجموعة من الأحجام المختلفة للصورة
  const generateSrcSet = useMemo(() => {
    if (!src) return '';
    
    // تجاهل الصور الخارجية
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
      return '';
    }
    
    // إنشاء مجموعة من الأحجام المختلفة
    const widths = [320, 480, 640, 768, 1024, 1280, 1536];
    const extension = src.split('.').pop() || 'jpg';
    const basePath = src.substring(0, src.lastIndexOf('.'));
    
    return widths
      .map((w) => {
        // استخدام WebP إذا كان ممكنًا
        const webpSrc = `${basePath}-${w}.webp`;
        return `${webpSrc} ${w}w`;
      })
      .join(', ');
  }, [src]);

  // ضغط الصورة لتحسين الأداء
  useEffect(() => {
    // لا نضغط الصور المضغوطة مسبقًا أو الصور ذات الأولوية
    if (src.startsWith('data:') || priority) {
      return;
    }

    // ضغط الصورة فقط للصور المحلية والخارجية
    const optimizeImage = async () => {
      try {
        // إنشاء صورة ضبابية مصغرة للتحميل السريع
        if (blur) {
          const tinyBlurImage = await compressImage(src, 0.1);
          setBlurDataUrl(tinyBlurImage);
        }

        // ضغط الصورة الرئيسية
        const compressed = await compressImage(src, quality);
        setOptimizedSrc(compressed);
      } catch (err) {
        console.error('فشل ضغط الصورة:', err);
        // استخدام الصورة الأصلية في حالة الفشل
        setOptimizedSrc(src);
      }
    };

    optimizeImage();
  }, [src, quality, blur, priority]);

  // استخدام Intersection Observer لتحميل الصورة عند ظهورها
  useEffect(() => {
    // إذا كانت الصورة ذات أولوية عالية، لا نستخدم التحميل الكسول
    if (priority || loading === 'eager' || isLoaded) {
      return;
    }

    if (!imgRef.current) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // تحميل الصورة الفعلية
        const img = new Image();
        img.src = optimizedSrc;
        img.decoding = decoding;
        img.onload = () => {
          setIsLoaded(true);
          onLoad?.();
        };
        img.onerror = () => {
          // محاولة استخدام المصدر البديل إذا كان متوفرًا
          if (fallbackSrc) {
            img.src = fallbackSrc;
            return;
          }
          setError(true);
          onError?.();
        };

        // إلغاء المراقبة بعد التحميل
        if (observerRef.current && imgRef.current) {
          observerRef.current.unobserve(imgRef.current);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px', // تحميل الصورة قبل ظهورها بـ 200 بكسل
      threshold: 0.01,
    });

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [optimizedSrc, isLoaded, onLoad, onError, priority, loading, fallbackSrc, decoding]);

  // تنظيف المراقب عند إزالة المكون
  useEffect(() => {
    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
        observerRef.current.disconnect();
      }
    };
  }, []);

  // الصورة ذات الأولوية العالية تحمل فورًا
  useEffect(() => {
    if (priority && imgRef.current && !isLoaded) {
      const img = imgRef.current;
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        if (fallbackSrc) {
          img.src = fallbackSrc;
          return;
        }
        setError(true);
        onError?.();
      };
    }
  }, [priority, isLoaded, onLoad, onError, fallbackSrc]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        backgroundColor: placeholderColor,
      }}
    >
      {/* صورة ضبابية مصغرة للتحميل السريع */}
      {blur && blurDataUrl && !isLoaded && !error && (
        <div
          className="absolute inset-0 blur-sm"
          style={{
            backgroundImage: `url(${blurDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* صورة مؤقتة أثناء التحميل */}
      {!isLoaded && !error && !blurDataUrl && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
        />
      )}

      {/* صورة الخطأ */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <span className="text-gray-500">فشل تحميل الصورة</span>
        </div>
      )}

      {/* الصورة الفعلية */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        sizes={sizes}
        srcSet={generateSrcSet}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } w-full h-full`}
        style={{ objectFit }}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          // محاولة استخدام المصدر البديل إذا كان متوفرًا
          if (fallbackSrc && imgRef.current) {
            imgRef.current.src = fallbackSrc;
            return;
          }
          setError(true);
          onError?.();
        }}
        decoding={decoding}
        fetchPriority={priority ? 'high' : fetchPriority}
      />
    </div>
  );
};

export default OptimizedImage;
