import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { hasFacultyAccess } from '@/lib/auth/utils';

/**
 * GET /api/faculty/courses/[id]/quiz-export
 * CSV export of quiz grades (Canvas-compatible)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;

    const csvContent = await withDatabaseRetry(async () => {
      // Get all modules in this course that have quizzes
      const courseModules = await prisma.course_modules.findMany({
        where: { course_id: courseId },
        include: {
          modules: {
            include: {
              quiz: {
                include: {
                  attempts: {
                    where: {
                      status: { in: ['submitted', 'graded'] },
                    },
                    include: {
                      user: {
                        select: { id: true, name: true, email: true },
                      },
                    },
                    orderBy: { score: 'desc' },
                  },
                },
              },
            },
          },
        },
        orderBy: { sort_order: 'asc' },
      });

      const header =
        'Student Name,Student Email,Student ID,Module Title,Quiz Title,Best Score (%),Points Earned,Points Possible,Attempts Used,Passed,Last Attempt Date';

      const rows: string[] = [];

      for (const cm of courseModules) {
        const quiz = cm.modules.quiz;
        if (!quiz || quiz.attempts.length === 0) continue;

        // Group attempts by user and find best
        const userBest = new Map<
          string,
          {
            name: string;
            email: string;
            userId: string;
            bestScore: number;
            pointsEarned: number;
            pointsPossible: number;
            attemptCount: number;
            passed: boolean;
            lastDate: Date | null;
          }
        >();

        for (const attempt of quiz.attempts) {
          const key = attempt.user_id;
          const existing = userBest.get(key);

          if (
            !existing ||
            (attempt.score !== null &&
              attempt.score > existing.bestScore)
          ) {
            userBest.set(key, {
              name: attempt.user.name,
              email: attempt.user.email,
              userId: attempt.user.id,
              bestScore: attempt.score ?? 0,
              pointsEarned: attempt.points_earned,
              pointsPossible: attempt.points_possible,
              attemptCount: existing
                ? existing.attemptCount + 1
                : 1,
              passed: attempt.passed || existing?.passed || false,
              lastDate: attempt.submitted_at,
            });
          } else if (existing) {
            existing.attemptCount++;
            if (attempt.passed) existing.passed = true;
            if (
              attempt.submitted_at &&
              (!existing.lastDate ||
                attempt.submitted_at > existing.lastDate)
            ) {
              existing.lastDate = attempt.submitted_at;
            }
          }
        }

        for (const [, data] of userBest) {
          const escapeCsv = (s: string) =>
            s.includes(',') || s.includes('"')
              ? `"${s.replace(/"/g, '""')}"`
              : s;

          rows.push(
            [
              escapeCsv(data.name),
              escapeCsv(data.email),
              data.userId,
              escapeCsv(cm.modules.title),
              escapeCsv(quiz.title),
              data.bestScore.toFixed(1),
              data.pointsEarned.toString(),
              data.pointsPossible.toString(),
              data.attemptCount.toString(),
              data.passed ? 'Yes' : 'No',
              data.lastDate
                ? data.lastDate.toISOString().split('T')[0]
                : '',
            ].join(',')
          );
        }
      }

      return header + '\n' + rows.join('\n');
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="quiz-grades-${courseId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting quiz grades:', error);
    return NextResponse.json(
      { error: 'Failed to export grades' },
      { status: 500 }
    );
  }
}
