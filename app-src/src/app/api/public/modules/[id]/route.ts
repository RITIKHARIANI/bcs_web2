import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params

    // Find the module with full hierarchy
    const module = await prisma.module.findFirst({
      where: {
        id: id,
        status: 'published' // Only allow access to published modules
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        parentModule: {
          select: {
            id: true,
            title: true,
            moduleNumber: true
          }
        },
        subModules: {
          where: {
            status: 'published'
          },
          orderBy: {
            sortOrder: 'asc'
          },
          select: {
            id: true,
            title: true,
            moduleNumber: true,
            description: true
          }
        },
        courseModules: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found or not published' },
        { status: 404 }
      )
    }

    // Get siblings (other modules at the same level)
    let siblings = []
    if (module.parentModule) {
      siblings = await prisma.module.findMany({
        where: {
          parentModuleId: module.parentModule.id,
          status: 'published',
          id: { not: module.id }
        },
        orderBy: {
          sortOrder: 'asc'
        },
        select: {
          id: true,
          title: true,
          moduleNumber: true
        }
      })
    }

    // Transform the data for public consumption
    const publicModule = {
      id: module.id,
      title: module.title,
      moduleNumber: module.moduleNumber,
      description: module.description,
      content: module.content,
      author: {
        name: module.author.name
      },
      parentModule: module.parentModule,
      subModules: module.subModules,
      siblings: siblings,
      courses: module.courseModules.map(cm => ({
        id: cm.course.id,
        title: cm.course.title,
        slug: cm.course.slug
      })),
      createdAt: module.createdAt,
      updatedAt: module.updatedAt
    }

    return NextResponse.json({ module: publicModule })

  } catch (error) {
    console.error('Error fetching public module:', error)
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    )
  }
}
