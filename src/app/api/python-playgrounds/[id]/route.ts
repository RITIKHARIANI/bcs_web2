import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updatePlaygroundSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  code: z.string().min(1).optional(),
  moduleId: z.string().optional(),
  isTemplate: z.boolean().optional(),
  packages: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const playground = await prisma.python_playgrounds.findUnique({
      where: { id },
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
        playground_executions: {
          take: 10,
          orderBy: {
            created_at: 'desc'
          },
          include: {
            users: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    // Check access permissions
    const canAccess = (
      playground.status === 'published' ||
      playground.author_id === session.user.id ||
      session.user.role === 'admin'
    );

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ playground });
  } catch (error) {
    console.error('Get playground error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playground' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized. Faculty access required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePlaygroundSchema.parse(body);

    // Check ownership
    const existingPlayground = await prisma.python_playgrounds.findUnique({
      where: { id }
    });

    if (!existingPlayground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    if (existingPlayground.author_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify module ownership if moduleId is being changed
    if (validatedData.moduleId !== undefined) {
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
    }

    const playground = await prisma.python_playgrounds.update({
      where: { id },
      data: {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.code !== undefined && { code: validatedData.code }),
        ...(validatedData.packages !== undefined && { packages: validatedData.packages }),
        ...(validatedData.settings !== undefined && { settings: validatedData.settings }),
        ...(validatedData.status !== undefined && { status: validatedData.status }),
        ...(validatedData.isTemplate !== undefined && { is_template: validatedData.isTemplate }),
        ...(validatedData.moduleId !== undefined && { module_id: validatedData.moduleId }),
        updated_at: new Date()
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

    return NextResponse.json({ playground });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update playground error:', error);
    return NextResponse.json(
      { error: 'Failed to update playground' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized. Faculty access required.' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingPlayground = await prisma.python_playgrounds.findUnique({
      where: { id }
    });

    if (!existingPlayground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    if (existingPlayground.author_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete playground (cascade will handle executions)
    await prisma.python_playgrounds.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Playground deleted successfully' });
  } catch (error) {
    console.error('Delete playground error:', error);
    return NextResponse.json(
      { error: 'Failed to delete playground' },
      { status: 500 }
    );
  }
}
