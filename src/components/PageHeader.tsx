
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  backgroundImage,
  className
}) => {
  return (
    <div 
      className={cn(
        'relative py-24 md:py-32 overflow-hidden bg-slate-900',
        className
      )}
    >
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/90 z-10" />
      <div className="container-custom relative z-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
