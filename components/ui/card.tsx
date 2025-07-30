import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const cardVariants = cva(
  "transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "card-pro bg-white/98 backdrop-blur-lg border border-white/40 shadow-medium hover:shadow-large",
        fun: "card-fun bg-white/95 backdrop-blur-md border-2 border-white/50 shadow-soft hover:shadow-large hover:scale-[1.02]",
        professional: "card-pro bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-xl border border-gray-200/60 shadow-large hover:shadow-glow",
        glass: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-large hover:shadow-glow hover:bg-white/25",
        elevated: "bg-white shadow-large hover:shadow-glow transform hover:-translate-y-2 border border-gray-100",
        minimal: "bg-white/60 backdrop-blur-sm border border-gray-200/40 shadow-soft hover:shadow-medium",
        gradient: "bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200/50 shadow-medium hover:shadow-large",
        dark: "bg-gray-900/90 backdrop-blur-lg border border-gray-700 text-white shadow-large"
      },
      size: {
        default: "rounded-2xl p-6",
        sm: "rounded-xl p-4",
        lg: "rounded-3xl p-8",
        xl: "rounded-3xl p-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 pb-4 border-b border-gray-100/60",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-extra-bold leading-tight tracking-tight text-super-clear text-xl-pro text-gray-800",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-base-pro text-muted-foreground font-medium leading-relaxed",
      className
    )}
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
    className={cn("pt-4 space-y-4", className)} 
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
    className={cn(
      "flex items-center pt-4 mt-4 border-t border-gray-100/60",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
