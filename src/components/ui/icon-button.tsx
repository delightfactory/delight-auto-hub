
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-95 touch-manipulation",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-95 touch-manipulation",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-95 touch-manipulation",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-95 touch-manipulation",
        link: "text-primary underline-offset-4 hover:underline active:scale-95 touch-manipulation",
        red: "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:scale-95 touch-manipulation",
        "red-outline": "border border-red-600 text-red-600 bg-transparent shadow-sm hover:bg-red-50 hover:text-red-700 hover:shadow-md active:scale-95 touch-manipulation",
      },
      size: {
        default: "h-10 w-10",
        sm: "h-8 w-8 text-sm",
        lg: "h-12 w-12 text-lg",
        xl: "h-14 w-14 text-xl",
        "2xl": "h-16 w-16 text-2xl",
        touch: "h-12 w-12 md:h-10 md:w-10", // Larger on mobile, normal on desktop
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
  loading?: boolean
  tooltip?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, loading = false, disabled, tooltip, children, ...props }, ref) => {
    const buttonContent = (
      <>
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </>
    );

    // Basic button without tooltip
    if (!tooltip) {
      return (
        <button
          className={cn(iconButtonVariants({ variant, size, className }), {
            "opacity-70 cursor-not-allowed": loading,
          })}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {buttonContent}
        </button>
      );
    }

    // Button with tooltip (simple implementation without requiring another component)
    return (
      <div className="relative group">
        <button
          className={cn(iconButtonVariants({ variant, size, className }), {
            "opacity-70 cursor-not-allowed": loading,
          })}
          ref={ref}
          disabled={disabled || loading}
          aria-label={tooltip}
          {...props}
        >
          {buttonContent}
        </button>
        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {tooltip}
        </span>
      </div>
    );
  }
)

IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
