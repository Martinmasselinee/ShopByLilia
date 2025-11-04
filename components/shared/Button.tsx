import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  isLoading?: boolean
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-accent text-text hover:bg-accent/80',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Chargement...' : children}
    </button>
  )
}

