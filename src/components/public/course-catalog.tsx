"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { NeuralButton } from "@/components/ui/neural-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Loader2, 
  BookOpen,
  GraduationCap,
  Brain
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor: string;
  moduleCount: number;
  status: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

async function fetchCourses(): Promise<Course[]> {
  const response = await fetch('/api/courses');
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  const data = await response.json();
  return data.courses;
}

export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-neural-primary mb-2">Course Catalog</h1>
            <p className="text-lg text-muted-foreground">
              Explore comprehensive courses in Brain and Cognitive Sciences
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-neural-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-neural-primary mb-2">Course Catalog</h1>
            <p className="text-lg text-muted-foreground">
              Explore comprehensive courses in Brain and Cognitive Sciences
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Card className="cognitive-card">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Unable to Load Courses
              </h2>
              <p className="text-muted-foreground">
                Please try again later or contact support if the problem persists.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-neural">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-neural-primary">Course Catalog</h1>
              <p className="text-lg text-muted-foreground">
                Explore comprehensive courses in Brain and Cognitive Sciences
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-neural-primary" />
              <span className="text-sm text-muted-foreground">
                {courses.length} courses available
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-synapse-primary" />
              <span className="text-sm text-muted-foreground">
                Expert-designed content
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-cognition-teal" />
              <span className="text-sm text-muted-foreground">
                University-level curriculum
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses, topics, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-neural-light/30 focus:border-neural-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NeuralButton variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </NeuralButton>
            
            <div className="flex border border-border rounded-lg">
              <NeuralButton
                variant={viewMode === "grid" ? "neural" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </NeuralButton>
              <NeuralButton
                variant={viewMode === "list" ? "neural" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none border-l"
              >
                <List className="h-4 w-4" />
              </NeuralButton>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Course Grid/List */}
        {filteredCourses.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "space-y-6"
          }>
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                {...course}
                level="Beginner" // Default level for now
                rating={4.8} // Default rating for now
                students={0} // Will be calculated later
                duration="Varies" // Will be calculated based on modules
                image="/placeholder.svg" // Will use placeholder for now
                topics={course.tags}
              />
            ))}
          </div>
        ) : (
          <Card className="cognitive-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              {searchTerm ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse all available courses.
                  </p>
                  <NeuralButton 
                    variant="neural" 
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </NeuralButton>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No courses available yet
                  </h3>
                  <p className="text-muted-foreground">
                    Check back soon for new courses from our faculty.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
