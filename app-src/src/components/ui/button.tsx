import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // Base focus and ring styles that adapt to theme
          "ring-offset-white focus-visible:ring-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
          {
            // Default - Dark button with light text
            "bg-gray-900 text-gray-50 hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90": variant === 'default',
            
            // Destructive - Red button
            "bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-600 dark:text-gray-50 dark:hover:bg-red-600/90": variant === 'destructive',
            
            // Outline - Border with transparent background
            "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50": variant === 'outline',
            
            // Secondary - Light gray background
            "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80": variant === 'secondary',
            
            // Ghost - Visible text with hover background (FIXED)
            "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50": variant === 'ghost',
            
            // Link - Underlined text
            "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50": variant === 'link',
          },
          {
            "h-10 px-4 py-2": size === 'default',
            "h-9 rounded-md px-3": size === 'sm',
            "h-11 rounded-md px-8": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
