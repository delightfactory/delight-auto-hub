import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface CaveCountdownProps {
  endTime: Date | string | number;
  onExpire?: () => void;
  className?: string;
  urgentThreshold?: number; // بالثواني
  showLabel?: boolean;
  labelPosition?: 'left' | 'top';
}

const CaveCountdown: React.FC<CaveCountdownProps> = ({
  endTime,
  onExpire,
  className = '',
  urgentThreshold = 1800, // 30 دقيقة افتراضيًا
  showLabel = true,
  labelPosition = 'left'
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimeMs = typeof endTime === 'string' || typeof endTime === 'number' 
        ? new Date(endTime).getTime() 
        : endTime.getTime();
      const now = new Date().getTime();
      const difference = endTimeMs - now;

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
  }, [endTime, onExpire, urgentThreshold]);

  const { hours, minutes, seconds } = timeLeft;

  const timerClasses = cn(
    'font-mono tracking-wider text-sm',
    isUrgent ? 'text-red-500 animate-pulse' : 'text-amber-600',
    className
  );

  const containerClasses = cn(
    'flex items-center gap-2 p-1 rounded-md',
    labelPosition === 'top' ? 'flex-col' : 'flex-row',
    isUrgent ? 'bg-red-100 animate-pulse' : ''
  );

  return (
    <div role="timer" aria-live="polite" aria-label={`الوقت المتبقي ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`} className={containerClasses}>
      {showLabel && (
        <Clock aria-hidden="true" className={cn('w-4 h-4', isUrgent ? 'text-red-500' : 'text-purple-400')} />
      )}
      <div className={timerClasses}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

export default CaveCountdown;