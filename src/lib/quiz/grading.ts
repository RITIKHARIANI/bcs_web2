/**
 * Quiz Grading Logic
 *
 * Handles auto-grading for all question types and XP calculation.
 */

interface QuestionWithOptions {
  id: string;
  question_type: string;
  points: number;
  short_answer_keywords: string[];
  case_sensitive: boolean;
  options: Array<{
    id: string;
    is_correct: boolean;
  }>;
}

interface AnswerInput {
  question_id: string;
  selected_option_ids: string[];
  text_answer?: string | null;
}

export interface GradedAnswer {
  question_id: string;
  is_correct: boolean | null; // null = needs manual review
  points_earned: number;
}

/**
 * Grade a single answer based on question type
 */
export function gradeAnswer(
  question: QuestionWithOptions,
  answer: AnswerInput
): GradedAnswer {
  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false': {
      const correctOption = question.options.find(o => o.is_correct);
      const isCorrect =
        answer.selected_option_ids.length === 1 &&
        answer.selected_option_ids[0] === correctOption?.id;
      return {
        question_id: question.id,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0,
      };
    }

    case 'multiple_select': {
      const correctIds = new Set(
        question.options.filter(o => o.is_correct).map(o => o.id)
      );
      const selectedIds = new Set(answer.selected_option_ids);

      // Exact set match
      const isCorrect =
        correctIds.size === selectedIds.size &&
        [...correctIds].every(id => selectedIds.has(id));

      return {
        question_id: question.id,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0,
      };
    }

    case 'short_answer': {
      if (!answer.text_answer || answer.text_answer.trim() === '') {
        return {
          question_id: question.id,
          is_correct: false,
          points_earned: 0,
        };
      }

      if (question.short_answer_keywords.length === 0) {
        // No keywords defined - flag for manual review
        return {
          question_id: question.id,
          is_correct: null,
          points_earned: 0,
        };
      }

      const studentAnswer = question.case_sensitive
        ? answer.text_answer.trim()
        : answer.text_answer.trim().toLowerCase();

      const matched = question.short_answer_keywords.some(keyword => {
        const k = question.case_sensitive ? keyword : keyword.toLowerCase();
        return studentAnswer.includes(k);
      });

      if (matched) {
        return {
          question_id: question.id,
          is_correct: true,
          points_earned: question.points,
        };
      }

      // No keyword match - flag for manual review
      return {
        question_id: question.id,
        is_correct: null,
        points_earned: 0,
      };
    }

    default:
      return {
        question_id: question.id,
        is_correct: null,
        points_earned: 0,
      };
  }
}

/**
 * Grade all answers for a quiz attempt
 */
export function gradeAttempt(
  questions: QuestionWithOptions[],
  answers: AnswerInput[]
): {
  gradedAnswers: GradedAnswer[];
  pointsEarned: number;
  pointsPossible: number;
  score: number;
} {
  const answerMap = new Map(answers.map(a => [a.question_id, a]));
  const pointsPossible = questions.reduce((sum, q) => sum + q.points, 0);

  const gradedAnswers = questions.map(question => {
    const answer = answerMap.get(question.id);
    if (!answer) {
      return {
        question_id: question.id,
        is_correct: false,
        points_earned: 0,
      };
    }
    return gradeAnswer(question, answer);
  });

  const pointsEarned = gradedAnswers.reduce(
    (sum, a) => sum + a.points_earned,
    0
  );
  const score = pointsPossible > 0 ? (pointsEarned / pointsPossible) * 100 : 0;

  return {
    gradedAnswers,
    pointsEarned,
    pointsPossible,
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Calculate XP to award for a quiz attempt.
 * Uses delta-only approach: only awards max(0, newXP - previousBestXP).
 */
export function calculateQuizXP(params: {
  baseXP: number;
  score: number;
  attemptNumber: number;
  previousBestXP: number;
}): number {
  const { baseXP, score, attemptNumber, previousBestXP } = params;

  let xp = Math.round((baseXP * score) / 100);

  // Perfect score bonus (1.5x)
  if (score === 100) {
    xp = Math.round(baseXP * 1.5);
  }

  // First attempt bonus (1.25x)
  if (attemptNumber === 1) {
    xp = Math.round(xp * 1.25);
  }

  // Delta-only: only award the difference above previous best
  const delta = Math.max(0, xp - previousBestXP);
  return delta;
}
