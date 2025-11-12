/**
 * Module Hierarchy Helper Functions
 *
 * Utilities for building and navigating hierarchical module structures
 */

import { prisma } from '@/lib/db'

export interface ModuleTreeNode {
  id: string
  title: string
  slug: string
  description: string | null
  parent_module_id: string | null
  sort_order: number
  status: string
  created_at: Date
  updated_at: Date
  children: ModuleTreeNode[]
  depth: number
  numbering: string
}

export interface ModuleBreadcrumb {
  id: string
  title: string
  slug: string
}

export interface ModuleSiblings {
  previous: {
    id: string
    title: string
    slug: string
  } | null
  next: {
    id: string
    title: string
    slug: string
  } | null
}

/**
 * Fetch full breadcrumb trail from root to current module
 */
export async function getModuleBreadcrumbs(moduleId: string): Promise<ModuleBreadcrumb[]> {
  const breadcrumbs: ModuleBreadcrumb[] = []
  let currentId: string | null = moduleId

  // Traverse up the tree to collect ancestors
  while (currentId) {
    const moduleData = await prisma.modules.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        title: true,
        slug: true,
        parent_module_id: true,
      },
    })

    if (!moduleData) break

    breadcrumbs.unshift({
      id: moduleData.id,
      title: moduleData.title,
      slug: moduleData.slug,
    })

    currentId = moduleData.parent_module_id
  }

  return breadcrumbs
}

/**
 * Fetch siblings (previous and next) at the same level
 */
export async function getModuleSiblings(moduleId: string): Promise<ModuleSiblings> {
  const currentModule = await prisma.modules.findUnique({
    where: { id: moduleId },
    select: {
      parent_module_id: true,
      sort_order: true,
    },
  })

  if (!currentModule) {
    return { previous: null, next: null }
  }

  // Find all siblings (modules with same parent)
  const siblings = await prisma.modules.findMany({
    where: {
      parent_module_id: currentModule.parent_module_id,
      status: 'published',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      sort_order: true,
    },
    orderBy: {
      sort_order: 'asc',
    },
  })

  const currentIndex = siblings.findIndex((m) => m.id === moduleId)

  return {
    previous: currentIndex > 0 ? siblings[currentIndex - 1] : null,
    next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null,
  }
}

/**
 * Build hierarchical tree structure from flat array of modules
 */
export function buildModuleTree(
  modules: Array<{
    id: string
    title: string
    slug: string
    description: string | null
    parent_module_id: string | null
    sort_order: number
    status: string
    created_at: Date
    updated_at: Date
  }>,
  parentId: string | null = null,
  depth: number = 0
): ModuleTreeNode[] {
  const children = modules
    .filter((m) => m.parent_module_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)

  return children.map((module, index) => ({
    ...module,
    children: buildModuleTree(modules, module.id, depth + 1),
    depth,
    numbering: '', // Will be set by generateModuleNumbering
  }))
}

/**
 * Generate hierarchical numbering for tree nodes (1, 1.1, 1.2, 1.2.1, etc.)
 */
export function generateModuleNumbering(
  tree: ModuleTreeNode[],
  prefix: string = ''
): Map<string, string> {
  const numbering = new Map<string, string>()

  tree.forEach((node, index) => {
    const number = prefix ? `${prefix}.${index + 1}` : `${index + 1}`
    numbering.set(node.id, number)

    if (node.children.length > 0) {
      const childNumbering = generateModuleNumbering(node.children, number)
      childNumbering.forEach((value, key) => {
        numbering.set(key, value)
      })
    }
  })

  return numbering
}

/**
 * Apply numbering to tree nodes (mutates tree)
 */
export function applyNumberingToTree(
  tree: ModuleTreeNode[],
  numbering: Map<string, string>
): void {
  tree.forEach((node) => {
    node.numbering = numbering.get(node.id) || ''
    if (node.children.length > 0) {
      applyNumberingToTree(node.children, numbering)
    }
  })
}

