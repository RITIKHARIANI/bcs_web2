import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { startAttemptSchema } from '@/lib/quiz/schemas';

/**
 * POST /api/quizzes/[quizId]/attempts
 * Start a new quiz attempt
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const parsed = startAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const result = await withDatabaseRetry(async () => {
      // Check quiz exists and is published
      const quiz = await prisma.quizzes.findUnique({
        where: { id: quizId },
        select: {
          id: true,
          status: true,
          max_attempts: true,
          time_limit_minutes: true,
        },
      });

      if (!quiz || quiz.status !== 'published') {
        return { error: 'Quiz not found or not published', status: 404 };
      }

      // Check for in-progress attempt (resume it)
      const inProgress = await prisma.quiz_attempts.findFirst({
        where: {
          quiz_id: quizId,
          user_id: userId,
          status: 'in_progress',
        },
        include: {
          answers: true,
        },
      });

      if (inProgress) {
        return { attempt: inProgress, resumed: true };
      }

      // Count existing attempts
      const attemptCount = await prisma.quiz_attempts.count({
        where: { quiz_id: quizId, user_id: userId },
      });

      // Check max attempts
      if (quiz.max_attempts > 0 && attemptCount >= quiz.max_attempts) {
        return { error: 'Maximum attempts reached', status: 403 };
      }

      // Create new attempt
      const attempt = await prisma.quiz_attempts.create({
        data: {
          quiz_id: quizId,
          user_id: userId,
          course_id: parsed.data.course_id || null,
          attempt_number: attemptCount + 1,
          status: 'in_progress',
        },
      });

      return { attempt, resumed: false };
    });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: result.resumed ? 200 : 201 });
  } catch (error) {
    console.error('Error starting attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start attempt' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quizzes/[quizId]/attempts
 * List user's attempts (best score, total count)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    const userId = session.user.id;

    const data = await withDatabaseRetry(async () => {
      const attempts = await prisma.quiz_attempts.findMany({
        where: { quiz_id: quizId, user_id: userId },
        orderBy: { attempt_number: 'desc' },
        select: {
          id: true,
          attempt_number: true,
          status: true,
          score: true,
          points_earned: true,
          points_possible: true,
          passed: true,
          started_at: true,
          submitted_at: true,
          time_spent_seconds: true,
          xp_awarded: true,
        },
      });

      const bestScore =
        attempts.length > 0
          ? Math.max(...attempts.filter(a => a.score !== null).map(a => a.score!), 0)
          : null;

      return {
        attempts,
        totalCount: attempts.length,
        bestScore,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}
