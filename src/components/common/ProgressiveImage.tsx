import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../../utils/reactPerformance';
import { generateBlurPlaceholder } from '../../utils/imageOptimizer';

interface ProgressiveImageProps {
  /** مسار الصورة الأصلية */
  src: string;
  /** نص بديل للصورة */
  alt: string;
  /** فئات CSS */
  className?: string;
  /** نمط CSS */
  style?: React.CSSProperties;
  /** عرض الصورة */
  width?: number | string;
  /** ارتفاع الصورة */
  height?: number | string;
  /** مسار صورة منخفضة الجودة للعرض أثناء التحميل */
  lowQualitySrc?: string;
  /** استخدام تأثير الضبابية */
  blur?: boolean;
  /** مدة تأثير الانتقال بالمللي ثانية */
  transitionDuration?: number;
  /** تحميل الصورة فقط عند ظهورها في نافذة العرض */
  lazyLoad?: boolean;
  /** أولوية تحميل الصورة */
  priority?: boolean;
  /** دالة تنفذ عند اكتمال تحميل الصورة */
  onLoad?: () => void;
  /** دالة تنفذ عند حدوث خطأ في تحميل الصورة */
  onError?: () => void;
}

/**
 * مكون لعرض الصور بشكل تدريجي
 * يحسن تجربة المستخدم عند تحميل الصور
 */
const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  width,
  height,
  lowQualitySrc,
  blur = true,
  transitionDuration = 500,
  lazyLoad = true,
  priority = false,
  onLoad,
  onError,
}) => {
  // حالات المكون
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px', // تحميل الصورة قبل ظهورها بـ 200 بكسل
    threshold: 0,
  });

  // إنشاء صورة ضبابية كبديل مؤقت
  useEffect(() => {
    if (blur && !lowQualitySrc) {
      const generatePlaceholder = async () => {
        try {
          const placeholder = await generateBlurPlaceholder(src);
          setPlaceholderSrc(placeholder);
        } catch (error) {
          console.error('فشل في إنشاء صورة ضبابية:', error);
        }
      };

      generatePlaceholder();
    } else if (lowQualitySrc) {
      setPlaceholderSrc(lowQualitySrc);
    }
  }, [src, blur, lowQualitySrc]);

  // تحديد ما إذا كان يجب تحميل الصورة
  const shouldLoadImage = priority || !lazyLoad || isIntersecting;

  // معالجة اكتمال تحميل الصورة
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // معالجة خطأ تحميل الصورة
  const handleImageError = () => {
    setIsError(true);
    onError?.();
  };

  // أنماط CSS للصور
  const imageStyles: React.CSSProperties = {
    ...style,
    transition: `opacity ${transitionDuration}ms ease-in-out`,
  };

  // أنماط الصورة الأصلية
  const mainImageStyles: React.CSSProperties = {
    ...imageStyles,
    opacity: isLoaded ? 1 : 0,
    position: isLoaded ? 'relative' : 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  // أنماط الصورة البديلة
  const placeholderStyles: React.CSSProperties = {
    ...imageStyles,
    opacity: isLoaded ? 0 : 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: blur ? 'blur(20px)' : 'none',
    transform: blur ? 'scale(1.1)' : 'none', // لتجنب ظهور حواف الضبابية
  };

  // عرض رسالة خطأ في حالة فشل تحميل الصورة
  if (isError) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ width, height, backgroundColor: '#f0f0f0' }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>فشل تحميل الصورة</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* الصورة البديلة المؤقتة */}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt={alt}
          style={placeholderStyles}
          aria-hidden="true"
        />
      )}

      {/* الصورة الأصلية */}
      {shouldLoadImage && (
        <img
          src={src}
          alt={alt}
          style={mainImageStyles}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* عرض مؤشر التحميل إذا لم تكن الصورة محملة بعد */}
      {!isLoaded && !placeholderSrc && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: '#f0f0f0' }}
        >
          <div className="animate-pulse w-8 h-8 rounded-full bg-gray-300"></div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;
