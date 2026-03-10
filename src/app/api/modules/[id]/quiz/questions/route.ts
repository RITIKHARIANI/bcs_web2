import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';
import { canEditModuleWithRetry } from '@/lib/collaboration/permissions';
import { hasFacultyAccess } from '@/lib/auth/utils';
import { addQuestionsSchema } from '@/lib/quiz/schemas';

/**
 * POST /api/modules/[id]/quiz/questions
 * Add question(s) to a quiz
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

    const canEdit = await canEditModuleWithRetry(session.user.id, moduleId);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const quiz = await withDatabaseRetry(async () => {
      return await prisma.quizzes.findUnique({
        where: { module_id: moduleId },
        select: { id: true },
      });
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'No quiz found for this module' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = addQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const createdQuestions = await withDatabaseRetry(async () => {
      const results = [];
      for (const q of parsed.data.questions) {
        const question = await prisma.quiz_questions.create({
          data: {
            quiz_id: quiz.id,
            question_type: q.question_type,
            question_text: q.question_text,
            explanation: q.explanation,
            sort_order: q.sort_order,
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
          include: {
            options: { orderBy: { sort_order: 'asc' } },
          },
        });
        results.push(question);
      }
      return results;
    });

    return NextResponse.json({ questions: createdQuestions }, { status: 201 });
  } catch (error) {
    console.error('Error adding questions:', error);
    return NextResponse.json(
      { error: 'Failed to add questions' },
      { status: 500 }
    );
  }
}
