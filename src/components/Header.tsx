"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Brain, Search, User, BookOpen, Menu, LogOut, X, Home, BarChart3, Settings, Plus } from "lucide-react";
import { NeuralButton } from "./ui/neural-button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Navigation configuration for extensibility
const navigationConfig = {
  public: [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/courses", label: "Library", icon: BookOpen }, // Temporary duplicate - can be refined later
  ],
  faculty: [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/faculty/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/faculty/modules", label: "My Modules", icon: BookOpen },
    { href: "/faculty/courses", label: "My Courses", icon: BookOpen },
    { href: "/faculty/modules/create", label: "Create Module", icon: Plus },
  ],
  // Future extensibility for student role
  student: [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/student/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/student/progress", label: "Progress", icon: BarChart3 },
  ]
};

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (session?.user?.role === "faculty") {
      return navigationConfig.faculty;
    } else if (session?.user?.role === "student") {
      return navigationConfig.student;
    } else {
      return navigationConfig.public;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2" aria-label="NeuroLearn - Go to homepage">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-neural" aria-hidden="true">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-neural-primary">
              NeuroLearn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium" role="navigation" aria-label="Main navigation">
            {navigationItems.slice(0, 4).map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex items-center space-x-1 thought-pathway transition-colors hover:text-neural-primary focus:text-neural-primary focus:outline-none focus:ring-2 focus:ring-neural-primary focus:ring-offset-2 rounded px-2 py-1"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Desktop Search */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search courses..."
                  className="h-9 w-[300px] bg-background pl-10 border-neural-light/30 focus:border-neural-primary"
                  aria-label="Search courses and topics"
                  role="searchbox"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <NeuralButton variant="synaptic" size="sm">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">{session.user.name}</span>
                  </NeuralButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {session && navigationItems.slice(2).map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <DropdownMenuItem key={item.href + item.label} asChild>
                        <Link href={item.href} className="flex items-center">
                          <IconComponent className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  {session && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/courses" className="hidden sm:inline-block">
                  <NeuralButton variant="ghost" size="sm">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Browse</span>
                  </NeuralButton>
                </Link>
                
                <Link href="/auth/login">
                  <NeuralButton variant="synaptic" size="sm">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Sign In</span>
                  </NeuralButton>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <NeuralButton 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </NeuralButton>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="h-9 w-full bg-background pl-10 border-neural-light/30 focus:border-neural-primary"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-3">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="flex items-center space-x-2 text-foreground hover:text-neural-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}