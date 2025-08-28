"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { NeuralButton } from "@/components/ui/neural-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Brain
} from "lucide-react";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface FacultyDashboardProps {
  user: User;
}

export function FacultyDashboard({ user }: FacultyDashboardProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neural">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neural-primary">
                  Faculty Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
            </div>
            <NeuralButton variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </NeuralButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="cognitive-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-neural-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Modules</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cognitive-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-synapse-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cognitive-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-cognition-teal" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cognitive-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-cognition-orange" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Views</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cognitive-card hover:shadow-neural transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5 text-neural-primary" />
                Create Module
              </CardTitle>
              <CardDescription>
                Build standalone learning modules with rich content and media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/faculty/modules/create">
                <NeuralButton variant="neural" className="w-full">
                  Create New Module
                </NeuralButton>
              </Link>
            </CardContent>
          </Card>

          <Card className="cognitive-card hover:shadow-synaptic transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-synapse-primary" />
                Create Course
              </CardTitle>
              <CardDescription>
                Assemble courses by selecting and organizing existing modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/faculty/courses/create">
                <NeuralButton variant="synaptic" className="w-full">
                  Create New Course
                </NeuralButton>
              </Link>
            </CardContent>
          </Card>

          <Card className="cognitive-card hover:shadow-cognitive transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-cognition-teal" />
                Module Library
              </CardTitle>
              <CardDescription>
                Browse and manage your existing modules and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/faculty/modules">
                <NeuralButton variant="cognitive" className="w-full">
                  View All Modules
                </NeuralButton>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="cognitive-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest modules and courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to NeuroLearn
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first module or course to see activity here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/faculty/modules/create">
                  <NeuralButton variant="neural">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Module
                  </NeuralButton>
                </Link>
                <Link href="/faculty/courses/create">
                  <NeuralButton variant="synaptic">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </NeuralButton>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
