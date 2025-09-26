"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PythonPlayground } from '../../../components/python-playground/python-playground';
import { NeuralButton } from '../../../components/ui/neural-button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { 
  Plus,
  Search,
  Code,
  Play,
  Users,
  Calendar,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Playground {
  id: string;
  title: string;
  description?: string;
  code: string;
  packages: string[];
  status: 'draft' | 'published';
  is_template: boolean;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    name: string;
    email: string;
  };
  modules?: {
    id: string;
    title: string;
    slug: string;
  };
  _count: {
    playground_executions: number;
  };
}

export default function FacultyPythonPlaygroundsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [templateFilter, setTemplateFilter] = useState<'all' | 'templates' | 'regular'>('all');
  const [showCreateNew, setShowCreateNew] = useState(false);

  const fetchPlaygrounds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (templateFilter === 'templates') params.append('isTemplate', 'true');
      if (templateFilter === 'regular') params.append('isTemplate', 'false');

      const response = await fetch(`/api/python-playgrounds?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch playgrounds');
      
      const data = await response.json();
      setPlaygrounds(data.playgrounds);
    } catch (error) {
      console.error('Error fetching playgrounds:', error);
      toast.error('Failed to load playgrounds');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, templateFilter]);

  useEffect(() => {
    if (!session?.user || session.user.role !== 'faculty') {
      router.push('/auth/login');
      return;
    }
    
    fetchPlaygrounds();
  }, [session, router, fetchPlaygrounds]);

  const handleCreatePlayground = async (code: string, title: string, description: string) => {
    try {
      const response = await fetch('/api/python-playgrounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          code,
          status: 'draft'
        }),
      });

      if (!response.ok) throw new Error('Failed to create playground');
      
      await fetchPlaygrounds();
      setShowCreateNew(false);
      toast.success('Playground created successfully');
    } catch (error) {
      console.error('Error creating playground:', error);
      throw error; // Let PythonPlayground component handle the error
    }
  };

  const handleDeletePlayground = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playground?')) return;

    try {
      const response = await fetch(`/api/python-playgrounds/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete playground');
      
      await fetchPlaygrounds();
      toast.success('Playground deleted successfully');
    } catch (error) {
      console.error('Error deleting playground:', error);
      toast.error('Failed to delete playground');
    }
  };

  const filteredPlaygrounds = playgrounds.filter(playground => {
    const matchesSearch = playground.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playground.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playground.users.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!session?.user || session.user.role !== 'faculty') {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Python Playgrounds
          </h1>
          <p className="text-muted-foreground">
            Create and manage interactive Python code demonstrations for your courses
          </p>
        </div>
        
        <NeuralButton
          onClick={() => setShowCreateNew(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Playground
        </NeuralButton>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search playgrounds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Types</option>
                <option value="templates">Templates</option>
                <option value="regular">Regular</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Playground */}
      {showCreateNew && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Create New Python Playground
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PythonPlayground
              title=""
              description=""
              onSave={handleCreatePlayground}
              className="border-0 shadow-none"
            />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <NeuralButton
                variant="outline"
                onClick={() => setShowCreateNew(false)}
              >
                Cancel
              </NeuralButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playgrounds List */}
      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlaygrounds.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No playgrounds found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No playgrounds match your search criteria.' : 'Create your first Python playground to get started.'}
            </p>
            {!searchTerm && (
              <NeuralButton onClick={() => setShowCreateNew(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Playground
              </NeuralButton>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredPlaygrounds.map((playground) => (
            <Card key={playground.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-neural-primary" />
                      {playground.title}
                    </CardTitle>
                    {playground.description && (
                      <p className="text-muted-foreground mt-1">
                        {playground.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={playground.status === 'published' ? 'default' : 'secondary'}>
                      {playground.status}
                    </Badge>
                    {playground.is_template && (
                      <Badge variant="outline">Template</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    <span>{playground._count.playground_executions} executions</span>
                  </div>
                  
                  {playground.packages.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>{playground.packages.length} packages</span>
                    </div>
                  )}
                  
                  {playground.modules && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{playground.modules.title}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(playground.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {playground.packages.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {playground.packages.map((pkg) => (
                      <Badge key={pkg} variant="outline" className="text-xs">
                        {pkg}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    by {playground.users.name}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <NeuralButton
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/faculty/python-playgrounds/${playground.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </NeuralButton>
                    
                    <NeuralButton
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/faculty/python-playgrounds/${playground.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </NeuralButton>
                    
                    <NeuralButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayground(playground.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </NeuralButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
