import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

/**
 * GET /api/paths
 * Returns list of all learning paths
 *
 * Curriculum Visualization Feature - Learning Paths
 */
export async function GET() {
  const data = await withDatabaseRetry(async () => {
    const paths = await prisma.learning_paths.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        course_ids: true,
        is_featured: true,
        sort_order: true,
        created_at: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
            title: true,
            department: true
          }
        }
      },
      orderBy: [
        { is_featured: 'desc' },
        { sort_order: 'asc' },
        { created_at: 'desc' }
      ]
    });

    // Get course counts for each path
    const pathsWithCounts = await Promise.all(
      paths.map(async path => {
        const courseCount = await prisma.courses.count({
          where: {
            id: { in: path.course_ids },
            status: 'published'
          }
        });

        return {
          id: path.id,
          title: path.title,
          slug: path.slug,
          description: path.description,
          courseCount,
          isFeatured: path.is_featured,
          createdBy: {
            name: path.creator.name,
            avatar_url: path.creator.avatar_url,
            title: path.creator.title,
            department: path.creator.department
          },
          createdAt: path.created_at.toISOString()
        };
      })
    );

    return {
      paths: pathsWithCounts,
      totalPaths: paths.length
    };
  });

  return NextResponse.json(data);
}
