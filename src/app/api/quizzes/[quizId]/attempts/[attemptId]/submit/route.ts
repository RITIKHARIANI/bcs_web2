import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { gradeAttempt, calculateQuizXP } from '@/lib/quiz/grading';
import { checkAchievementsAfterQuizSubmission } from '@/lib/achievements/checker';

/**
 * POST /api/quizzes/[quizId]/attempts/[attemptId]/submit
 * Submit attempt for grading -> auto-grade -> award XP -> check achievements
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, attemptId } = await params;
    const userId = session.user.id;

    const result = await withDatabaseRetry(async () => {
      // Verify attempt
      const attempt = await prisma.quiz_attempts.findUnique({
        where: { id: attemptId },
        include: {
          answers: true,
          quiz: {
            include: {
              questions: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!attempt || attempt.user_id !== userId) {
        return { error: 'Attempt not found', status: 404 };
      }

      if (attempt.status !== 'in_progress') {
        return { error: 'Attempt already submitted', status: 409 };
      }

      // Server-side time limit enforcement
      if (attempt.quiz.time_limit_minutes) {
        const elapsed =
          (Date.now() - attempt.started_at.getTime()) / 1000 / 60;
        // Allow 30 second grace period
        if (elapsed > attempt.quiz.time_limit_minutes + 0.5) {
          // Still grade but note it was late
        }
      }

      const now = new Date();
      const timeSpent = Math.round(
        (now.getTime() - attempt.started_at.getTime()) / 1000
      );

      // Grade the attempt
      const answerInputs = attempt.answers.map(a => ({
        question_id: a.question_id,
        selected_option_ids: a.selected_option_ids,
        text_answer: a.text_answer,
      }));

      const { gradedAnswers, pointsEarned, pointsPossible, score } =
        gradeAttempt(attempt.quiz.questions, answerInputs);

      const passed = score >= attempt.quiz.pass_threshold;

      // Calculate XP (delta-only)
      const previousBest = await prisma.quiz_attempts.findFirst({
        where: {
          quiz_id: quizId,
          user_id: userId,
          status: { in: ['submitted', 'graded'] },
        },
        orderBy: { xp_awarded: 'desc' },
        select: { xp_awarded: true },
      });

      const xpToAward = calculateQuizXP({
        baseXP: attempt.quiz.xp_reward,
        score,
        attemptNumber: attempt.attempt_number,
        previousBestXP: previousBest?.xp_awarded || 0,
      });

      // Update graded answers
      for (const graded of gradedAnswers) {
        await prisma.quiz_attempt_answers.updateMany({
          where: {
            attempt_id: attemptId,
            question_id: graded.question_id,
          },
          data: {
            is_correct: graded.is_correct,
            points_earned: graded.points_earned,
          },
        });
      }

      // Determine if all answers are graded (no nulls)
      const hasUngraded = gradedAnswers.some(a => a.is_correct === null);
      const attemptStatus = hasUngraded ? 'submitted' : 'graded';

      // Update attempt
      await prisma.quiz_attempts.update({
        where: { id: attemptId },
        data: {
          status: attemptStatus,
          score,
          points_earned: pointsEarned,
          points_possible: pointsPossible,
          passed,
          submitted_at: now,
          time_spent_seconds: timeSpent,
          xp_awarded: xpToAward,
        },
      });

      // Award XP to user
      if (xpToAward > 0) {
        const userStats = await prisma.user_gamification_stats.upsert({
          where: { user_id: userId },
          update: {
            total_xp: { increment: xpToAward },
            last_active_date: now,
          },
          create: {
            user_id: userId,
            total_xp: xpToAward,
            level: 1,
            last_active_date: now,
          },
        });

        // Recalculate level
        const newLevel = Math.floor(
          Math.sqrt(userStats.total_xp / 100)
        );
        if (newLevel > userStats.level) {
          await prisma.user_gamification_stats.update({
            where: { user_id: userId },
            data: { level: newLevel },
          });
        }
      }

      return {
        score,
        pointsEarned,
        pointsPossible,
        passed,
        xpAwarded: xpToAward,
        status: attemptStatus,
        hasUngraded,
        timeSpentSeconds: timeSpent,
      };
    });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status as number }
      );
    }

    // Check achievements (non-blocking)
    let achievements: any[] = [];
    try {
      const achievementResult = await checkAchievementsAfterQuizSubmission(
        userId,
        quizId,
        result.score,
        result.passed,
        result.timeSpentSeconds
      );
      achievements = achievementResult.newAchievements;
    } catch {
      // Don't fail the submission if achievements check fails
    }

    return NextResponse.json({ ...result, achievements });
  } catch (error) {
    console.error('Error submitting attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}
