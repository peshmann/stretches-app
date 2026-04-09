import { type ReactNode, type CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  style?: CSSProperties;
}

export function Card({ children, className = '', animate = true, style }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-white/5 p-4
        ${animate ? 'animate-fade-in-up' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
