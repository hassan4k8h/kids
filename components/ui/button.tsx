import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group font-bold text-clear",
  {
    variants: {
      variant: {
        // Default: clean white button with black text
        default: "btn-pro bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-soft hover:shadow-medium",
        destructive: "btn-pro bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-medium hover:shadow-large",
        // Outline also white/black for consistency
        outline: "btn-pro border-2 border-gray-300 bg-white text-black hover:bg-gray-50 hover:border-gray-400 shadow-soft hover:shadow-medium",
        secondary: "btn-pro bg-white text-black border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-soft",
        ghost: "hover:bg-gray-100 text-black rounded-xl font-bold text-clear min-h-[clamp(48px,8vw,64px)] px-4",
        link: "text-black underline-offset-4 hover:underline font-bold text-clear",
        fun: "btn-fun bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 shadow-large hover:shadow-glow",
        professional: "btn-pro bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-medium hover:shadow-large border-2 border-white/20",
        success: "btn-pro bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-medium hover:shadow-large",
        warning: "btn-pro bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-medium hover:shadow-large",
        info: "btn-pro bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-medium hover:shadow-large"
      },
      size: {
        default: "min-h-[clamp(60px,10vw,80px)] px-6 py-3 text-medium-pro rounded-2xl",
        sm: "min-h-[clamp(48px,8vw,60px)] px-4 py-2 text-base-pro rounded-xl",
        lg: "min-h-[clamp(72px,12vw,96px)] px-8 py-4 text-large-pro rounded-2xl",
        xl: "min-h-[clamp(84px,14vw,112px)] px-10 py-5 text-xl-pro rounded-3xl",
        icon: "h-12 w-12 rounded-xl",
        full: "w-full min-h-[clamp(60px,10vw,80px)] px-6 py-3 text-medium-pro rounded-2xl"
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          'bg-white text-black border-2 border-gray-300 hover:bg-gray-50',
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect for enhanced buttons */}
        {(variant === "fun" || variant === "professional") && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12" />
        )}
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-3 text-super-clear">
          {children}
        </span>
        
        {/* Glow effect for fun variant */}
        {variant === "fun" && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
