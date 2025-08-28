import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with proper accessibility
          "flex h-10 w-full rounded-md border-2 px-3 py-2 text-sm transition-colors",
          // Light mode - high contrast
          "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500",
          // Dark mode - high contrast
          "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400",
          // Focus states - clearly visible
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
          "ring-offset-white dark:ring-offset-gray-900",
          // Hover states
          "hover:border-gray-400 dark:hover:border-gray-500",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "file:text-gray-900 dark:file:text-gray-100",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
