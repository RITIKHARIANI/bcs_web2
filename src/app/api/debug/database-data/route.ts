import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withDatabaseRetry } from '@/lib/retry'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DATABASE DEBUG ANALYSIS ===')
    
    // 1. Check raw table counts
    const [courseCount, moduleCount, courseModuleCount] = await Promise.all([
      withDatabaseRetry(() => prisma.courses.count()),
      withDatabaseRetry(() => prisma.modules.count()),
      withDatabaseRetry(() => prisma.course_modules.count()),
    ])
    
    console.log(`TABLE COUNTS: ${courseCount} courses, ${moduleCount} modules, ${courseModuleCount} course_modules`)
    
    // 2. Get all courses with their basic info and status
    const allCourses = await withDatabaseRetry(() =>
      prisma.courses.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          author_id: true,
          created_at: true,
          users: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })
    )
    
    // 3. Get all modules with their basic info and parent relationships
    const allModules = await withDatabaseRetry(() =>
      prisma.modules.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          author_id: true,
          parent_module_id: true,
          created_at: true,
          users: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })
    )
    
    // 4. Get all course-module relationships
    const allCourseModules = await withDatabaseRetry(() =>
      prisma.course_modules.findMany({
        select: {
          id: true,
          course_id: true,
          module_id: true,
          sort_order: true,
          courses: {
            select: {
              title: true,
              status: true,
            },
          },
          modules: {
            select: {
              title: true,
              status: true,
            },
          },
        },
        orderBy: { sort_order: 'asc' },
      })
    )
    
    // 5. Analyze published content specifically
    const publishedCourses = allCourses.filter(c => c.status === 'published')
    const publishedModules = allModules.filter(m => m.status === 'published')
    const rootModules = allModules.filter(m => !m.parent_module_id)
    const childModules = allModules.filter(m => m.parent_module_id)
    
    // 6. Check course-module relationships for published content
    const publishedCourseModuleRelationships = allCourseModules.filter(cm => 
      cm.courses.status === 'published' && cm.modules.status === 'published'
    )
    
    console.log(`PUBLISHED CONTENT: ${publishedCourses.length} courses, ${publishedModules.length} modules`)
    console.log(`MODULE HIERARCHY: ${rootModules.length} root modules, ${childModules.length} child modules`)
    console.log(`PUBLISHED RELATIONSHIPS: ${publishedCourseModuleRelationships.length} course-module connections`)
    
    // 7. Detailed relationship analysis
    const relationshipDetails = publishedCourseModuleRelationships.map(cm => ({
      courseTitle: cm.courses.title,
      moduleTitle: cm.modules.title,
      courseId: cm.course_id,
      moduleId: cm.module_id,
      sortOrder: cm.sort_order,
    }))
    
    console.log('DETAILED RELATIONSHIPS:', relationshipDetails)
    
    // 8. Parent-child module relationships
    const parentChildRelationships = childModules.map(child => {
      const parent = allModules.find(m => m.id === child.parent_module_id)
      return {
        parentTitle: parent?.title || 'PARENT NOT FOUND',
        childTitle: child.title,
        parentId: child.parent_module_id,
        childId: child.id,
        parentStatus: parent?.status,
        childStatus: child.status,
      }
    })
    
    console.log('PARENT-CHILD RELATIONSHIPS:', parentChildRelationships)
    
    const debugData = {
      summary: {
        totalCourses: courseCount,
        totalModules: moduleCount,
        totalCourseModules: courseModuleCount,
        publishedCourses: publishedCourses.length,
        publishedModules: publishedModules.length,
        rootModules: rootModules.length,
        childModules: childModules.length,
        publishedRelationships: publishedCourseModuleRelationships.length,
      },
      courses: {
        all: allCourses,
        published: publishedCourses,
      },
      modules: {
        all: allModules,
        published: publishedModules,
        root: rootModules.filter(m => m.status === 'published'),
        children: childModules.filter(m => m.status === 'published'),
      },
      relationships: {
        courseModules: relationshipDetails,
        parentChild: parentChildRelationships.filter(r => 
          r.parentStatus === 'published' && r.childStatus === 'published'
        ),
      },
      potentialIssues: {
        unpublishedCourses: allCourses.filter(c => c.status !== 'published').length,
        unpublishedModules: allModules.filter(m => m.status !== 'published').length,
        orphanedModules: allModules.filter(m => 
          m.parent_module_id && !allModules.find(parent => parent.id === m.parent_module_id)
        ).length,
        coursesWithoutModules: publishedCourses.filter(course => 
          !allCourseModules.some(cm => cm.course_id === course.id && cm.modules.status === 'published')
        ).length,
      }
    }
    
    console.log('=== END DATABASE DEBUG ===')
    
    return NextResponse.json(debugData, { status: 200 })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug database', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}
