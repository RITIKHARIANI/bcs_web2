"use client";

import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  className?: string;
}

/**
 * Common application layout that includes the navigation header
 * and optional footer across all pages.
 * 
 * Features:
 * - Consistent header navigation with role-based visibility
 * - Optional footer (enabled by default)
 * - Responsive design
 * - Accessibility support
 */
export function AppLayout({ 
  children, 
  showFooter = true, 
  className = "" 
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header />
      <main 
        id="main-content" 
        className="flex-1" 
        role="main" 
        aria-label="Main content"
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

/**
 * Layout specifically for authenticated pages that require login
 */
export function AuthenticatedLayout({ 
  children, 
  showFooter = false, 
  className = "" 
}: AppLayoutProps) {
  return (
    <AppLayout 
      showFooter={showFooter} 
      className={`bg-background ${className}`}
    >
      {children}
    </AppLayout>
  );
}

/**
 * Layout for public pages (courses, landing page, etc.)
 */
export function PublicLayout({ 
  children, 
  showFooter = true, 
  className = "" 
}: AppLayoutProps) {
  return (
    <AppLayout 
      showFooter={showFooter} 
      className={className}
    >
      {children}
    </AppLayout>
  );
}
