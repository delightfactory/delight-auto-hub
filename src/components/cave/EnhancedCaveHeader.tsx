import React from 'react';
import { CaveSession, CaveEvent } from '@/types/db';

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface PurchaseLimit {
  remaining: number;
  total: number;
}

interface EnhancedCaveHeaderProps {
  session: CaveSession | null;
  event: CaveEvent | null;
  remainingTime: TimeRemaining;
  purchaseLimit: PurchaseLimit;
  userPoints: number;
}

const EnhancedCaveHeader: React.FC<EnhancedCaveHeaderProps> = ({
  session,
  event,
  remainingTime,
  purchaseLimit,
  userPoints
}) => {
  return (
    <header className="cave-enhanced-header">
      <div className="cave-enhanced-header-container">
        <div className="cave-enhanced-header-section">
          <div className="cave-enhanced-purchase-limit">
            <div className="cave-enhanced-limit-progress">
              <div
                className="cave-enhanced-limit-bar"
                style={{ width: `${(purchaseLimit.remaining / purchaseLimit.total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold">
              {purchaseLimit.remaining}/{purchaseLimit.total}
            </span>
            <div className="cave-enhanced-icon cave-enhanced-icon-coin" />
          </div>
        </div>

        <div className="cave-enhanced-header-section">
          <div className="cave-enhanced-gems-display">
            <div className="cave-enhanced-icon cave-enhanced-icon-gem" />
            <span className="cave-enhanced-points text-sm font-bold">{userPoints}</span>
          </div>

          <div className="cave-enhanced-timer-display px-1 py-0.5">
            <div className="cave-enhanced-icon cave-enhanced-icon-hourglass cave-enhanced-float" />
            <div className="cave-enhanced-glow flex items-center justify-center gap-1 font-mono text-sm font-bold text-white" dir="ltr">
              <span>{String(remainingTime.hours).padStart(2, '0')}</span>
              <span className="cave-enhanced-price -mt-1">:</span>
              <span>{String(remainingTime.minutes).padStart(2, '0')}</span>
              <span className="cave-enhanced-price -mt-1">:</span>
              <span>{String(remainingTime.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedCaveHeader;
