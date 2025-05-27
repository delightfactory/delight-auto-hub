import React from 'react';

interface LoadingIndicatorProps {
  /** نوع المؤشر */
  type?: 'spinner' | 'bar' | 'dots' | 'skeleton';
  /** حجم المؤشر */
  size?: 'sm' | 'md' | 'lg';
  /** لون المؤشر */
  color?: string;
  /** نص بديل */
  text?: string;
  /** عرض المؤشر بشكل كامل للشاشة */
  fullScreen?: boolean;
  /** عرض خلفية شفافة */
  overlay?: boolean;
}

/**
 * مكون لعرض مؤشر التحميل بأشكال مختلفة
 * يستخدم لتحسين تجربة المستخدم أثناء تحميل البيانات
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'spinner',
  size = 'md',
  color = '#3b82f6',
  text = 'جاري التحميل...',
  fullScreen = false,
  overlay = false,
}) => {
  // تحديد حجم المؤشر
  const sizeMap = {
    sm: {
      spinner: 'w-4 h-4 border-2',
      bar: 'h-1',
      dots: 'w-1 h-1 mx-1',
      text: 'text-sm',
    },
    md: {
      spinner: 'w-8 h-8 border-3',
      bar: 'h-2',
      dots: 'w-2 h-2 mx-1',
      text: 'text-base',
    },
    lg: {
      spinner: 'w-12 h-12 border-4',
      bar: 'h-3',
      dots: 'w-3 h-3 mx-2',
      text: 'text-lg',
    },
  };

  // تحديد فئات CSS للحاوية
  const containerClasses = `
    flex flex-col items-center justify-center
    ${fullScreen ? 'fixed inset-0 z-50' : 'w-full h-full'}
    ${overlay ? 'bg-black bg-opacity-20' : ''}
  `;

  // إنشاء مؤشر التحميل بناءً على النوع المحدد
  const renderIndicator = () => {
    switch (type) {
      case 'spinner':
        return (
          <div
            className={`${sizeMap[size].spinner} rounded-full border-t-transparent border-solid animate-spin`}
            style={{ borderColor: `${color} transparent transparent transparent` }}
            role="status"
            aria-label={text}
          />
        );
      
      case 'bar':
        return (
          <div className="w-full max-w-md bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`${sizeMap[size].bar} animate-pulse`}
              style={{ backgroundColor: color }}
              role="progressbar"
              aria-label={text}
            />
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex items-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeMap[size].dots} rounded-full animate-bounce`}
                style={{
                  backgroundColor: color,
                  animationDelay: `${i * 0.15}s`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="w-full max-w-md">
            <div
              className="w-full h-4 rounded animate-pulse mb-2"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              aria-hidden="true"
            />
            <div
              className="w-3/4 h-4 rounded animate-pulse mb-2"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              aria-hidden="true"
            />
            <div
              className="w-1/2 h-4 rounded animate-pulse"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              aria-hidden="true"
            />
          </div>
        );
    }
  };

  return (
    <div className={containerClasses.trim()}>
      {renderIndicator()}
      {text && <p className={`mt-2 ${sizeMap[size].text} text-center`}>{text}</p>}
    </div>
  );
};

export default LoadingIndicator;
