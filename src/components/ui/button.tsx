
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98] active:shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98] active:shadow-sm",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.98]",
        
        // Amazon-like buttons with modern touch
        amazon: "bg-gradient-to-b from-amber-400 to-amber-500 text-amazon-dark shadow-sm hover:from-amber-300 hover:to-amber-400 hover:shadow-md active:scale-[0.98] active:shadow-sm border border-amber-500/20",
        "amazon-alt": "bg-gradient-to-b from-gray-100 to-gray-200 text-amazon-dark shadow-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-[0.98] active:shadow-sm border border-gray-300/50",
        "amazon-buy": "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-sm hover:from-orange-600 hover:to-orange-700 hover:shadow-md active:scale-[0.98] active:shadow-sm border border-orange-600/20",
        
        // New modern variants
        "modern-primary": "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-transform duration-200",
        "modern-success": "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-transform duration-200",
        "modern-ghost": "bg-transparent text-foreground hover:bg-accent/50 active:bg-accent/70 active:scale-[0.98] transition-colors duration-200",
      },
      size: {
        default: "h-10 px-6 py-2 text-sm rounded-lg",
        sm: "h-8 px-4 text-xs rounded-md",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // When using asChild, ensure there's exactly one child element
    if (asChild && React.Children.count(children) !== 1) {
      console.error("Button with asChild prop must have exactly one child element");
      return null;
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), {
          "opacity-70 cursor-not-allowed": loading,
        })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
