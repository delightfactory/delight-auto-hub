import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaveAudio } from './CaveAudioEffects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * مكونات واجهة المستخدم المخصصة للمغارة
 * توفر هذه المكونات تجربة مستخدم متناسقة مع ثيم المغارة
 * وتتضمن تأثيرات صوتية وحركية لتعزيز التفاعل
 */

// زر المغارة المخصص
interface CaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  soundEffect?: 'click' | 'coin' | 'treasure' | 'none';
  glowEffect?: boolean;
}

export const CaveButton = React.forwardRef<HTMLButtonElement, CaveButtonProps>(
  ({ 
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'start',
    soundEffect = 'click',
    glowEffect = false,
    className = '',
    onClick,
    ...props 
  }, ref) => {
    const { playSound, playCoinCollect, playTreasureFound } = useCaveAudio();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // تشغيل المؤثر الصوتي المناسب
      if (soundEffect === 'click') {
        playSound('cart-add', 0.3);
      } else if (soundEffect === 'coin') {
        playCoinCollect();
      } else if (soundEffect === 'treasure') {
        playTreasureFound();
      }

      // استدعاء معالج النقر الأصلي إن وجد
      if (onClick) {
        onClick(e);
      }
    };

    // تحويل الأنماط إلى أنماط shadcn UI
    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'default';
        case 'secondary':
          return 'secondary';
        case 'outline':
          return 'outline';
        case 'ghost':
          return 'ghost';
        default:
          return 'default';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'sm';
        case 'md':
          return 'default';
        case 'lg':
          return 'lg';
        default:
          return 'default';
      }
    };

    return (
      <Button
        variant={getVariantClasses()}
        size={getSizeClasses()}
        className={cn(
          'font-cinzel font-semibold',
          glowEffect && 'cave-game-glow',
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === 'start' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'end' && <span className="ml-2">{icon}</span>}
      </Button>
    );
  }
);

CaveButton.displayName = 'CaveButton';

