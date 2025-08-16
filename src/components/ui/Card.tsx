import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gaming' | 'glass' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  glow?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  glow = false,
  children,
  ...props
}, ref) => {
  
  const baseStyles = "rounded-xl transition-all duration-200"
  
  const variants = {
    default: "bg-gray-800 border border-gray-700",
    gaming: "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 shadow-xl",
    glass: "bg-gray-800/30 backdrop-blur-sm border border-gray-600/50",
    elevated: "bg-gray-800 border border-gray-700 shadow-2xl shadow-black/50"
  }
  
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8"
  }
  
  const hoverEffects = {
    default: "hover:border-gray-600",
    gaming: "hover:border-brand-red/50 hover:shadow-2xl hover:shadow-brand-red/10",
    glass: "hover:bg-gray-800/40 hover:border-gray-500/70",
    elevated: "hover:shadow-2xl hover:shadow-black/70 hover:border-gray-600"
  }

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hover && hoverEffects[variant],
        glow && variant === 'gaming' && "gaming-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

// Card sub-components
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  >
    {children}
  </div>
))

CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  >
    {children}
  </h3>
))

CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  >
    {children}
  </p>
))

CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("pt-0", className)}
    {...props}
  >
    {children}
  </div>
))

CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  >
    {children}
  </div>
))

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }