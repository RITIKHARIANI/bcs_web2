import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { StandaloneModuleViewer } from '@/components/public/standalone-module-viewer'

interface ModulePageProps {
  params: Promise<{ slug: string }>
}

async function getModuleBySlug(slug: string) {
  const foundModule = await prisma.module.findFirst({
    where: {
      slug,
      status: 'published', // Only show published modules publicly
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      parentModule: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      subModules: {
        where: {
          status: 'published', // Only show published submodules
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  return foundModule
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { slug } = await params
  const foundModule = await getModuleBySlug(slug)

  if (!foundModule) {
    return {
      title: 'Module Not Found',
      description: 'The requested module could not be found.',
    }
  }

  return {
    title: `${foundModule.title} | BCS E-Textbook`,
    description: foundModule.description || `Learn about ${foundModule.title} in this educational module.`,
    openGraph: {
      title: foundModule.title,
      description: foundModule.description || `Learn about ${foundModule.title} in this educational module.`,
      type: 'article',
      authors: [foundModule.author.name],
    },
  }
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params
  const foundModule = await getModuleBySlug(slug)

  if (!foundModule) {
    notFound()
  }

  // Type cast the module data to ensure proper TypeScript types
  const moduleData = {
    ...foundModule,
    status: foundModule.status as 'draft' | 'published',
    createdAt: foundModule.createdAt.toISOString(),
    updatedAt: foundModule.updatedAt.toISOString(),
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {foundModule.parentModule && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/modules/${foundModule.parentModule.slug}`} className="hover:text-foreground">
                  {foundModule.parentModule.title}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{foundModule.title}</span>
          </nav>
        </div>

        {/* Module Content */}
        <StandaloneModuleViewer module={moduleData} />
      </div>
    </div>
  )
}
