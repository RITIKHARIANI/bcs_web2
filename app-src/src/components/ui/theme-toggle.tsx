'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = () => {
    // Cycle through: light -> dark -> light
    // If system, default to light first
    if (theme === 'light' || theme === 'system') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  // Determine the next theme for UI feedback
  const nextTheme = theme === 'light' || theme === 'system' ? 'dark' : 'light'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      className="relative text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500"
      title={`Switch to ${nextTheme} mode`}
      aria-label={`Switch to ${nextTheme} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle between light and dark mode</span>
    </Button>
  )
}
