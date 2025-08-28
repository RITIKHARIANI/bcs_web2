"use client";

import { cn } from "@/lib/utils";

interface SkipNavProps {
  targetId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SkipNav({ 
  targetId = "main-content", 
  className,
  children = "Skip to main content" 
}: SkipNavProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only",
        "absolute top-4 left-4 z-50",
        "bg-neural-primary text-white",
        "px-4 py-2 rounded-md",
        "font-medium text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-primary",
        "transition-all duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}
