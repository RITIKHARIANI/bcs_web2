"use client";

import React from 'react'

interface StickyHeaderProps {
  children: React.ReactNode
  className?: string
}

export function StickyHeader({ children, className = '' }: StickyHeaderProps) {
  return (
    <header className={`sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      {children}
    </header>
  )
}
