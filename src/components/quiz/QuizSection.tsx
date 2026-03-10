'use client';

import { useEffect, useState } from 'react';
import { QuizTaker } from './QuizTaker';

interface QuizSectionProps {
  moduleId: string;
  courseId?: string;
  onQuizComplete?: () => void;
}

/**
 * Wrapper that checks if a module has a published quiz and renders QuizTaker if so.
 */
export function QuizSection({ moduleId, courseId, onQuizComplete }: QuizSectionProps) {
  const [quizStatus, setQuizStatus] = useState<{
    hasQuiz: boolean;
    quizId: string | null;
  } | null>(null);

  useEffect(() => {
    async function checkQuiz() {
      try {
        const res = await fetch(`/api/progress/module/${moduleId}/quiz-status`);
        if (res.ok) {
          const data = await res.json();
          setQuizStatus(data);
        }
      } catch {
        // No quiz check possible
      }
    }
    checkQuiz();
  }, [moduleId]);

  if (!quizStatus?.hasQuiz || !quizStatus.quizId) {
    return null;
  }

  return (
    <div className="mt-6">
      <QuizTaker
        quizId={quizStatus.quizId}
        moduleId={moduleId}
        courseId={courseId}
        onQuizComplete={onQuizComplete}
      />
    </div>
  );
}
