import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SmoothPageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export const SmoothPageTransition: React.FC<SmoothPageTransitionProps> = ({
  children,
  transitionType = 'fade',
  duration = 0.3,
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  // تكوين الحركة بناءً على نوع الانتقال
  const getVariants = () => {
    switch (transitionType) {
      case 'slide':
        return {
          initial: { x: -300, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 300, opacity: 0 },
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayLocation.pathname}
        className="page-transition-container"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={{ duration }}
        onAnimationComplete={handleAnimationEnd}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
