import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const labelVariants = cva(
  "font-bold leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-clear",
  {
    variants: {
      variant: {
        default: "text-medium-pro text-gray-800 mb-2 block",
        professional: "text-large-pro text-gray-900 mb-3 block font-extra-bold text-super-clear",
        fun: "text-xl-pro text-purple-800 mb-3 block font-extra-bold text-ultra-clear",
        small: "text-base-pro text-gray-700 mb-1 block font-bold",
        large: "text-2xl text-gray-900 mb-4 block font-ultra-bold text-ultra-clear",
        inline: "text-medium-pro text-gray-800 font-bold inline-block mr-2 rtl:ml-2 rtl:mr-0",
        required: "text-medium-pro text-gray-800 mb-2 block after:content-['*'] after:ml-1 after:text-red-500 after:font-bold"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }
