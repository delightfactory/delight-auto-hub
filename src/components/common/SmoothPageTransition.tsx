import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingIndicator from './LoadingIndicator';

interface SmoothPageTransitionProps {
  /** محتوى الصفحة */
  children: React.ReactNode;
  /** نوع التأثير */
  effect?: 'fade' | 'slide' | 'zoom' | 'flip';
  /** مدة التأثير بالمللي ثانية */
  duration?: number;
  /** إظهار مؤشر التحميل */
  showLoader?: boolean;
  /** نوع مؤشر التحميل */
  loaderType?: 'spinner' | 'bar' | 'dots';
}

/**
 * مكون لإضافة انتقالات سلسة بين الصفحات
 * يحسن تجربة المستخدم عند التنقل بين الصفحات
 */
const SmoothPageTransition: React.FC<SmoothPageTransitionProps> = ({
  children,
  effect = 'fade',
  duration = 300,
  showLoader = true,
  loaderType = 'bar',
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('in');
  const [isLoading, setIsLoading] = useState(false);

  // تتبع تغيرات المسار
  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // بدء الانتقال
      setTransitionStage('out');
      setIsLoading(true);
      
      // تأخير تغيير الصفحة حتى اكتمال تأثير الانتقال
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('in');
        
        // إنهاء التحميل بعد فترة قصيرة
        setTimeout(() => {
          setIsLoading(false);
        }, duration / 2);
      }, duration);
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, duration]);

  // تحديد أنماط CSS للتأثيرات
  const getTransitionStyles = () => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${duration}ms ease-in-out`,
      position: 'relative',
      width: '100%',
      height: '100%',
    };
    
    // أنماط مختلفة لكل نوع من التأثيرات
    const effectStyles: Record<string, React.CSSProperties> = {
      fade: {
        opacity: transitionStage === 'in' ? 1 : 0,
      },
      slide: {
        transform: transitionStage === 'in' 
          ? 'translateX(0)' 
          : 'translateX(-100%)',
      },
      zoom: {
        opacity: transitionStage === 'in' ? 1 : 0,
        transform: transitionStage === 'in' 
          ? 'scale(1)' 
          : 'scale(0.95)',
      },
      flip: {
        opacity: transitionStage === 'in' ? 1 : 0,
        transform: transitionStage === 'in' 
          ? 'rotateY(0deg)' 
          : 'rotateY(90deg)',
        transformStyle: 'preserve-3d' as const,
        perspective: '1000px',
      },
    };
    
    return { ...baseStyles, ...effectStyles[effect] };
  };

  return (
    <div className="relative">
      {/* مؤشر التحميل */}
      {showLoader && isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <LoadingIndicator type={loaderType} size="sm" text="" />
        </div>
      )}
      
      {/* محتوى الصفحة مع تأثير الانتقال */}
      <div style={getTransitionStyles()}>
        {children}
      </div>
    </div>
  );
};

export default SmoothPageTransition;
