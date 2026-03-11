'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NeuralButton } from '@/components/ui/neural-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuizQuestion } from './QuizQuestion';
import { QuizTimer } from './QuizTimer';
import { QuizResults } from './QuizResults';
import { QuizReview } from './QuizReview';
import { QuizAttemptHistory } from './QuizAttemptHistory';
import { showAchievementsSequence } from '@/components/achievements/AchievementToast';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

interface QuizTakerProps {
  quizId: string;
  moduleId: string;
  courseId?: string;
  onQuizComplete?: () => void;
}

type View = 'start' | 'taking' | 'results' | 'review' | 'history';

export function QuizTaker({ quizId, moduleId, courseId, onQuizComplete }: QuizTakerProps) {
  const [view, setView] = useState<View>('start');
  const [quiz, setQuiz] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, { selected_option_ids: string[]; text_answer: string }>>({});
  const [attempts, setAttempts] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load quiz and attempts
  useEffect(() => {
    async function load() {
      try {
        const [quizRes, attemptsRes] = await Promise.all([
          fetch(`/api/modules/${moduleId}/quiz`),
          fetch(`/api/quizzes/${quizId}/attempts`),
        ]);

        if (quizRes.ok) {
          const data = await quizRes.json();
          setQuiz(data.quiz);
        }

        if (attemptsRes.ok) {
          const data = await attemptsRes.json();
          setAttempts(data.attempts || []);
        }
      } catch {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId, quizId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (view !== 'taking' || !attempt) return;

    autoSaveRef.current = setInterval(() => {
      saveAnswers();
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, attempt]);

  // beforeunload save
  useEffect(() => {
    if (view !== 'taking' || !attempt) return;

    const handleBeforeUnload = () => {
      saveAnswers();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, attempt, answers]);

  const saveAnswers = useCallback(async () => {
    if (!attempt) return;
    const answerList = Object.entries(answers).map(([question_id, a]) => ({
      question_id,
      selected_option_ids: a.selected_option_ids,
      text_answer: a.text_answer || null,
    }));
    if (answerList.length === 0) return;

    try {
      await fetch(`/api/quizzes/${quizId}/attempts/${attempt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerList }),
      });
    } catch {
      // Silent fail for auto-save
    }
  }, [attempt, answers, quizId]);

  const startAttempt = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to start quiz');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setAttempt(data.attempt);

      // Restore saved answers if resuming
      if (data.resumed && data.attempt.answers) {
        const restored: Record<string, { selected_option_ids: string[]; text_answer: string }> = {};
        for (const a of data.attempt.answers) {
          restored[a.question_id] = {
            selected_option_ids: a.selected_option_ids || [],
            text_answer: a.text_answer || '',
          };
        }
        setAnswers(restored);
      }

      setView('taking');
    } catch {
      setError('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!attempt) return;

    // Save answers first
    await saveAnswers();

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/quizzes/${quizId}/attempts/${attempt.id}/submit`,
        { method: 'POST' }
      );

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit quiz');
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      setResult(data);
      setView('results');
      onQuizComplete?.();

      // Show XP toast
      if (data.xpAwarded > 0) {
        toast.success(`+${data.xpAwarded} XP earned!`);
      }

      // Show achievements
      if (data.achievements && data.achievements.length > 0) {
        setTimeout(() => {
          showAchievementsSequence(data.achievements);
        }, 500);
      }
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    toast.warning('Time is up! Submitting your quiz...');
    submitQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const loadAttemptReview = async (attemptId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempts/${attemptId}`);
      if (res.ok) {
        const data = await res.json();
        setReviewData(data.attempt);
        setView('review');
      }
    } catch {
      toast.error('Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIds: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selected_option_ids: optionIds,
        text_answer: prev[questionId]?.text_answer || '',
      },
    }));
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selected_option_ids: prev[questionId]?.selected_option_ids || [],
        text_answer: text,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neural-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!quiz) return null;

  // ===== START VIEW =====
  if (view === 'start') {
    const completedAttempts = attempts.filter(a => a.status !== 'in_progress');
    const bestScore = completedAttempts.length > 0
      ? Math.max(...completedAttempts.filter(a => a.score != null).map(a => a.score), 0)
      : null;
    const hasPassed = attempts.some(a => a.passed);
    const hasInProgress = attempts.some(a => a.status === 'in_progress');
    const maxReached = quiz.max_attempts > 0 && attempts.length >= quiz.max_attempts && !hasInProgress;

    return (
      <Card className="cognitive-card">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.description && (
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">
              {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
            </Badge>
            {quiz.time_limit_minutes && (
              <Badge variant="outline">{quiz.time_limit_minutes} min</Badge>
            )}
            <Badge variant="outline">Pass: {quiz.pass_threshold}%</Badge>
            {quiz.max_attempts > 0 && (
              <Badge variant="outline">
                {attempts.length}/{quiz.max_attempts} attempts
              </Badge>
            )}
          </div>

          {bestScore !== null && (
            <div className="text-sm">
              Best score: <span className={`font-bold ${hasPassed ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(bestScore)}%
              </span>
              {hasPassed && <span className="text-green-600 ml-1">(Passed)</span>}
            </div>
          )}

          <div className="flex gap-2">
            {!maxReached && (
              <NeuralButton variant="neural" onClick={startAttempt}>
                {hasInProgress ? 'Resume Quiz' : completedAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
              </NeuralButton>
            )}
            {completedAttempts.length > 0 && (
              <NeuralButton variant="outline" onClick={() => setView('history')}>
                View History
              </NeuralButton>
            )}
          </div>

          {maxReached && (
            <p className="text-sm text-muted-foreground">
              Maximum attempts reached.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ===== TAKING VIEW =====
  if (view === 'taking') {
    const questions = quiz.questions || [];
    const answeredCount = Object.keys(answers).filter(
      qid => {
        const a = answers[qid];
        return a.selected_option_ids.length > 0 || (a.text_answer && a.text_answer.trim());
      }
    ).length;

    return (
      <Card className="cognitive-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.time_limit_minutes && attempt && (
              <QuizTimer
                timeLimitMinutes={quiz.time_limit_minutes}
                startedAt={attempt.started_at}
                onTimeUp={handleTimeUp}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q: any, i: number) => (
            <QuizQuestion
              key={q.id}
              question={q}
              index={i}
              selectedOptionIds={answers[q.id]?.selected_option_ids || []}
              textAnswer={answers[q.id]?.text_answer || ''}
              onSelectOption={handleSelectOption}
              onTextAnswer={handleTextAnswer}
            />
          ))}

          <div className="pt-4 border-t flex justify-end">
            <NeuralButton
              variant="neural"
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </NeuralButton>
          </div>

          <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Quiz?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit? You cannot change your answers after submission.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <NeuralButton variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                  Cancel
                </NeuralButton>
                <NeuralButton
                  variant="neural"
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    submitQuiz();
                  }}
                >
                  Submit
                </NeuralButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // ===== RESULTS VIEW =====
  if (view === 'results' && result) {
    const canRetake =
      quiz.max_attempts === 0 ||
      attempts.length < quiz.max_attempts;

    return (
      <QuizResults
        score={result.score}
        pointsEarned={result.pointsEarned}
        pointsPossible={result.pointsPossible}
        passed={result.passed}
        passThreshold={quiz.pass_threshold}
        xpAwarded={result.xpAwarded}
        hasUngraded={result.hasUngraded}
        onReview={() => {
          if (attempt) loadAttemptReview(attempt.id);
        }}
        onRetake={canRetake ? () => {
          setAttempt(null);
          setAnswers({});
          setResult(null);
          setView('start');
          // Reload attempts
          fetch(`/api/quizzes/${quizId}/attempts`)
            .then(r => r.json())
            .then(d => setAttempts(d.attempts || []));
        } : undefined}
      />
    );
  }

  // ===== REVIEW VIEW =====
  if (view === 'review' && reviewData) {
    const showCorrect = quiz.show_correct_answers !== 'never';
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Attempt {reviewData.attempt_number} Review
          </h3>
          <NeuralButton variant="outline" size="sm" onClick={() => setView('start')}>
            Back
          </NeuralButton>
        </div>
        <QuizReview
          answers={reviewData.answers}
          showCorrectAnswers={showCorrect}
        />
      </div>
    );
  }

  // ===== HISTORY VIEW =====
  if (view === 'history') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Attempt History</h3>
          <NeuralButton variant="outline" size="sm" onClick={() => setView('start')}>
            Back
          </NeuralButton>
        </div>
        <QuizAttemptHistory
          attempts={attempts}
          onSelectAttempt={loadAttemptReview}
        />
      </div>
    );
  }

  return null;
}
