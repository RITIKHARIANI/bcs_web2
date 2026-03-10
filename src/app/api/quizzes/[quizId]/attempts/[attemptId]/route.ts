import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { saveAnswersSchema } from '@/lib/quiz/schemas';

/**
 * GET /api/quizzes/[quizId]/attempts/[attemptId]
 * Get detailed attempt review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = await params;

    const attempt = await withDatabaseRetry(async () => {
      return await prisma.quiz_attempts.findUnique({
        where: { id: attemptId },
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: { orderBy: { sort_order: 'asc' } },
                },
              },
            },
          },
          quiz: {
            select: {
              show_correct_answers: true,
              title: true,
              pass_threshold: true,
            },
          },
        },
      });
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Only allow the attempt owner to view it
    if (attempt.user_id !== session.user.id) {
      // Allow faculty to view any attempt
      const userRole = session.user.role;
      if (userRole !== 'faculty' && userRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempt' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes/[quizId]/attempts/[attemptId]
 * Save partial answers (auto-save)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = await params;

    const body = await request.json();
    const parsed = saveAnswersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await withDatabaseRetry(async () => {
      // Verify attempt belongs to user and is in_progress
      const attempt = await prisma.quiz_attempts.findUnique({
        where: { id: attemptId },
        select: { user_id: true, status: true },
      });

      if (!attempt || attempt.user_id !== session.user!.id) {
        throw new Error('NOT_FOUND');
      }

      if (attempt.status !== 'in_progress') {
        throw new Error('ALREADY_SUBMITTED');
      }

      // Upsert each answer
      for (const answer of parsed.data.answers) {
        await prisma.quiz_attempt_answers.upsert({
          where: {
            attempt_id_question_id: {
              attempt_id: attemptId,
              question_id: answer.question_id,
            },
          },
          update: {
            selected_option_ids: answer.selected_option_ids,
            text_answer: answer.text_answer,
          },
          create: {
            attempt_id: attemptId,
            question_id: answer.question_id,
            selected_option_ids: answer.selected_option_ids,
            text_answer: answer.text_answer,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }
    if (error?.message === 'ALREADY_SUBMITTED') {
      return NextResponse.json(
        { error: 'Attempt already submitted' },
        { status: 409 }
      );
    }
    console.error('Error saving answers:', error);
    return NextResponse.json(
      { error: 'Failed to save answers' },
      { status: 500 }
    );
  }
}
