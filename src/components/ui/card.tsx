
import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'gradient' | 'elevated' | 'flat' | 'red'
  hoverable?: boolean
  bordered?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = true, bordered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-card text-card-foreground transition-all duration-300",
          {
            // Base variants
            "border-border/50 bg-background": variant === 'default' && bordered,
            "bg-background": variant === 'default' && !bordered,
            "border-border/30 bg-transparent backdrop-blur-sm": variant === 'outline',
            "bg-gradient-to-br from-card to-card/80 border-0 shadow-lg overflow-hidden": variant === 'gradient',
            "shadow-lg hover:shadow-xl border-0 bg-background/80 backdrop-blur-sm": variant === 'elevated',
            "border-0 bg-gray-50 dark:bg-gray-800/50": variant === 'flat',
            "border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10": variant === 'red',
            
            // Border
            "border": bordered,
            
            // Hover effects
            "hover:-translate-y-1 hover:shadow-lg": hoverable,
            "shadow-sm hover:shadow-md": hoverable && !variant.includes('elevated'),
          },
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-2", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as = 'h3', ...props }, ref) => {
  const Component = as;
  return (
    <Component
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  type CardProps 
}
