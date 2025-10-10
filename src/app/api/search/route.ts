import { NextRequest, NextResponse } from 'next/server'
import { performUniversalSearch } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const { results, totals } = await performUniversalSearch(query, category, limit)

    return NextResponse.json({
      success: true,
      query: query.trim().toLowerCase(),
      category,
      results,
      totals,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
