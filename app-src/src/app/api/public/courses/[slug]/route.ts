import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params

    // Find the course by slug with all related data
    const course = await prisma.course.findFirst({
      where: {
        slug: slug,
        status: 'published' // Only allow access to published courses
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        courseModules: {
          include: {
            module: {
              include: {
                subModules: {
                  where: {
                    status: 'published' // Only include published submodules
                  },
                  orderBy: {
                    sortOrder: 'asc'
                  },
                  include: {
                    subModules: {
                      where: {
                        status: 'published'
                      },
                      orderBy: {
                        sortOrder: 'asc'
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Build hierarchical module structure
    const buildModuleHierarchy = (modules: any[]): any[] => {
      return modules.map(module => ({
        id: module.id,
        title: module.title,
        moduleNumber: module.moduleNumber,
        description: module.description,
        content: module.content,
        status: module.status,
        subModules: module.subModules ? buildModuleHierarchy(module.subModules) : []
      }))
    }

    // Transform the data for public consumption
    const publicCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      author: {
        name: course.author.name
      },
      tags: course.tags,
      featured: course.featured,
      modules: course.courseModules.map(cm => ({
        id: cm.module.id,
        title: cm.customTitle || cm.module.title,
        moduleNumber: cm.module.moduleNumber,
        description: cm.module.description,
        content: cm.module.content,
        sortOrder: cm.sortOrder,
        subModules: buildModuleHierarchy(cm.module.subModules)
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }

    return NextResponse.json({ course: publicCourse })

  } catch (error) {
    console.error('Error fetching public course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}
