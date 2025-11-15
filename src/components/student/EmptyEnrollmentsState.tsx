import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'

export function EmptyEnrollmentsState() {
  return (
    <div className="cognitive-card p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-gradient-to-br from-neural-primary/10 to-synapse-primary/10 rounded-full">
          <BookOpen className="h-16 w-16 text-neural-primary" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-neural-primary mb-3">
        Start Your Learning Journey
      </h3>

      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        You haven&apos;t enrolled in any courses yet. Browse our catalog to discover courses in brain and cognitive sciences.
      </p>

      <Link
        href="/courses"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neural-primary to-synapse-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
      >
        Browse Courses
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
