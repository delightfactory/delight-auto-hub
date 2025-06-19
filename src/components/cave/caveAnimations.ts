export const caveAnimations = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  },
  loading: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  }
} as const;

export type CaveAnimationKey = keyof typeof caveAnimations;
