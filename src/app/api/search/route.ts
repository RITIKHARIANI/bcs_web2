import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withDatabaseRetry } from '@/lib/retry'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category') // 'courses', 'modules', 'people', or 'all'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toLowerCase()
    const validLimit = Math.min(Math.max(1, limit), 50) // Max 50 results per category

    // Debug logging
    console.log('🔍 Search Query:', {
      original: query,
      processed: searchTerm,
      category: category || 'all',
      limit: validLimit
    })

    const results = await withDatabaseRetry(async () => {
      const [courses, modules, people] = await Promise.all([
        // Search Courses (only published)
        (category === 'all' || category === 'courses')
          ? prisma.courses.findMany({
              where: {
                status: 'published',
                OR: [
                  { title: { contains: searchTerm, mode: 'insensitive' } },
                  { description: { contains: searchTerm, mode: 'insensitive' } },
                  { tags: { has: searchTerm } },
                ],
              },
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    avatar_url: true,
                  },
                },
                _count: {
                  select: {
                    course_modules: true,
                  },
                },
              },
              take: validLimit,
              orderBy: { updated_at: 'desc' },
            })
          : [],

        // Search Modules (only published)
        (category === 'all' || category === 'modules')
          ? prisma.modules.findMany({
              where: {
                status: 'published',
                OR: [
                  { title: { contains: searchTerm, mode: 'insensitive' } },
                  { description: { contains: searchTerm, mode: 'insensitive' } },
                  { content: { contains: searchTerm, mode: 'insensitive' } },
                  { tags: { has: searchTerm } },
                ],
              },
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    avatar_url: true,
                  },
                },
                modules: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
              take: validLimit,
              orderBy: { updated_at: 'desc' },
            })
          : [],

        // Search People (faculty and students with verified emails)
        (category === 'all' || category === 'people')
          ? prisma.users.findMany({
              where: {
                email_verified: true,
                OR: [
                  { name: { contains: searchTerm, mode: 'insensitive' } },
                  { email: { contains: searchTerm, mode: 'insensitive' } },
                  { speciality: { contains: searchTerm, mode: 'insensitive' } },
                  { university: { contains: searchTerm, mode: 'insensitive' } },
                  { about: { contains: searchTerm, mode: 'insensitive' } },
                  { interested_fields: { has: searchTerm } },
                ],
              },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                speciality: true,
                university: true,
                avatar_url: true,
                interested_fields: true,
                _count: {
                  select: {
                    courses: {
                      where: { status: 'published' },
                    },
                    modules: {
                      where: { status: 'published' },
                    },
                  },
                },
              },
              take: validLimit,
              orderBy: { name: 'asc' },
            })
          : [],
      ])

      return { courses, modules, people }
    }, { maxAttempts: 3, baseDelayMs: 500 })

    // Debug logging for results
    console.log('📊 Search Results:', {
      coursesFound: results.courses.length,
      modulesFound: results.modules.length,
      peopleFound: results.people.length,
      peopleNames: results.people.map(p => ({ name: p.name, email: p.email }))
    })

    // Calculate totals
    const totals = {
      courses: results.courses.length,
      modules: results.modules.length,
      people: results.people.length,
      all: results.courses.length + results.modules.length + results.people.length,
    }

    return NextResponse.json({
      success: true,
      query: searchTerm,
      category: category || 'all',
      results,
      totals,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
