import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  gaming?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', fullWidth = false, gaming = false, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      primary: gaming 
        ? "bg-gradient-to-r from-brand-red to-brand-blue text-white hover:shadow-lg hover:shadow-brand-red/25 focus-visible:ring-brand-red gaming-glow" 
        : "bg-brand-red text-white hover:bg-red-600 focus-visible:ring-brand-red",
      secondary: "bg-gray-700 text-white hover:bg-gray-600 focus-visible:ring-gray-500",
      outline: "border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 focus-visible:ring-gray-500",
      ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-gray-800 focus-visible:ring-gray-500",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
    }
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className={cn("flex-shrink-0", children && "mr-2")}>
            {icon}
          </span>
        )}
        
        {children}
        
        {icon && iconPosition === 'right' && !loading && (
          <span className={cn("flex-shrink-0", children && "ml-2")}>
            {icon}
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }