'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NeuralButton } from '@/components/ui/neural-button';
import {
  Search,
  Eye,
  Edit,
  EyeOff,
  Trash2,
  Loader2,
  BookOpen,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Course {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    email: string;
  };
  status: string;
  moduleCount: number;
  updatedAt: string;
}

interface Module {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    email: string;
  };
  status: string;
  courseCount: number;
  difficultyLevel: string;
  questType: string;
  updatedAt: string;
}

export function ContentModerationView() {
  const [activeTab, setActiveTab] = useState<'courses' | 'modules'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [coursesRes, modulesRes] = await Promise.all([
          fetch('/api/admin/content/courses'),
          fetch('/api/admin/content/modules'),
        ]);

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses || []);
        }

        if (modulesRes.ok) {
          const modulesData = await modulesRes.json();
          setModules(modulesData.modules || []);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Unpublish course/module
  const handleUnpublish = async (type: 'course' | 'module', id: string, title: string) => {
    if (!confirm(`Unpublish "${title}"? This will hide it from students immediately.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/content/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, status: 'draft' }),
      });

      if (!response.ok) throw new Error('Failed to unpublish');

      // Update local state
      if (type === 'course') {
        setCourses(courses.map(c => c.id === id ? { ...c, status: 'draft' } : c));
      } else {
        setModules(modules.map(m => m.id === id ? { ...m, status: 'draft' } : m));
      }

      toast.success(`${type === 'course' ? 'Course' : 'Module'} unpublished successfully`);
    } catch (error) {
      console.error('Error unpublishing:', error);
      toast.error('Failed to unpublish');
    }
  };

  // Delete course/module
  const handleDelete = async (type: 'course' | 'module', id: string, title: string) => {
    const confirmMessage = type === 'course'
      ? `Permanently delete course "${title}"? This will remove it and all its relationships. This action cannot be undone.`
      : `Permanently delete module "${title}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/content/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Update local state
      if (type === 'course') {
        setCourses(courses.filter(c => c.id !== id));
      } else {
        setModules(modules.filter(m => m.id !== id));
      }

      toast.success(`${type === 'course' ? 'Course' : 'Module'} deleted successfully`);
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  // Filter data based on search
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neural-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Courses</p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.status === 'published').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Modules</p>
                <p className="text-2xl font-bold text-green-600">
                  {modules.filter(m => m.status === 'published').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 sm:gap-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${
              activeTab === 'courses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📚 Courses ({filteredCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${
              activeTab === 'modules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Modules ({filteredModules.length})
          </button>
        </nav>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>
              All courses created by faculty members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No courses found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map(course => (
                  <div
                    key={course.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                          <Badge variant={course.status === 'published' ? 'default' : 'outline'}>
                            {course.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Author: {course.author.name} ({course.author.email})</p>
                          <p>Modules: {course.moduleCount} • Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/courses/${course.slug}`} target="_blank">
                          <NeuralButton size="sm" variant="outline" title="View as student">
                            <Eye className="h-4 w-4" />
                          </NeuralButton>
                        </Link>
                        <Link href={`/faculty/courses/edit/${course.id}`}>
                          <NeuralButton size="sm" variant="outline" title="Edit course">
                            <Edit className="h-4 w-4" />
                          </NeuralButton>
                        </Link>
                        {course.status === 'published' && (
                          <NeuralButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnpublish('course', course.id, course.title)}
                            title="Unpublish (hide from students)"
                          >
                            <EyeOff className="h-4 w-4" />
                          </NeuralButton>
                        )}
                        <NeuralButton
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete('course', course.id, course.title)}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </NeuralButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>
              All modules created by faculty members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredModules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No modules found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredModules.map(module => (
                  <div
                    key={module.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg truncate">{module.title}</h3>
                          <Badge variant={module.status === 'published' ? 'default' : 'outline'}>
                            {module.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {module.difficultyLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {module.questType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Author: {module.author.name} ({module.author.email})</p>
                          <p>
                            Used in {module.courseCount} course{module.courseCount !== 1 ? 's' : ''} •
                            Updated {formatDistanceToNow(new Date(module.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/modules/${module.slug}`} target="_blank">
                          <NeuralButton size="sm" variant="outline" title="View as student">
                            <Eye className="h-4 w-4" />
                          </NeuralButton>
                        </Link>
                        <Link href={`/faculty/modules/edit/${module.id}`}>
                          <NeuralButton size="sm" variant="outline" title="Edit module">
                            <Edit className="h-4 w-4" />
                          </NeuralButton>
                        </Link>
                        {module.status === 'published' && (
                          <NeuralButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnpublish('module', module.id, module.title)}
                            title="Unpublish (hide from students)"
                          >
                            <EyeOff className="h-4 w-4" />
                          </NeuralButton>
                        )}
                        <NeuralButton
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete('module', module.id, module.title)}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </NeuralButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
