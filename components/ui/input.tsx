import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const inputVariants = cva(
  "flex w-full transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-semi-bold text-clear",
  {
    variants: {
      variant: {
        default: "input-pro bg-white/95 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20",
        professional: "min-h-[clamp(56px,9vw,72px)] px-4 py-3 rounded-xl bg-white border-2 border-gray-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 shadow-soft focus:shadow-medium text-base-pro",
        fun: "min-h-[clamp(60px,10vw,80px)] px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 shadow-medium text-medium-pro",
        minimal: "min-h-[clamp(48px,8vw,60px)] px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-base-pro",
        outlined: "min-h-[clamp(52px,8.5vw,68px)] px-4 py-3 rounded-xl bg-transparent border-2 border-purple-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/20 text-base-pro",
        filled: "min-h-[clamp(52px,8.5vw,68px)] px-4 py-3 rounded-xl bg-purple-50 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-base-pro",
        large: "min-h-[clamp(64px,11vw,84px)] px-6 py-4 rounded-2xl bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 shadow-medium text-large-pro"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
