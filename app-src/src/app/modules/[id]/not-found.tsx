import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ModuleNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Module Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            The module you're looking for doesn't exist, has been moved, or is not published yet. 
            It may still be under development by the instructor.
          </p>
          
          <div className="space-y-3 pt-4">
            <Link href="/courses" className="block">
              <Button className="w-full">
                Browse Available Courses
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="pt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>
              If you accessed this module from a course, try going back to the course page to find alternative content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
