/**
 * Zod validation schemas for Quiz API routes
 */

import { z } from 'zod';

// ==================== Question Option Schemas ====================

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  option_text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean().default(false),
  sort_order: z.number().int().min(0),
});

// ==================== Question Schemas ====================

export const questionSchema = z.object({
  id: z.string().optional(),
  question_type: z.enum([
    'multiple_choice',
    'multiple_select',
    'true_false',
    'short_answer',
  ]),
  question_text: z.string().min(1, 'Question text is required'),
  explanation: z.string().nullable().optional(),
  sort_order: z.number().int().min(0),
  points: z.number().int().min(1).default(1),
  short_answer_keywords: z.array(z.string()).default([]),
  case_sensitive: z.boolean().default(false),
  options: z.array(questionOptionSchema).default([]),
});

// ==================== Quiz Schemas ====================

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  time_limit_minutes: z.number().int().min(1).nullable().optional(),
  max_attempts: z.number().int().min(0).default(0),
  pass_threshold: z.number().int().min(0).max(100).default(70),
  shuffle_questions: z.boolean().default(false),
  shuffle_options: z.boolean().default(false),
  show_correct_answers: z
    .enum(['after_submission', 'after_each', 'never'])
    .default('after_submission'),
  require_pass_to_complete: z.boolean().default(false),
  xp_reward: z.number().int().min(0).max(10000).default(50),
  questions: z.array(questionSchema).default([]),
});

export const updateQuizSchema = createQuizSchema.partial();

// ==================== Question Management Schemas ====================

export const addQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const updateQuestionSchema = questionSchema.partial().extend({
  options: z.array(questionOptionSchema).optional(),
});

export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1),
});

// ==================== Quiz Attempt Schemas ====================

export const startAttemptSchema = z.object({
  course_id: z.string().optional(),
});

export const saveAnswersSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string(),
      selected_option_ids: z.array(z.string()).default([]),
      text_answer: z.string().nullable().optional(),
    })
  ),
});

export const gradeShortAnswerSchema = z.object({
  question_id: z.string(),
  is_correct: z.boolean(),
  points_earned: z.number().int().min(0),
  grading_note: z.string().nullable().optional(),
});

// ==================== Type Exports ====================

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;
export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;
export type GradeShortAnswerInput = z.infer<typeof gradeShortAnswerSchema>;
