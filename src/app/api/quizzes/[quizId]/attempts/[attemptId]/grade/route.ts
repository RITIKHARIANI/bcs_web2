import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { hasFacultyAccess } from '@/lib/auth/utils';
import { gradeShortAnswerSchema } from '@/lib/quiz/schemas';

/**
 * PUT /api/quizzes/[quizId]/attempts/[attemptId]/grade
 * Faculty manual grading for short answer questions
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = await params;

    const body = await request.json();
    const parsed = gradeShortAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question_id, is_correct, points_earned, grading_note } =
      parsed.data;

    const result = await withDatabaseRetry(async () => {
      // Update the answer
      await prisma.quiz_attempt_answers.updateMany({
        where: {
          attempt_id: attemptId,
          question_id: question_id,
        },
        data: {
          is_correct,
          points_earned,
          graded_by: session.user!.id,
          graded_at: new Date(),
          grading_note,
        },
      });

      // Recalculate attempt totals
      const allAnswers = await prisma.quiz_attempt_answers.findMany({
        where: { attempt_id: attemptId },
      });

      const totalPointsEarned = allAnswers.reduce(
        (sum, a) => sum + a.points_earned,
        0
      );

      const attempt = await prisma.quiz_attempts.findUnique({
        where: { id: attemptId },
        select: { points_possible: true, quiz: { select: { pass_threshold: true } } },
      });

      const pointsPossible = attempt?.points_possible || 0;
      const newScore =
        pointsPossible > 0
          ? Math.round((totalPointsEarned / pointsPossible) * 10000) / 100
          : 0;
      const passed = newScore >= (attempt?.quiz.pass_threshold || 70);

      // Check if all answers are now graded
      const hasUngraded = allAnswers.some(a => a.is_correct === null);

      await prisma.quiz_attempts.update({
        where: { id: attemptId },
        data: {
          score: newScore,
          points_earned: totalPointsEarned,
          passed,
          status: hasUngraded ? 'submitted' : 'graded',
        },
      });

      return { score: newScore, passed, status: hasUngraded ? 'submitted' : 'graded' };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error grading answer:', error);
    return NextResponse.json(
      { error: 'Failed to grade answer' },
      { status: 500 }
    );
  }
}
