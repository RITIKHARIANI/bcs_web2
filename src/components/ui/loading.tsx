"use client";

import { cn } from "@/lib/utils";
import { Loader2, Brain } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "neural" | "dots";
  className?: string;
  text?: string;
}

export function Loading({ 
  size = "md", 
  variant = "spinner", 
  className,
  text = "Loading..." 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "neural") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)} role="status" aria-live="polite">
        <div className="relative">
          <Brain className={cn("text-neural-primary animate-pulse", sizeClasses[size])} />
          <div className="absolute inset-0 animate-ping">
            <Brain className={cn("text-neural-primary/30", sizeClasses[size])} />
          </div>
        </div>
        <span className={cn("text-muted-foreground", textSizeClasses[size])} aria-label={text}>
          {text}
        </span>
        <span className="sr-only">Content is loading, please wait.</span>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)} role="status" aria-live="polite">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-neural-primary rounded-full animate-bounce",
                size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <span className={cn("text-muted-foreground ml-3", textSizeClasses[size])}>
          {text}
        </span>
        <span className="sr-only">Content is loading, please wait.</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center space-x-3", className)} role="status" aria-live="polite">
      <Loader2 className={cn("animate-spin text-neural-primary", sizeClasses[size])} />
      <span className={cn("text-muted-foreground", textSizeClasses[size])}>
        {text}
      </span>
      <span className="sr-only">Content is loading, please wait.</span>
    </div>
  );
}
