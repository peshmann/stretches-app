import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-glow text-white',
  secondary: 'bg-surface border border-primary/30 hover:border-primary text-text',
  ghost: 'bg-transparent hover:bg-white/5 text-text-muted hover:text-text',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[44px] px-4 text-sm',
  md: 'min-h-[48px] px-6 text-base',
  lg: 'min-h-[56px] px-8 text-lg w-full',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
