'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Module {
  id: string
  title: string
  moduleNumber: string
  description?: string
  content?: string
  sortOrder: number
  subModules: Module[]
}

interface Course {
  id: string
  title: string
  slug: string
  description?: string
  author: {
    name: string
  }
  tags: string[]
  featured: boolean
  modules: Module[]
  createdAt: string
  updatedAt: string
}

interface CourseDetailViewProps {
  course: Course
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const renderModuleTree = (modules: Module[], level: number = 0) => {
    return modules.map((moduleItem) => (
      <ModuleTreeItem
        key={moduleItem.id}
        module={moduleItem}
        level={level}
        isExpanded={expandedModules.has(moduleItem.id)}
        onToggleExpanded={() => toggleExpanded(moduleItem.id)}
        onSelect={() => setSelectedModule(moduleItem)}
        isSelected={selectedModule?.id === moduleItem.id}
      />
    ))
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Course Modules Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📚 Course Modules
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {course.modules.length} module{course.modules.length !== 1 ? 's' : ''} • Click to view content
            </p>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {course.modules.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4">
                  No modules available in this course yet.
                </p>
              ) : (
                renderModuleTree(course.modules)
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Instructor:</span>
              <p className="text-gray-600 dark:text-gray-400">{course.author.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatDate(course.updatedAt)}</p>
            </div>
            {course.tags.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {course.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2">
        {selectedModule ? (
          <ModuleContentView module={selectedModule} course={course} />
        ) : (
          <CourseOverview course={course} onSelectModule={setSelectedModule} />
        )}
      </div>
    </div>
  )
}

interface ModuleTreeItemProps {
  module: Module
  level: number
  isExpanded: boolean
  onToggleExpanded: () => void
  onSelect: () => void
  isSelected: boolean
}

function ModuleTreeItem({ 
  module, 
  level, 
  isExpanded, 
  onToggleExpanded, 
  onSelect, 
  isSelected 
}: ModuleTreeItemProps) {
  const hasSubmodules = module.subModules && module.subModules.length > 0
  const indentClass = `ml-${Math.min(level * 4, 12)}`

  return (
    <div className={indentClass}>
      <div className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}>
        <div className="flex items-center flex-1" onClick={onSelect}>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mr-2 min-w-0 flex-shrink-0">
            {module.moduleNumber}
          </span>
          <span className="text-sm font-medium truncate">
            {module.title}
          </span>
        </div>
        
        {hasSubmodules && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded()
            }}
            className="p-1 h-6 w-6 ml-2"
          >
            {isExpanded ? '▼' : '▶'}
          </Button>
        )}
      </div>
      
      {hasSubmodules && isExpanded && (
        <div className="mt-1">
          {module.subModules.map((subModule) => (
            <ModuleTreeItem
              key={subModule.id}
              module={subModule}
              level={level + 1}
              isExpanded={false}
              onToggleExpanded={() => {}}
              onSelect={() => onSelect()}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CourseOverviewProps {
  course: Course
  onSelectModule: (module: Module) => void
}

function CourseOverview({ course, onSelectModule }: CourseOverviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Course Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {course.description}
              </p>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Getting Started
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This course contains {course.modules.length} module{course.modules.length !== 1 ? 's' : ''} covering comprehensive topics in {course.title}. 
              Select any module from the sidebar to begin exploring the content.
            </p>
            
            {course.modules.length > 0 && (
              <Button onClick={() => onSelectModule(course.modules[0])}>
                Start with Module {course.modules[0].moduleNumber}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {course.modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📋 Course Outline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.modules.map((moduleItem) => (
                <div 
                  key={moduleItem.id}
                  className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => onSelectModule(moduleItem)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mr-3">
                        {moduleItem.moduleNumber}
                      </span>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {moduleItem.title}
                      </h4>
                    </div>
                    {moduleItem.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 ml-8">
                        {moduleItem.description}
                      </p>
                    )}
                    {moduleItem.subModules.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8">
                        {moduleItem.subModules.length} submodule{moduleItem.subModules.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    View →
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ModuleContentViewProps {
  module: Module
  course: Course
}

function ModuleContentView({ module, course }: ModuleContentViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mr-3">
                  Module {module.moduleNumber}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {course.title}
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {module.title}
              </CardTitle>
              {module.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {module.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {module.content ? (
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300"
              dangerouslySetInnerHTML={{ __html: module.content }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Content Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                This module is being prepared by the instructor. Please check back later for content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submodules */}
      {module.subModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📚 Submodules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {module.subModules.map((subModule) => (
                <Link
                  key={subModule.id}
                  href={`/modules/${subModule.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mr-3">
                          {subModule.moduleNumber}
                        </span>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {subModule.title}
                        </h4>
                      </div>
                      {subModule.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {subModule.description}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      View →
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