/**
 * Fetch entire module tree for a course
 */
export async function getCourseModuleTree(courseId: string): Promise<ModuleTreeNode[]> {
  // Fetch all modules in the course
  const courseModules = await prisma.course_modules.findMany({
    where: {
      course_id: courseId,
    },
    include: {
      modules: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          parent_module_id: true,
          sort_order: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
    orderBy: {
      sort_order: 'asc',
    },
  })

  const modules = courseModules.map((cm) => cm.modules)

  // Build tree structure
  const tree = buildModuleTree(modules)

  // Generate and apply numbering
  const numbering = generateModuleNumbering(tree)
  applyNumberingToTree(tree, numbering)

  return tree
}

/**
 * Fetch module tree for a standalone module (root + all descendants)
 */
export async function getStandaloneModuleTree(moduleId: string): Promise<{
  tree: ModuleTreeNode[]
  rootId: string
}> {
  // First, find the root module by traversing up
  let rootId = moduleId
  let currentId: string | null = moduleId

  while (currentId) {
    const moduleData = await prisma.modules.findUnique({
      where: { id: currentId },
      select: { id: true, parent_module_id: true },
    })

    if (!moduleData) break

    rootId = moduleData.id
    currentId = moduleData.parent_module_id
  }

  // Now fetch all modules in this tree (descendants of root)
  const allModules = await fetchDescendants(rootId)

  // Build tree structure
  const tree = buildModuleTree(allModules)

  // Generate and apply numbering
  const numbering = generateModuleNumbering(tree)
  applyNumberingToTree(tree, numbering)

  return { tree, rootId }
}

/**
 * Recursively fetch all descendants of a module
 */
async function fetchDescendants(
  moduleId: string,
  collected: Array<{
    id: string
    title: string
    slug: string
    description: string | null
    parent_module_id: string | null
    sort_order: number
    status: string
    created_at: Date
    updated_at: Date
  }> = []
): Promise<
  Array<{
    id: string
    title: string
    slug: string
    description: string | null
    parent_module_id: string | null
    sort_order: number
    status: string
    created_at: Date
    updated_at: Date
  }>
> {
  // Fetch current module
  const currentModule = await prisma.modules.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      parent_module_id: true,
      sort_order: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
  })

  if (!currentModule) return collected

  collected.push(currentModule)

  // Fetch children
  const children = await prisma.modules.findMany({
    where: {
      parent_module_id: moduleId,
      status: 'published',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      parent_module_id: true,
      sort_order: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
  })

  // Recursively fetch descendants of each child
  for (const child of children) {
    await fetchDescendants(child.id, collected)
  }

  return collected
}

/**
 * Find a node in the tree by ID
 */
export function findNodeInTree(
  tree: ModuleTreeNode[],
  nodeId: string
): ModuleTreeNode | null {
  for (const node of tree) {
    if (node.id === nodeId) return node

    const found = findNodeInTree(node.children, nodeId)
    if (found) return found
  }

  return null
}

/**
 * Get all ancestor IDs for a module (for auto-expanding tree)
 */
export function getAncestorIds(tree: ModuleTreeNode[], targetId: string): string[] {
  const ancestors: string[] = []

  function traverse(nodes: ModuleTreeNode[], path: string[]): boolean {
    for (const node of nodes) {
      const currentPath = [...path, node.id]

      if (node.id === targetId) {
        ancestors.push(...path)
        return true
      }

      if (traverse(node.children, currentPath)) {
        return true
      }
    }
    return false
  }

  traverse(tree, [])
  return ancestors
}

/**
 * Flatten tree to array (for search)
 */
export function flattenTree(tree: ModuleTreeNode[]): ModuleTreeNode[] {
  const flattened: ModuleTreeNode[] = []

  function traverse(nodes: ModuleTreeNode[]) {
    for (const node of nodes) {
      flattened.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    }
  }

  traverse(tree)
  return flattened
}
