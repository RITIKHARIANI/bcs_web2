import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const reorderSchema = z.object({
  moduleUpdates: z.array(z.object({
    id: z.string(),
    sortOrder: z.number(),
    parentModuleId: z.string().nullable(),
  }))
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = reorderSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validationResult.error.issues 
      }, { status: 400 })
    }

    const { moduleUpdates } = validationResult.data

    // Verify all modules belong to the current user
    const moduleIds = moduleUpdates.map(update => update.id)
    const modules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
        authorId: session.user.id
      }
    })

    if (modules.length !== moduleIds.length) {
      return NextResponse.json({ error: 'Unauthorized to modify some modules' }, { status: 403 })
    }

    // Perform the reordering in a transaction
    await prisma.$transaction(async (tx) => {
      for (const update of moduleUpdates) {
        await tx.module.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
            parentModuleId: update.parentModuleId,
          }
        })
      }
    })

    // Regenerate module numbers for affected hierarchies
    await regenerateModuleNumbers(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering modules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function regenerateModuleNumbers(authorId: string) {
  // Get all modules for the author, ordered by hierarchy
  const modules = await prisma.module.findMany({
    where: { authorId },
    orderBy: [
      { parentModuleId: 'asc' },
      { sortOrder: 'asc' }
    ],
    include: {
      subModules: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  // Build a map of parent to children
  const childrenMap = new Map<string | null, typeof modules>()
  
  modules.forEach(moduleData => {
    const parentId = moduleData.parentModuleId
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(moduleData)
  })

  // Recursively assign module numbers
  const updates: { id: string; moduleNumber: string }[] = []
  
  function assignNumbers(parentId: string | null, prefix: string = '') {
    const children = childrenMap.get(parentId) || []
    
    children.forEach((child, index) => {
      const number = prefix ? `${prefix}.${index + 1}` : `${index + 1}`
      updates.push({ id: child.id, moduleNumber: number })
      
      // Recursively assign numbers to children
      assignNumbers(child.id, number)
    })
  }

  assignNumbers(null)

  // Update all module numbers in a transaction
  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      await tx.module.update({
        where: { id: update.id },
        data: { moduleNumber: update.moduleNumber }
      })
    }
  })
}
