"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Brain, Search, User, BookOpen, Menu, LogOut, X } from "lucide-react";
import { NeuralButton } from "./ui/neural-button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

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
            <Link
              href="/courses"
              className="thought-pathway transition-colors hover:text-neural-primary focus:text-neural-primary focus:outline-none focus:ring-2 focus:ring-neural-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              Courses
            </Link>
            <Link
              href="/courses"
              className="thought-pathway transition-colors hover:text-neural-primary focus:text-neural-primary focus:outline-none focus:ring-2 focus:ring-neural-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              Library
            </Link>
            {session?.user?.role === "faculty" && (
              <Link
                href="/faculty/dashboard"
                className="thought-pathway transition-colors hover:text-neural-primary focus:text-neural-primary focus:outline-none focus:ring-2 focus:ring-neural-primary focus:ring-offset-2 rounded px-2 py-1"
              >
                Faculty
              </Link>
            )}
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
                  {session.user.role === "faculty" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/faculty/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/faculty/modules">My Modules</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/faculty/courses">My Courses</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
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
                <Link
                  href="/courses"
                  className="text-foreground hover:text-neural-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </Link>
                <Link
                  href="/courses"
                  className="text-foreground hover:text-neural-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Library
                </Link>
                {session?.user?.role === "faculty" && (
                  <Link
                    href="/faculty/dashboard"
                    className="text-foreground hover:text-neural-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Faculty Dashboard
                  </Link>
                )}
                {!session && (
                  <Link
                    href="/courses"
                    className="text-foreground hover:text-neural-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse Courses
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}