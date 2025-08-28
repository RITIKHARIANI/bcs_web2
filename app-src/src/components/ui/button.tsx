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
          // Base styles with proper focus states
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "ring-offset-white dark:ring-offset-gray-950",
          {
            // Default - High contrast primary button
            "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:active:bg-blue-800": variant === 'default',
            
            // Destructive - High contrast red button  
            "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 dark:active:bg-red-800": variant === 'destructive',
            
            // Outline - Clear borders with proper contrast
            "border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:border-gray-500 dark:active:bg-gray-700": variant === 'outline',
            
            // Secondary - Muted but visible
            "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500": variant === 'secondary',
            
            // Ghost - Clear text with proper hover states
            "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700": variant === 'ghost',
            
            // Link - Accessible link styling
            "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 active:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200": variant === 'link',
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
