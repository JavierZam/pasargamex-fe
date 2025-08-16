import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId()
  
  const baseStyles = "flex w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
  
  const variants = {
    default: "border-gray-600 focus:border-brand-red focus:ring-brand-red",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500",
  }
  
  const inputStyles = cn(
    baseStyles,
    error ? variants.error : variants.default,
    icon && iconPosition === 'left' && "pl-10",
    icon && iconPosition === 'right' && "pr-10",
    fullWidth && "w-full",
    className
  )

  return (
    <div className={cn("relative", fullWidth && "w-full")}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          className={inputStyles}
          ref={ref}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-400 text-xs mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input