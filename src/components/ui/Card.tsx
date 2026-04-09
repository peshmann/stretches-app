import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function Card({ children, className = '', animate = true }: CardProps) {
  return (
    <div className={`bg-surface rounded-xl border border-white/5 p-4
      ${animate ? 'animate-fade-in-up' : ''} ${className}`}>
      {children}
    </div>
  );
}
