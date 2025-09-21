import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== NETWORK VISUALIZATION DATA DEBUG ===')
    
    // Skip the fetch call and directly query the API logic to avoid auth issues
    // Import the same logic used by the public network API
    const { prisma } = require('@/lib/db')
    const { withDatabaseRetry } = require('@/lib/retry')
    
    console.log('Directly querying database for network data...')
    
    // Replicate the exact same query logic from /api/public/network-visualization
    const [modules, courses] = await Promise.all([
      withDatabaseRetry(async () =>
        prisma.modules.findMany({
          where: {
            status: 'published', // Only published modules
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
            parent_module_id: true,
            sort_order: true,
            created_at: true,
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            sort_order: 'asc',
          },
        }), { maxAttempts: 5 }
      ),
      withDatabaseRetry(async () =>
        prisma.courses.findMany({
          where: {
            status: 'published', // Only published courses
          },
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
            course_modules: {
              include: {
                modules: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    status: true,
                    parent_module_id: true,
                    sort_order: true,
                  },
                },
              },
              orderBy: {
                sort_order: 'asc',
              },
            },
            _count: {
              select: {
                course_modules: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        }), { maxAttempts: 5 }
      ),
    ])
    
    console.log(`Direct DB query results: ${modules.length} modules, ${courses.length} courses`)
    
    // Transform field names to match frontend expectations (same as API)
    const transformedModules = modules.map(module => ({
      ...module,
      parentModuleId: module.parent_module_id,
      sortOrder: module.sort_order,
      createdAt: module.created_at?.toISOString(),
      author: module.users,
    }))

    const transformedCourses = courses.map(course => ({
      ...course,
      author: course.users,
      courseModules: course.course_modules
        ?.filter(cm => cm.modules && cm.modules.status === 'published')
        .map(cm => ({
          ...cm,
          module: {
            ...cm.modules,
            parentModuleId: cm.modules.parent_module_id,
            sortOrder: cm.modules.sort_order,
          }
        })) || [],
      _count: {
        courseModules: course.course_modules?.filter(cm => cm.modules && cm.modules.status === 'published').length || 0,
      }
    }))

    // Filter out courses with no published modules
    const coursesWithModules = transformedCourses.filter(course => course.courseModules.length > 0)
    
    const data = {
      type: 'public',
      modules: transformedModules,
      courses: coursesWithModules,
      stats: {
        totalCourses: coursesWithModules.length,
        totalModules: transformedModules.length,
        rootModules: transformedModules.filter(m => !m.parentModuleId).length,
        subModules: transformedModules.filter(m => m.parentModuleId).length,
      }
    }
    
    console.log('Successfully constructed network data:', {
      modules: data.modules?.length || 0,
      courses: data.courses?.length || 0,
      stats: data.stats,
    })
    
    // Analyze the data structure for edge creation
    const edgeAnalysis = {
      courseModuleEdges: [],
      parentChildEdges: [],
      issues: [],
    }
    
    // Check course-module relationships
    if (data.courses && Array.isArray(data.courses)) {
      data.courses.forEach(course => {
        console.log(`Course: ${course.title} (${course.id})`)
        console.log(`  Status: ${course.status}`)
        console.log(`  Course modules:`, course.courseModules?.length || 0)
        
        if (course.courseModules && Array.isArray(course.courseModules)) {
          course.courseModules.forEach(cm => {
            console.log(`    Module: ${cm.module?.title} (${cm.module?.id})`)
            console.log(`    Module status: ${cm.module?.status}`)
            
            if (cm.module?.id) {
              edgeAnalysis.courseModuleEdges.push({
                courseId: course.id,
                courseTitle: course.title,
                moduleId: cm.module.id,
                moduleTitle: cm.module.title,
                edgeId: `course-${course.id}-module-${cm.module.id}`,
                source: `course-${course.id}`,
                target: `module-${cm.module.id}`,
              })
            } else {
              edgeAnalysis.issues.push(`Course "${course.title}" has courseModule without valid module.id`)
            }
          })
        } else {
          edgeAnalysis.issues.push(`Course "${course.title}" has no courseModules array`)
        }
      })
    }
    
    // Check parent-child module relationships
    if (data.modules && Array.isArray(data.modules)) {
      data.modules.forEach(module => {
        console.log(`Module: ${module.title} (${module.id})`)
        console.log(`  Status: ${module.status}`)
        console.log(`  Parent: ${module.parentModuleId || 'ROOT'}`)
        
        if (module.parentModuleId) {
          const parentExists = data.modules.find(m => m.id === module.parentModuleId)
          if (parentExists) {
            edgeAnalysis.parentChildEdges.push({
              parentId: module.parentModuleId,
              parentTitle: parentExists.title,
              childId: module.id,
              childTitle: module.title,
              edgeId: `module-${module.parentModuleId}-module-${module.id}`,
              source: `module-${module.parentModuleId}`,
              target: `module-${module.id}`,
            })
          } else {
            edgeAnalysis.issues.push(`Module "${module.title}" has parentModuleId "${module.parentModuleId}" but parent not found in modules array`)
          }
        }
      })
    }
    
    console.log('EDGE ANALYSIS RESULTS:')
    console.log(`  Course-Module edges: ${edgeAnalysis.courseModuleEdges.length}`)
    console.log(`  Parent-Child edges: ${edgeAnalysis.parentChildEdges.length}`)
    console.log(`  Issues found: ${edgeAnalysis.issues.length}`)
    
    edgeAnalysis.issues.forEach(issue => console.log(`    ISSUE: ${issue}`))
    
    console.log('=== END NETWORK DEBUG ===')
    
    return NextResponse.json({
      apiResponse: data,
      edgeAnalysis,
      summary: {
        coursesFound: data.courses?.length || 0,
        modulesFound: data.modules?.length || 0,
        courseModuleEdgesPossible: edgeAnalysis.courseModuleEdges.length,
        parentChildEdgesPossible: edgeAnalysis.parentChildEdges.length,
        issuesDetected: edgeAnalysis.issues.length,
      }
    })
    
  } catch (error) {
    console.error('Network debug error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug network data', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}
