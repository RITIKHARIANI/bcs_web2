import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

/**
 * GET /api/progress/module/[moduleId]/quiz-status
 * Returns quiz status for the current user on a module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId } = await params;
    const userId = session.user.id;

    const data = await withDatabaseRetry(async () => {
      const quiz = await prisma.quizzes.findUnique({
        where: { module_id: moduleId },
        select: {
          id: true,
          status: true,
          require_pass_to_complete: true,
          max_attempts: true,
          pass_threshold: true,
        },
      });

      if (!quiz || quiz.status !== 'published') {
        return {
          hasQuiz: false,
          quizId: null,
          requiresPass: false,
          passed: false,
          bestScore: null,
          attemptsUsed: 0,
          maxAttempts: 0,
        };
      }

      const attempts = await prisma.quiz_attempts.findMany({
        where: {
          quiz_id: quiz.id,
          user_id: userId,
        },
        select: {
          score: true,
          passed: true,
          status: true,
        },
      });

      const completedAttempts = attempts.filter(
        a => a.status === 'submitted' || a.status === 'graded'
      );
      const bestScore =
        completedAttempts.length > 0
          ? Math.max(
              ...completedAttempts
                .filter(a => a.score !== null)
                .map(a => a.score!),
              0
            )
          : null;
      const passed = attempts.some(a => a.passed);

      return {
        hasQuiz: true,
        quizId: quiz.id,
        requiresPass: quiz.require_pass_to_complete,
        passed,
        bestScore,
        attemptsUsed: attempts.length,
        maxAttempts: quiz.max_attempts,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quiz status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz status' },
      { status: 500 }
    );
  }
}
