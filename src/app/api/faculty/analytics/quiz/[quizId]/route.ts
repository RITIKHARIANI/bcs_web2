import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { hasFacultyAccess } from '@/lib/auth/utils';

/**
 * GET /api/faculty/analytics/quiz/[quizId]
 * Per-quiz stats: avg score, pass rate, question analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;

    const data = await withDatabaseRetry(async () => {
      const quiz = await prisma.quizzes.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            orderBy: { sort_order: 'asc' },
            select: {
              id: true,
              question_text: true,
              question_type: true,
              points: true,
            },
          },
        },
      });

      if (!quiz) {
        return { error: 'Quiz not found', status: 404 };
      }

      // Get all completed attempts
      const attempts = await prisma.quiz_attempts.findMany({
        where: {
          quiz_id: quizId,
          status: { in: ['submitted', 'graded'] },
        },
        select: {
          id: true,
          score: true,
          passed: true,
          time_spent_seconds: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });

      const totalAttempts = attempts.length;
      const scores = attempts
        .filter(a => a.score !== null)
        .map(a => a.score!);
      const avgScore =
        scores.length > 0
          ? Math.round(
              (scores.reduce((s, v) => s + v, 0) / scores.length) * 100
            ) / 100
          : 0;
      const passCount = attempts.filter(a => a.passed).length;
      const passRate =
        totalAttempts > 0
          ? Math.round((passCount / totalAttempts) * 10000) / 100
          : 0;

      const avgTime =
        attempts.filter(a => a.time_spent_seconds != null).length > 0
          ? Math.round(
              attempts
                .filter(a => a.time_spent_seconds != null)
                .reduce((s, a) => s + a.time_spent_seconds!, 0) /
                attempts.filter(a => a.time_spent_seconds != null).length
            )
          : null;

      // Score distribution (buckets: 0-20, 20-40, 40-60, 60-80, 80-100)
      const distribution = [0, 0, 0, 0, 0];
      scores.forEach(s => {
        const bucket = Math.min(Math.floor(s / 20), 4);
        distribution[bucket]++;
      });

      // Per-question correct rate
      const questionAnalysis = await Promise.all(
        quiz.questions.map(async q => {
          const answers = await prisma.quiz_attempt_answers.findMany({
            where: {
              question_id: q.id,
              attempt: {
                status: { in: ['submitted', 'graded'] },
              },
            },
            select: { is_correct: true },
          });

          const total = answers.length;
          const correct = answers.filter(a => a.is_correct === true).length;
          const correctRate =
            total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

          return {
            questionId: q.id,
            questionText:
              q.question_text.length > 100
                ? q.question_text.substring(0, 100) + '...'
                : q.question_text,
            questionType: q.question_type,
            points: q.points,
            totalAnswers: total,
            correctCount: correct,
            correctRate,
          };
        })
      );

      return {
        quizTitle: quiz.title,
        totalAttempts,
        uniqueStudents: new Set(attempts.map(a => a.user.email)).size,
        avgScore,
        passRate,
        passCount,
        avgTimeSeconds: avgTime,
        scoreDistribution: distribution,
        questionAnalysis,
      };
    });

    if ('error' in data) {
      return NextResponse.json(
        { error: data.error },
        { status: data.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
