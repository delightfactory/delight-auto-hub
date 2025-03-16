
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-md border p-3 [&>svg~*]:pl-6 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg]:text-foreground text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-gray-200 dark:border-gray-800",
        destructive:
          "border-amazon-warning/50 text-amazon-warning dark:border-amazon-warning [&>svg]:text-amazon-warning",
        success: 
          "border-amazon-success/30 text-amazon-success bg-amazon-success/10 [&>svg]:text-amazon-success",
        warning:
          "border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 [&>svg]:text-amber-500",
        info:
          "border-amazon-link/30 text-amazon-link bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 [&>svg]:text-amazon-link",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight text-sm", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
