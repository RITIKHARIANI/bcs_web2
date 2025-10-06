import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth/config'
import { Header } from '@/components/Header'
import { ProfileView } from '@/components/profile/ProfileView'

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

  // Fetch user data and module count
  const [user, moduleCount] = await Promise.all([
    prisma.users.findUnique({
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
    }),
    prisma.modules.count({
      where: { author_id: userId }
    })
  ])

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id

  return (
    <>
      <Header />
      <ProfileView
        user={user}
        moduleCount={moduleCount}
        isOwnProfile={isOwnProfile}
      />
    </>
  )
}
