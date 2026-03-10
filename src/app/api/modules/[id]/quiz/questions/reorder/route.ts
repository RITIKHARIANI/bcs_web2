import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { canEditModuleWithRetry } from '@/lib/collaboration/permissions';
import { hasFacultyAccess } from '@/lib/auth/utils';
import { reorderQuestionsSchema } from '@/lib/quiz/schemas';

/**
 * PUT /api/modules/[id]/quiz/questions/reorder
 * Reorder questions via { questionIds: string[] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: moduleId } = await params;

    const canEdit = await canEditModuleWithRetry(session.user.id, moduleId);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = reorderQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await withDatabaseRetry(async () => {
      // Use a temporary negative sort_order to avoid unique constraint violations
      for (let i = 0; i < parsed.data.questionIds.length; i++) {
        await prisma.quiz_questions.update({
          where: { id: parsed.data.questionIds[i] },
          data: { sort_order: -(i + 1) },
        });
      }
      // Now set the actual sort orders
      for (let i = 0; i < parsed.data.questionIds.length; i++) {
        await prisma.quiz_questions.update({
          where: { id: parsed.data.questionIds[i] },
          data: { sort_order: i },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering questions:', error);
    return NextResponse.json(
      { error: 'Failed to reorder questions' },
      { status: 500 }
    );
  }
}
