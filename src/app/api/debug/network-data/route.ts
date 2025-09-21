import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== NETWORK VISUALIZATION DATA DEBUG ===')
    
    // Fetch the same data that the network visualization component uses
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/public/network-visualization`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error('Network API failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      
      return NextResponse.json({
        error: 'Network API failed',
        status: response.status,
        statusText: response.statusText,
        errorText,
      }, { status: response.status })
    }
    
    const data = await response.json()
    
    console.log('Network API Response:', {
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
