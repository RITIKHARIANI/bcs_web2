import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { canEditModuleWithRetry } from '@/lib/collaboration/permissions';
import { hasFacultyAccess } from '@/lib/auth/utils';
import { updateQuestionSchema } from '@/lib/quiz/schemas';

/**
 * PUT /api/modules/[id]/quiz/questions/[questionId]
 * Update a single question
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: moduleId, questionId } = await params;

    const canEdit = await canEditModuleWithRetry(session.user.id, moduleId);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { options, ...questionData } = parsed.data;

    const question = await withDatabaseRetry(async () => {
      // Update question fields
      const updated = await prisma.quiz_questions.update({
        where: { id: questionId },
        data: questionData,
      });

      // Replace options if provided
      if (options) {
        await prisma.quiz_question_options.deleteMany({
          where: { question_id: questionId },
        });

        for (let i = 0; i < options.length; i++) {
          await prisma.quiz_question_options.create({
            data: {
              question_id: questionId,
              option_text: options[i].option_text,
              is_correct: options[i].is_correct,
              sort_order: options[i].sort_order ?? i,
            },
          });
        }
      }

      return await prisma.quiz_questions.findUnique({
        where: { id: questionId },
        include: {
          options: { orderBy: { sort_order: 'asc' } },
        },
      });
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/modules/[id]/quiz/questions/[questionId]
 * Delete a question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: moduleId, questionId } = await params;

    const canEdit = await canEditModuleWithRetry(session.user.id, moduleId);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if question has any submitted answers
    const answerCount = await withDatabaseRetry(async () => {
      return await prisma.quiz_attempt_answers.count({
        where: { question_id: questionId },
      });
    });

    if (answerCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete a question that has student answers. Edit it instead.',
        },
        { status: 409 }
      );
    }

    await withDatabaseRetry(async () => {
      await prisma.quiz_questions.delete({
        where: { id: questionId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
