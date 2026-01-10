
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className, 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold tracking-tight transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 disabled:grayscale-[0.5]";
  
  const variants = {
    primary: "bg-[#E35336] text-white shadow-md shadow-[#E35336]/10 hover:bg-[#8A2B0E] hover:shadow-lg",
    secondary: "bg-[#8A2B0E] text-white hover:bg-[#E35336] shadow-sm",
    outline: "border border-[#9988A1]/20 bg-white text-[#8A2B0E] hover:bg-[#FDF8F3]",
    ghost: "text-[#9988A1] hover:text-[#8A2B0E] hover:bg-black/5",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-13 px-8 text-base"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={isLoading || disabled} 
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("rounded-2xl bg-white border border-[#9988A1]/10 shadow-sm", className)}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default'; className?: string }> = ({ children, variant = 'default', className }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    default: "bg-[#9988A1]/5 text-[#9988A1] border-[#9988A1]/10"
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border", styles[variant], className)}>
      {children}
    </span>
  );
};
