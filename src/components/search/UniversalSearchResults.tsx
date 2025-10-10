'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchResultCard } from './SearchResultCard'
import { Search, BookOpen, FileText, Users } from 'lucide-react'

interface SearchResult {
  courses: any[]
  modules: any[]
  people: any[]
}

interface SearchResultsProps {
  initialQuery: string
  initialResults: SearchResult
  initialTotals: {
    courses: number
    modules: number
    people: number
    all: number
  }
}

type TabType = 'all' | 'courses' | 'modules' | 'people'

export function UniversalSearchResults({
  initialQuery,
  initialResults,
  initialTotals
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const tabs = [
    {
      id: 'all' as TabType,
      label: 'All Results',
      count: initialTotals.all,
      icon: Search
    },
    {
      id: 'courses' as TabType,
      label: 'Courses',
      count: initialTotals.courses,
      icon: BookOpen
    },
    {
      id: 'modules' as TabType,
      label: 'Modules',
      count: initialTotals.modules,
      icon: FileText
    },
    {
      id: 'people' as TabType,
      label: 'People',
      count: initialTotals.people,
      icon: Users
    }
  ]

  const hasResults = initialTotals.all > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            Showing results for <span className="font-semibold">&ldquo;{initialQuery}&rdquo;</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Results */}
        {!hasResults ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No results found
            </h2>
            <p className="text-gray-600">
              Try searching with different keywords or browse our{' '}
              <Link href="/courses" className="text-blue-600 hover:underline">
                course catalog
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* All Results View */}
            {activeTab === 'all' && (
              <>
                {initialResults.courses.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Courses ({initialResults.courses.length})
                    </h2>
                    <div className="grid gap-3">
                      {initialResults.courses.map((course) => (
                        <SearchResultCard key={course.id} type="course" data={course} />
                      ))}
                    </div>
                  </div>
                )}

                {initialResults.modules.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Modules ({initialResults.modules.length})
                    </h2>
                    <div className="grid gap-3">
                      {initialResults.modules.map((module) => (
                        <SearchResultCard key={module.id} type="module" data={module} />
                      ))}
                    </div>
                  </div>
                )}

                {initialResults.people.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" />
                      People ({initialResults.people.length})
                    </h2>
                    <div className="grid gap-3">
                      {initialResults.people.map((person) => (
                        <SearchResultCard key={person.id} type="person" data={person} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Courses Only */}
            {activeTab === 'courses' && (
              <div className="grid gap-3">
                {initialResults.courses.length > 0 ? (
                  initialResults.courses.map((course) => (
                    <SearchResultCard key={course.id} type="course" data={course} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No courses found for &ldquo;{initialQuery}&rdquo;
                  </div>
                )}
              </div>
            )}

            {/* Modules Only */}
            {activeTab === 'modules' && (
              <div className="grid gap-3">
                {initialResults.modules.length > 0 ? (
                  initialResults.modules.map((module) => (
                    <SearchResultCard key={module.id} type="module" data={module} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No modules found for &ldquo;{initialQuery}&rdquo;
                  </div>
                )}
              </div>
            )}

            {/* People Only */}
            {activeTab === 'people' && (
              <div className="grid gap-3">
                {initialResults.people.length > 0 ? (
                  initialResults.people.map((person) => (
                    <SearchResultCard key={person.id} type="person" data={person} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No people found for &ldquo;{initialQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
