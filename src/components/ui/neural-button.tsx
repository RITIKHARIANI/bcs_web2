import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const neuralButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        neural:
          "bg-gradient-to-r from-neural-primary to-neural-medium text-primary-foreground hover:from-neural-deep hover:to-neural-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200",
        synaptic:
          "bg-gradient-to-r from-synapse-primary to-synapse-medium text-primary-foreground hover:from-synapse-deep hover:to-synapse-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200",
        cognitive:
          "bg-gradient-to-r from-cognition-teal to-cognition-green text-white hover:from-cognition-teal hover:to-cognition-teal shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        glass:
          "bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90",
        success:
          "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl",
        warning:
          "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px] sm:min-h-[40px]",
        sm: "h-9 rounded-md px-3 min-h-[44px] sm:min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[44px] sm:min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]",
      },
    },
    defaultVariants: {
      variant: "neural",
      size: "default",
    },
  }
)

export interface NeuralButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neuralButtonVariants> {
  asChild?: boolean
}

const NeuralButton = React.forwardRef<HTMLButtonElement, NeuralButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(neuralButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
NeuralButton.displayName = "NeuralButton"

export { NeuralButton, neuralButtonVariants }
