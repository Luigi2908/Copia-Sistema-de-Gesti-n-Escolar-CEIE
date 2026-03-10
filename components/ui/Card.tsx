
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const hasPaddingOverride = className.includes('p-0') || className.includes('p-1') || className.includes('p-2') || className.includes('p-3') || className.includes('p-4') || className.includes('p-5') || className.includes('p-6');
  const defaultPadding = hasPaddingOverride ? '' : 'p-6';

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:bg-slate-900/80 dark:border-slate-800/60 ${defaultPadding} ${className} transition-all duration-300`}>
      {children}
    </div>
  );
};

export default Card;