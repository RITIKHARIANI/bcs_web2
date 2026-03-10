import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { canEditModuleWithRetry } from '@/lib/collaboration/permissions';
import { hasFacultyAccess } from '@/lib/auth/utils';
import { createQuizSchema, updateQuizSchema } from '@/lib/quiz/schemas';

/**
 * GET /api/modules/[id]/quiz
 * Get quiz for a module. Faculty sees full data; students don't see correct answers.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: moduleId } = await params;
    const isFaculty = hasFacultyAccess(session);

    const quiz = await withDatabaseRetry(async () => {
      return await prisma.quizzes.findUnique({
        where: { module_id: moduleId },
        include: {
          questions: {
            orderBy: { sort_order: 'asc' },
            include: {
              options: {
                orderBy: { sort_order: 'asc' },
              },
            },
          },
        },
      });
    });

    if (!quiz) {
      return NextResponse.json({ error: 'No quiz found' }, { status: 404 });
    }

    // Students can only see published quizzes
    if (!isFaculty && quiz.status !== 'published') {
      return NextResponse.json({ error: 'No quiz found' }, { status: 404 });
    }

    // Strip correct answers for students
    if (!isFaculty) {
      const sanitized = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          short_answer_keywords: [],
          explanation:
            quiz.show_correct_answers === 'never' ? null : q.explanation,
          options: q.options.map(o => ({
            ...o,
            is_correct: undefined,
          })),
        })),
      };
      return NextResponse.json({ quiz: sanitized });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/modules/[id]/quiz
 * Create a quiz for a module (faculty only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !hasFacultyAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: moduleId } = await params;

    // Check permission
    const canEdit = await canEditModuleWithRetry(session.user.id, moduleId);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check no existing quiz
    const existing = await withDatabaseRetry(async () => {
      return await prisma.quizzes.findUnique({
        where: { module_id: moduleId },
      });
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Module already has a quiz' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = createQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { questions, ...quizData } = parsed.data;

    const quiz = await withDatabaseRetry(async () => {
      return await prisma.quizzes.create({
        data: {
          title: quizData.title,
          description: quizData.description ?? null,
          status: quizData.status,
          time_limit_minutes: quizData.time_limit_minutes ?? null,
          max_attempts: quizData.max_attempts,
          pass_threshold: quizData.pass_threshold,
          shuffle_questions: quizData.shuffle_questions,
          shuffle_options: quizData.shuffle_options,
          show_correct_answers: quizData.show_correct_answers,
          require_pass_to_complete: quizData.require_pass_to_complete,
          xp_reward: quizData.xp_reward,
          module: { connect: { id: moduleId } },
          questions: {
            create: questions.map((q, qi) => ({
              question_type: q.question_type,
              question_text: q.question_text,
              explanation: q.explanation,
              sort_order: q.sort_order ?? qi,
              points: q.points,
              short_answer_keywords: q.short_answer_keywords,
              case_sensitive: q.case_sensitive,
              options: {
                create: (q.options || []).map((o, oi) => ({
                  option_text: o.option_text,
                  is_correct: o.is_correct,
                  sort_order: o.sort_order ?? oi,
                })),
              },
            })),
          },
        },
        include: {
          questions: {
            orderBy: { sort_order: 'asc' },
            include: {
              options: { orderBy: { sort_order: 'asc' } },
            },
          },
        },
      });
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/modules/[id]/quiz
 * Update quiz config + questions
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
    const parsed = updateQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { questions, ...quizData } = parsed.data;

    const quiz = await withDatabaseRetry(async () => {
      // Update quiz settings
      const updated = await prisma.quizzes.update({
        where: { module_id: moduleId },
        data: quizData,
      });

      // If questions are provided, replace them
      if (questions && questions.length > 0) {
        // Delete existing questions
        await prisma.quiz_questions.deleteMany({
          where: { quiz_id: updated.id },
        });

        // Create new questions
        for (let qi = 0; qi < questions.length; qi++) {
          const q = questions[qi];
          await prisma.quiz_questions.create({
            data: {
              quiz_id: updated.id,
              question_type: q.question_type,
              question_text: q.question_text,
              explanation: q.explanation,
              sort_order: q.sort_order ?? qi,
              points: q.points,
              short_answer_keywords: q.short_answer_keywords,
              case_sensitive: q.case_sensitive,
              options: {
                create: (q.options || []).map((o, oi) => ({
                  option_text: o.option_text,
                  is_correct: o.is_correct,
                  sort_order: o.sort_order ?? oi,
                })),
              },
            },
          });
        }
      }

      return await prisma.quizzes.findUnique({
        where: { id: updated.id },
        include: {
          questions: {
            orderBy: { sort_order: 'asc' },
            include: {
              options: { orderBy: { sort_order: 'asc' } },
            },
          },
        },
      });
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/modules/[id]/quiz
 * Delete quiz (cascade)
 */
export async function DELETE(
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

    await withDatabaseRetry(async () => {
      await prisma.quizzes.delete({
        where: { module_id: moduleId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
