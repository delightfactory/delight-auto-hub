import React, { useState, useEffect, useRef } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  placeholderColor?: string;
  blur?: boolean;
  loading?: 'lazy' | 'eager';
  // تمت إزالة خاصية fetchPriority لتجنب الأخطاء
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderColor = '#f3f4f6',
  blur = false,
  loading = 'lazy',
  // تمت إزالة خاصية fetchPriority لتجنب الأخطاء
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // إعادة تعيين الحالة عند تغيير مصدر الصورة
    setIsLoaded(false);
    
    // إنشاء صورة جديدة لتحميلها بشكل غير مرئي
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      // في حالة فشل تحميل الصورة، استخدم صورة بديلة أو أبقِ على الخلفية
      console.error(`فشل تحميل الصورة: ${src}`);
      setIsLoaded(true); // نعتبرها محملة لإخفاء حالة التحميل
    };
    
    // تنظيف عند إلغاء تحميل المكون
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    console.error(`فشل تحميل الصورة: ${src}`);
    setIsLoaded(true); // نعتبرها محملة لإخفاء حالة التحميل
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: placeholderColor }}
    >
      {imgSrc && (
        <img
          ref={imgRef}
          src={isLoaded ? src : ''}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
          width={width}
          height={height}
        />
      )}
      
      {/* مؤشر التحميل - يظهر فقط أثناء تحميل الصورة */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
