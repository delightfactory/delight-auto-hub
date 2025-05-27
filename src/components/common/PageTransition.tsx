import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  /** نوع تأثير الانتقال */
  effect?: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  /** مدة تأثير الانتقال بالمللي ثانية */
  duration?: number;
  /** تأخير بدء الانتقال بالمللي ثانية */
  delay?: number;
  /** دالة يتم استدعاؤها عند بدء الانتقال */
  onStart?: () => void;
  /** دالة يتم استدعاؤها عند انتهاء الانتقال */
  onComplete?: () => void;
}

/**
 * مكون لإضافة تأثيرات انتقال بين الصفحات
 * يحسن تجربة المستخدم أثناء التنقل بين الصفحات
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  effect = 'fade',
  duration = 300,
  delay = 0,
  onStart,
  onComplete,
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('in');
  const [isAnimating, setIsAnimating] = useState(false);
  const previousPathRef = useRef<string>(location.pathname);
  
  // تتبع اتجاه التنقل (للأمام أو للخلف)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    // تحديد اتجاه التنقل
    if (location.pathname !== displayLocation.pathname) {
      // تخمين الاتجاه بناءً على طول المسار
      const isForward = location.pathname.length >= displayLocation.pathname.length;
      setDirection(isForward ? 'forward' : 'backward');
      
      // حفظ المسار السابق
      previousPathRef.current = displayLocation.pathname;
      
      // بدء الانتقال
      setIsAnimating(true);
      setTransitionStage('out');
      onStart?.();
      
      // تأخير تغيير الصفحة حتى اكتمال تأثير الانتقال
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('in');
        
        // إنهاء الانتقال
        const completeTimeout = setTimeout(() => {
          setIsAnimating(false);
          onComplete?.();
        }, duration);
        
        return () => clearTimeout(completeTimeout);
      }, duration + delay);
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, duration, delay, onStart, onComplete]);

  // تحديد فئات CSS بناءً على نوع التأثير والمرحلة
  const getTransitionClasses = () => {
    const baseClass = 'page-transition';
    const stageClass = `transition-${transitionStage}`;
    const effectClass = `effect-${effect}`;
    const directionClass = `direction-${direction}`;
    
    return `${baseClass} ${stageClass} ${effectClass} ${directionClass}`;
  };

  // تحديد أنماط CSS للتأثيرات
  const getTransitionStyles = () => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${duration}ms ease-in-out ${delay}ms`,
      position: 'relative' as const,
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
          : direction === 'forward' 
            ? 'translateX(-100%)' 
            : 'translateX(100%)',
      },
      zoom: {
        opacity: transitionStage === 'in' ? 1 : 0,
        transform: transitionStage === 'in' 
          ? 'scale(1)' 
          : direction === 'forward' 
            ? 'scale(0.8)' 
            : 'scale(1.2)',
      },
      flip: {
        opacity: transitionStage === 'in' ? 1 : 0,
        transform: transitionStage === 'in' 
          ? 'rotateY(0deg)' 
          : direction === 'forward' 
            ? 'rotateY(90deg)' 
            : 'rotateY(-90deg)',
        transformStyle: 'preserve-3d' as const,
        perspective: '1000px',
      },
      none: {},
    };
    
    return { ...baseStyles, ...effectStyles[effect] };
  };

  return (
    <div className={getTransitionClasses()} style={getTransitionStyles()} aria-live="polite">
      {/* مؤشر التحميل يظهر فقط أثناء الانتقال */}
      {isAnimating && (
        <div className="page-loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
      {children}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .page-transition {
          overflow: hidden;
        }
        
        .page-loading-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          height: 3px;
          background: linear-gradient(to right, transparent, #3b82f6, transparent);
          animation: loading-bar ${duration * 2}ms ease-in-out infinite;
        }
        
        .spinner {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes loading-bar {
          0% { width: 0; left: 0; }
          50% { width: 100%; left: 0; }
          100% { width: 0; left: 100%; }
        }
        
        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      ` }} />
    </div>
  );
};

export default PageTransition;
