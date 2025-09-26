import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth/config';
import { prisma } from '../../../lib/db';
import { z } from 'zod';

// Schema for creating/updating Python playgrounds
const createPlaygroundSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  code: z.string().min(1),
  moduleId: z.string().optional(),
  isTemplate: z.boolean().default(false),
  packages: z.array(z.string()).default([]),
  settings: z.record(z.any()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

const updatePlaygroundSchema = createPlaygroundSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const isTemplate = searchParams.get('isTemplate') === 'true';
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');

    const where: any = {};

    // Faculty can see their own playgrounds and published ones
    if (session.user.role === 'faculty') {
      where.OR = [
        { author_id: session.user.id },
        { status: 'published' }
      ];
    } else {
      // Students can only see published playgrounds
      where.status = 'published';
    }

    // Additional filters
    if (moduleId) where.module_id = moduleId;
    if (typeof isTemplate === 'boolean') where.is_template = isTemplate;
    if (status) where.status = status;
    if (authorId && session.user.role === 'faculty') where.author_id = authorId;

    const playgrounds = await prisma.python_playgrounds.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            playground_executions: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return NextResponse.json({ playgrounds });
  } catch (error) {
    console.error('Get playgrounds error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playgrounds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized. Faculty access required.' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPlaygroundSchema.parse(body);

    // Verify module ownership if moduleId is provided
    if (validatedData.moduleId) {
      const moduleRecord = await prisma.modules.findFirst({
        where: {
          id: validatedData.moduleId,
          author_id: session.user.id
        }
      });

      if (!moduleRecord) {
        return NextResponse.json(
          { error: 'Module not found or access denied' },
          { status: 404 }
        );
      }
    }

    const playground = await prisma.python_playgrounds.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        code: validatedData.code,
        packages: validatedData.packages,
        settings: validatedData.settings,
        status: validatedData.status,
        is_template: validatedData.isTemplate,
        author_id: session.user.id,
        module_id: validatedData.moduleId || null,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({ playground }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create playground error:', error);
    return NextResponse.json(
      { error: 'Failed to create playground' },
      { status: 500 }
    );
  }
}
