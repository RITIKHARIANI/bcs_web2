'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Module {
  id: string
  title: string
  description?: string
  moduleNumber: string
  status: string
  sortOrder: number
  parentModuleId: string | null
  createdAt: string
  updatedAt: string
  subModules: Module[]
  _count?: {
    courseModules: number
    subModules: number
  }
}

interface HierarchicalModuleLibraryProps {
  searchTerm?: string
}

interface SortableModuleItemProps {
  moduleItem: Module
  level: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCreateSubmodule: (parentId: string) => void
  expandedModules: Set<string>
  onToggleExpand: (id: string) => void
}

function SortableModuleItem({
  moduleItem,
  level,
  onEdit,
  onDelete,
  onCreateSubmodule,
  expandedModules,
  onToggleExpand
}: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: moduleItem.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasSubmodules = moduleItem.subModules && moduleItem.subModules.length > 0
  const isExpanded = expandedModules.has(moduleItem.id)
  const indentationClass = `ml-${Math.min(level * 4, 16)}`

  return (
    <div ref={setNodeRef} style={style} className={`${indentationClass} space-y-2`}>
      <Card className={`hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {/* Drag Handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                  title="Drag to reorder"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                </div>

                {/* Expand/Collapse Button */}
                {hasSubmodules && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpand(moduleItem.id)}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? '▼' : '▶'}
                  </Button>
                )}

                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {moduleItem.moduleNumber}
                </span>
                
                <span className={`text-xs px-2 py-1 rounded-full ${
                  moduleItem.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {moduleItem.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {moduleItem.title}
              </h3>
              
              {moduleItem.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {moduleItem.description}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Used in {moduleItem._count?.courseModules || 0} course{(moduleItem._count?.courseModules || 0) !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{moduleItem._count?.subModules || 0} submodule{(moduleItem._count?.subModules || 0) !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Updated {formatDate(moduleItem.updatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCreateSubmodule(moduleItem.id)}
                className="text-blue-600 hover:text-blue-700"
                title="Create Submodule"
              >
                + Sub
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(moduleItem.id)}
                className="text-gray-600 hover:text-gray-700"
                title="Edit Module"
              >
                Edit
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(moduleItem.id)}
                className="text-red-600 hover:text-red-700"
                title="Delete Module"
                disabled={(moduleItem._count?.courseModules || 0) > 0 || (moduleItem._count?.subModules || 0) > 0}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render submodules if expanded */}
      {hasSubmodules && isExpanded && (
        <SortableContext
          items={moduleItem.subModules.map(sub => sub.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {moduleItem.subModules.map((subModule) => (
              <SortableModuleItem
                key={subModule.id}
                moduleItem={subModule}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreateSubmodule={onCreateSubmodule}
                expandedModules={expandedModules}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

export function HierarchicalModuleLibrary({ searchTerm = '' }: HierarchicalModuleLibraryProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (modules.length > 0 && expandedModules.size === 0) {
      // Auto-expand top-level modules initially
      const topLevelIds = modules
        .filter(m => !m.parentModuleId)
        .slice(0, 3)
        .map(m => m.id)
      setExpandedModules(new Set(topLevelIds))
    }
  }, [modules])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/modules')
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules')
      }
      
      const data = await response.json()
      setModules(data.modules || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    // Find the modules being reordered
    const activeModule = findModuleById(modules, active.id as string)
    const overModule = findModuleById(modules, over.id as string)

    if (!activeModule || !overModule) {
      return
    }

    // Check if they have the same parent (only allow reordering within same level)
    if (activeModule.parentModuleId !== overModule.parentModuleId) {
      return
    }

    // Get siblings at the same level
    const siblings = modules.filter(m => m.parentModuleId === activeModule.parentModuleId)
    const oldIndex = siblings.findIndex(m => m.id === active.id)
    const newIndex = siblings.findIndex(m => m.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder the siblings
    const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex)
    
    // Create module updates with new sort orders
    const moduleUpdates = reorderedSiblings.map((moduleItem, index) => ({
      id: moduleItem.id,
      sortOrder: index,
      parentModuleId: moduleItem.parentModuleId,
    }))

    try {
      const response = await fetch('/api/modules/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moduleUpdates }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder modules')
      }

      // Refresh modules to get updated numbering
      await fetchModules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder modules')
    }
  }

  const handleEdit = (id: string) => {
    window.location.href = `/faculty/modules/edit/${id}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/modules/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete module')
      }

      await fetchModules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module')
    }
  }

  const handleCreateSubmodule = (parentId: string) => {
    window.location.href = `/faculty/modules/create?parent=${parentId}`
  }

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedModules(newExpanded)
  }

  const handleExpandAll = () => {
    const allModuleIds = getAllModuleIds(modules)
    setExpandedModules(new Set(allModuleIds))
  }

  const handleCollapseAll = () => {
    setExpandedModules(new Set())
  }

  // Filter modules based on search term
  const filteredModules = modules.filter(moduleItem => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      moduleItem.title.toLowerCase().includes(searchLower) ||
      moduleItem.description?.toLowerCase().includes(searchLower) ||
      moduleItem.moduleNumber.toLowerCase().includes(searchLower)
    )
  })

  // Get only top-level modules for the main sortable context
  const topLevelModules = filteredModules.filter(m => !m.parentModuleId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchModules}>Try Again</Button>
      </div>
    )
  }

  if (filteredModules.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules found</h3>
        <p className="text-gray-600 mb-6">
          {searchTerm ? 'No modules match your search criteria.' : 'Start by creating your first module.'}
        </p>
        <Link href="/faculty/modules/create">
          <Button>Create Your First Module</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tree Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExpandAll}
            className="text-blue-600"
          >
            Expand All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
            className="text-blue-600"
          >
            Collapse All
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topLevelModules.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {topLevelModules.map((moduleItem) => (
              <SortableModuleItem
                key={moduleItem.id}
                moduleItem={moduleItem}
                level={0}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreateSubmodule={handleCreateSubmodule}
                expandedModules={expandedModules}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 opacity-90">
              <span className="font-medium">
                {findModuleById(modules, activeId)?.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

// Helper functions
function findModuleById(modules: Module[], id: string): Module | null {
  for (const moduleItem of modules) {
    if (moduleItem.id === id) {
      return moduleItem
    }
    if (moduleItem.subModules) {
      const found = findModuleById(moduleItem.subModules, id)
      if (found) return found
    }
  }
  return null
}

function getAllModuleIds(modules: Module[]): string[] {
  const ids: string[] = []
  modules.forEach(moduleItem => {
    ids.push(moduleItem.id)
    if (moduleItem.subModules) {
      ids.push(...getAllModuleIds(moduleItem.subModules))
    }
  })
  return ids
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
