import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== PUBLIC NETWORK API TEST ===')
    
    // Test the exact API call that the frontend network visualization makes
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    console.log('Testing API call to:', `${baseUrl}/api/public/network-visualization`)
    
    const response = await fetch(`${baseUrl}/api/public/network-visualization`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Debug-Test/1.0',
      }
    })
    
    console.log('API Response status:', response.status)
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API failed with:', errorText)
      
      return NextResponse.json({
        error: 'Public network API failed',
        status: response.status,
        statusText: response.statusText,
        errorResponse: errorText,
        testedUrl: `${baseUrl}/api/public/network-visualization`,
      }, { status: response.status })
    }
    
    const data = await response.json()
    
    console.log('API Success! Data summary:', {
      type: data.type,
      coursesCount: data.courses?.length || 0,
      modulesCount: data.modules?.length || 0,
      stats: data.stats,
    })
    
    // Detailed analysis
    console.log('Courses with modules:')
    data.courses?.forEach((course, idx) => {
      console.log(`  ${idx + 1}. ${course.title} (${course.id})`)
      console.log(`     Status: ${course.status}`)
      console.log(`     Modules: ${course.courseModules?.length || 0}`)
      
      course.courseModules?.forEach((cm, cmIdx) => {
        console.log(`       ${cmIdx + 1}. ${cm.module?.title} (${cm.module?.id})`)
        console.log(`          Module Status: ${cm.module?.status}`)
        console.log(`          Parent: ${cm.module?.parentModuleId || 'ROOT'}`)
      })
    })
    
    console.log('All modules:')
    data.modules?.forEach((module, idx) => {
      console.log(`  ${idx + 1}. ${module.title} (${module.id})`)
      console.log(`     Status: ${module.status}`)
      console.log(`     Parent: ${module.parentModuleId || 'ROOT'}`)
    })
    
    console.log('=== END PUBLIC NETWORK API TEST ===')
    
    return NextResponse.json({
      success: true,
      apiUrl: `${baseUrl}/api/public/network-visualization`,
      responseStatus: response.status,
      data: data,
      analysis: {
        coursesFound: data.courses?.length || 0,
        modulesFound: data.modules?.length || 0,
        coursesWithModules: data.courses?.filter(c => c.courseModules?.length > 0).length || 0,
        totalCourseModuleRelationships: data.courses?.reduce((sum, c) => sum + (c.courseModules?.length || 0), 0) || 0,
        rootModules: data.modules?.filter(m => !m.parentModuleId).length || 0,
        childModules: data.modules?.filter(m => m.parentModuleId).length || 0,
      }
    })
    
  } catch (error) {
    console.error('Public network API test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test public network API', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}
