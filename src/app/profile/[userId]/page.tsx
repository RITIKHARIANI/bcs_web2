import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth/config'

interface ProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { userId } = await params
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { name: true }
  })

  return {
    title: user ? `${user.name} - Profile` : 'Profile Not Found'
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params
  const session = await auth()

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      about: true,
      speciality: true,
      interested_fields: true,
      university: true,
      avatar_url: true,
      role: true,
      created_at: true,
      courses: {
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
              {/* Avatar */}
              <div className="mb-4 sm:mb-0 sm:mr-6">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Role */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 capitalize">{user.role}</p>
                {user.university && (
                  <p className="text-gray-500 text-sm mt-1">{user.university}</p>
                )}
              </div>

              {/* Edit Button */}
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Speciality */}
            {user.speciality && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Speciality</h3>
                <p className="mt-1 text-gray-900">{user.speciality}</p>
              </div>
            )}

            {/* About */}
            {user.about && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">About</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{user.about}</p>
              </div>
            )}

            {/* Interested Fields */}
            {user.interested_fields && user.interested_fields.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Interested Fields
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.interested_fields.map((field) => (
                    <span
                      key={field}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Courses Created ({user.courses.length})
          </h2>

          {user.courses.length > 0 ? (
            <div className="space-y-4">
              {user.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No published courses yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