// بطاقة المغارة المخصصة
interface CaveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowEffect?: boolean;
  floatEffect?: boolean;
  onClick?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export const CaveCard: React.FC<CaveCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glowEffect = false,
  floatEffect = false,
  onClick,
  title,
  description,
}) => {
  return (
    <Card
      className={cn(
        'cave-game-card',
        hoverEffect && 'hover:transform hover:translate-y-[-5px]',
        glowEffect && 'cave-game-glow',
        floatEffect && 'cave-game-float',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="cave-game-title">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// شارة المغارة المخصصة
interface CaveBadgeProps {
  children: React.ReactNode;
  variant?: 'discount' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  className?: string;
}

export const CaveBadge: React.FC<CaveBadgeProps> = ({
  children,
  variant = 'common',
  className = '',
}) => {
  // تحويل الأنماط إلى أنماط shadcn UI
  const getVariantClasses = () => {
    switch (variant) {
      case 'discount':
        return 'destructive';
      case 'common':
        return 'secondary';
      case 'uncommon':
        return 'success';
      case 'rare':
        return 'default';
      case 'epic':
        return 'outline';
      case 'legendary':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge
      variant={getVariantClasses()}
      className={cn(
        variant === 'legendary' && 'bg-gradient-to-r from-amber-300 to-amber-600 text-amber-950 border-amber-700',
        className
      )}
    >
      {children}
    </Badge>
  );
};

// عنوان المغارة المخصص
interface CaveTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  glowEffect?: boolean;
}

export const CaveTitle: React.FC<CaveTitleProps> = ({
  children,
  level = 2,
  className = '',
  glowEffect = true,
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const titleClasses = cn('cave-game-title', glowEffect && 'cave-game-text-glow', className);

  return (
    <Component className={titleClasses}>
      {children}
    </Component>
  );
};

// أيقونة المغارة المخصصة
interface CaveIconProps {
  type: 'coin' | 'gem' | 'treasure';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const CaveIcon: React.FC<CaveIconProps> = ({
  type,
  size = 'md',
  className = '',
  animate = false,
}) => {
  const iconClasses = cn(
    'cave-game-icon',
    `cave-game-icon-${type}`,
    size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
    animate && (type === 'coin' ? 'cave-game-coin' : 'cave-game-float'),
    className
  );

  return <span className={iconClasses} aria-hidden="true" />;
};

// مؤقت المغارة المخصص
interface CaveTimerProps {
  expiryTime: Date | string | number;
  onExpire?: () => void;
  className?: string;
  urgentThreshold?: number; // بالثواني
}

export const CaveTimer: React.FC<CaveTimerProps> = ({
  expiryTime,
  onExpire,
  className = '',
  urgentThreshold = 60, // افتراضيًا دقيقة واحدة
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiryTimeMs = typeof expiryTime === 'string' || typeof expiryTime === 'number' 
        ? new Date(expiryTime).getTime() 
        : expiryTime.getTime();
      const now = new Date().getTime();
      const difference = expiryTimeMs - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      // تحويل الفرق إلى ساعات ودقائق وثواني
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // تحديد ما إذا كان الوقت المتبقي أقل من العتبة الحرجة
      const totalSecondsLeft = hours * 3600 + minutes * 60 + seconds;
      setIsUrgent(totalSecondsLeft <= urgentThreshold);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire, urgentThreshold]);

  const { hours, minutes, seconds } = timeLeft;

  return (
    <div className={cn('cave-game-timer', isUrgent && 'cave-game-timer-urgent', className)}>
      <span className="font-mono tracking-wider">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// مؤثر الجسيمات للمغارة
interface CaveParticlesProps {
  count?: number;
  duration?: number;
  colors?: string[];
}

export const CaveParticles: React.FC<CaveParticlesProps> = ({
  count = 20,
  duration = 3,
  colors = ['#FFD700', '#FFC107', '#FF8C00', '#DAA520'],
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; tx: number; ty: number }>>([]);

  useEffect(() => {
    // إنشاء جسيمات عشوائية
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // موقع أفقي بالنسبة المئوية
      y: Math.random() * 100, // موقع رأسي بالنسبة المئوية
      size: Math.random() * 5 + 3, // حجم الجسيم
      color: colors[Math.floor(Math.random() * colors.length)], // لون عشوائي من المصفوفة
      tx: (Math.random() - 0.5) * 100, // مقدار الانتقال الأفقي
      ty: (Math.random() - 0.5) * 100, // مقدار الانتقال الرأسي
    }));

    setParticles(newParticles);

    // إعادة إنشاء الجسيمات بشكل دوري
    const interval = setInterval(() => {
      setParticles(prevParticles => {
        const updatedParticles = [...prevParticles];
        const particleToUpdate = Math.floor(Math.random() * count);
        
        updatedParticles[particleToUpdate] = {
          ...updatedParticles[particleToUpdate],
          x: Math.random() * 100,
          y: Math.random() * 100,
          tx: (Math.random() - 0.5) * 100,
          ty: (Math.random() - 0.5) * 100,
        };
        
        return updatedParticles;
      });
    }, duration * 1000 / 2); // تحديث نصف الجسيمات خلال مدة الرسوم المتحركة

    return () => clearInterval(interval);
  }, [count, duration, colors]);

  return (
    <div className="cave-game-particles">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="cave-game-particle"
          initial={{ opacity: 0.8, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: particle.tx,
            y: particle.ty,
          }}
          transition={{ duration, ease: 'easeOut' }}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
};

// مؤثر التحميل للمغارة
export const CaveLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={cn('cave-game-loading', className)} />;
};

// مؤثر الانتقال للمغارة
interface CaveTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CaveTransition: React.FC<CaveTransitionProps> = ({
  show,
  children,
  className = '',
}) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="transition"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// مكون منطقة التمرير للمغارة
interface CaveScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const CaveScrollArea: React.FC<CaveScrollAreaProps> = ({
  children,
  className = '',
  maxHeight = '400px',
}) => {
  return (
    <ScrollArea className={cn('rounded-md', className)} style={{ maxHeight }}>
      {children}
    </ScrollArea>
  );
};

// مكون الفاصل للمغارة
interface CaveSeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const CaveSeparator: React.FC<CaveSeparatorProps> = ({
  className = '',
  orientation = 'horizontal',
  decorative = true,
}) => {
  return (
    <Separator
      className={cn(
        'bg-gradient-to-r from-transparent via-amber-500 to-transparent',
        orientation === 'vertical' && 'bg-gradient-to-b from-transparent via-amber-500 to-transparent',
        className
      )}
      orientation={orientation}
      decorative={decorative}
    />
  );
};