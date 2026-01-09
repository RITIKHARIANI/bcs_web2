/**
 * POST /api/admin/seed-templates
 *
 * Admin-only endpoint to seed Featured Templates into the database.
 * This migrates hardcoded templates from templates.ts into the unified playground system.
 *
 * Templates are marked as:
 * - is_featured: true (shows in Featured section)
 * - is_protected: true (can't be deleted)
 * - is_public: true (visible to everyone)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { PLAYGROUND_TEMPLATES } from '@/lib/react-playground/templates';

export async function POST() {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as { id: string; error: string }[],
    };

    // Process each template
    for (const template of PLAYGROUND_TEMPLATES) {
      try {
        // Check if template already exists in database
        const existing = await prisma.playgrounds.findFirst({
          where: {
            OR: [
              { id: template.id },
              { title: template.name, is_protected: true },
            ],
          },
        });

        if (existing) {
          results.skipped.push(template.id);
          continue;
        }

        // Create the playground from template
        await prisma.playgrounds.create({
          data: {
            id: template.id, // Use template ID as playground ID for consistent URLs
            title: template.name,
            description: template.description || '',
            category: template.category,
            source_code: template.sourceCode,
            requirements: template.dependencies || [],
            created_by: session.user.id,
            is_public: true,
            is_featured: true,
            is_protected: true,
            featured_at: new Date(),
            featured_by: session.user.id,
            app_type: 'sandpack', // React/Sandpack playgrounds
          },
        });

        results.created.push(template.id);
      } catch (error) {
        results.errors.push({
          id: template.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.created.length} templates, skipped ${results.skipped.length} existing`,
      results,
    });
  } catch (error) {
    console.error('Failed to seed templates:', error);
    return NextResponse.json(
      { error: 'Failed to seed templates' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Count featured/protected playgrounds
    const [featuredCount, protectedCount, templateCount] = await Promise.all([
      prisma.playgrounds.count({ where: { is_featured: true } }),
      prisma.playgrounds.count({ where: { is_protected: true } }),
      Promise.resolve(PLAYGROUND_TEMPLATES.length),
    ]);

    // Get list of seeded template IDs
    const seededTemplates = await prisma.playgrounds.findMany({
      where: { is_protected: true },
      select: { id: true, title: true },
    });

    return NextResponse.json({
      hardcodedTemplates: templateCount,
      seededToDatabase: protectedCount,
      featuredPlaygrounds: featuredCount,
      seededTemplates: seededTemplates.map(t => ({ id: t.id, title: t.title })),
      pendingToSeed: PLAYGROUND_TEMPLATES
        .filter(t => !seededTemplates.find(s => s.id === t.id))
        .map(t => ({ id: t.id, name: t.name })),
    });
  } catch (error) {
    console.error('Failed to get seed status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
