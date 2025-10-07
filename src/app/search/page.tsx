import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PublicLayout } from '@/components/layouts/app-layout'
import { UniversalSearchResults } from '@/components/search/UniversalSearchResults'

export const metadata: Metadata = {
  title: 'Search - BCS E-Textbook Platform',
  description: 'Search courses, modules, instructors, and students across the Brain & Cognitive Sciences platform',
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function performSearch(query: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Search failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Search error:', error)
    return {
      results: { courses: [], modules: [], people: [] },
      totals: { courses: 0, modules: 0, people: 0, all: 0 },
    }
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''

  // Redirect to home if no query
  if (!query || query.trim() === '') {
    redirect('/')
  }

  const searchData = await performSearch(query)

  return (
    <PublicLayout>
      <UniversalSearchResults
        initialQuery={query}
        initialResults={searchData.results}
        initialTotals={searchData.totals}
      />
    </PublicLayout>
  )
}
