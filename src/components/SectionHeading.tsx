
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  title, 
  subtitle, 
  center = false,
  className
}) => {
  return (
    <div className={cn(
      'max-w-3xl mb-12',
      center ? 'mx-auto text-center' : '',
      className
    )}>
      <h2 className="text-3xl md:text-4xl font-semibold mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-600 text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
