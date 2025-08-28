"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Brain, Search, User, BookOpen, Menu, LogOut } from "lucide-react";
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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo & Brand */}
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-neural">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-bold text-xl text-neural-primary sm:inline-block">
            NeuroLearn
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/courses"
            className="thought-pathway transition-colors hover:text-neural-primary"
          >
            Courses
          </Link>
          <Link
            href="/courses"
            className="thought-pathway transition-colors hover:text-neural-primary"
          >
            Library
          </Link>
          {session?.user?.role === "faculty" && (
            <Link
              href="/faculty/dashboard"
              className="thought-pathway transition-colors hover:text-neural-primary"
            >
              Faculty
            </Link>
          )}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Search */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses, topics, research..."
                className="h-9 w-full bg-background pl-10 md:w-[300px] lg:w-[400px] border-neural-light/30 focus:border-neural-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <NeuralButton variant="synaptic" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.user.name}</span>
                </NeuralButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
              <Link href="/courses">
                <NeuralButton variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Browse</span>
                </NeuralButton>
              </Link>
              
              <Link href="/auth/login">
                <NeuralButton variant="synaptic" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </NeuralButton>
              </Link>
            </>
          )}

          <NeuralButton variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </NeuralButton>
        </div>
      </div>
    </header>
  );
}