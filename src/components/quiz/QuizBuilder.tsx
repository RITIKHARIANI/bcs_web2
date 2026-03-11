'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NeuralButton } from '@/components/ui/neural-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuizSettingsForm, type QuizSettings } from './QuizSettingsForm';
import { QuizQuestionEditor, type QuestionData } from './QuizQuestionEditor';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Save, Eye, AlertCircle } from 'lucide-react';
import { QuizPreview } from './QuizPreview';
import { QuizAnalytics } from './QuizAnalytics';

interface QuizBuilderProps {
  moduleId: string;
}

const DEFAULT_SETTINGS: QuizSettings = {
  title: '',
  description: '',
  status: 'draft',
  time_limit_minutes: null,
  max_attempts: 0,
  pass_threshold: 70,
  shuffle_questions: false,
  shuffle_options: false,
  show_correct_answers: 'after_submission',
  require_pass_to_complete: false,
  xp_reward: 50,
};

const NEW_QUESTION: QuestionData = {
  question_type: 'multiple_choice',
  question_text: '',
  explanation: '',
  sort_order: 0,
  points: 1,
  short_answer_keywords: [],
  case_sensitive: false,
  options: [
    { option_text: '', is_correct: true, sort_order: 0 },
    { option_text: '', is_correct: false, sort_order: 1 },
  ],
};

export function QuizBuilder({ moduleId }: QuizBuilderProps) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/modules/${moduleId}/quiz`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch quiz');
      const data = await res.json();
      return data.quiz;
    },
  });

  // Initialize form from fetched data
  if (data && !initialized) {
    setSettings({
      title: data.title,
      description: data.description || '',
      status: data.status,
      time_limit_minutes: data.time_limit_minutes,
      max_attempts: data.max_attempts,
      pass_threshold: data.pass_threshold,
      shuffle_questions: data.shuffle_questions,
      shuffle_options: data.shuffle_options,
      show_correct_answers: data.show_correct_answers,
      require_pass_to_complete: data.require_pass_to_complete,
      xp_reward: data.xp_reward,
    });
    setQuestions(
      (data.questions || []).map((q: any) => ({
        id: q.id,
        question_type: q.question_type,
        question_text: q.question_text,
        explanation: q.explanation || '',
        sort_order: q.sort_order,
        points: q.points,
        short_answer_keywords: q.short_answer_keywords || [],
        case_sensitive: q.case_sensitive,
        options: (q.options || []).map((o: any) => ({
          id: o.id,
          option_text: o.option_text,
          is_correct: o.is_correct,
          sort_order: o.sort_order,
        })),
      }))
    );
    setInitialized(true);
  } else if (data === null && !initialized) {
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...settings,
        questions: questions.map((q, i) => ({
          ...q,
          sort_order: i,
          options: q.options.map((o, oi) => ({ ...o, sort_order: oi })),
        })),
      };

      const method = data ? 'PUT' : 'POST';
      const res = await fetch(`/api/modules/${moduleId}/quiz`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save quiz');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Quiz saved successfully!');
      setInitialized(false);
      queryClient.invalidateQueries({ queryKey: ['quiz', moduleId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/modules/${moduleId}/quiz`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete quiz');
    },
    onSuccess: () => {
      toast.success('Quiz deleted');
      setSettings(DEFAULT_SETTINGS);
      setQuestions([]);
      setInitialized(false);
      queryClient.invalidateQueries({ queryKey: ['quiz', moduleId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const addQuestion = useCallback(() => {
    setQuestions(prev => [
      ...prev,
      { ...NEW_QUESTION, sort_order: prev.length },
    ]);
  }, []);

  const updateQuestion = useCallback((index: number, question: QuestionData) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = question;
      return updated;
    });
  }, []);

  const deleteQuestion = useCallback((index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-neural-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load quiz data.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Quiz Builder</h2>
        <div className="flex gap-2">
          {questions.length > 0 && (
            <NeuralButton
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </NeuralButton>
          )}
          <NeuralButton
            variant="synaptic"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !settings.title}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Quiz
          </NeuralButton>
        </div>
      </div>

      {/* Settings Section */}
      <Card className="cognitive-card">
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
          <CardDescription>Configure quiz behavior and grading</CardDescription>
        </CardHeader>
        <CardContent>
          <QuizSettingsForm settings={settings} onChange={setSettings} />
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card className="cognitive-card">
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <CardDescription>
            Total points: {questions.reduce((s, q) => s + q.points, 0)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <QuizQuestionEditor
              key={index}
              question={question}
              index={index}
              onChange={q => updateQuestion(index, q)}
              onDelete={() => deleteQuestion(index)}
              dragHandleProps={{}}
            />
          ))}

          <NeuralButton
            variant="outline"
            onClick={addQuestion}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </NeuralButton>
        </CardContent>
      </Card>

      {/* Analytics Section (only for saved quizzes) */}
      {data && (
        <Card className="cognitive-card">
          <CardHeader>
            <CardTitle>Quiz Analytics</CardTitle>
            <CardDescription>Performance data from student attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <QuizAnalytics quizId={data.id} />
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {data && (
        <Card className="cognitive-card border-red-200">
          <CardHeader>
            <CardTitle className="text-sm text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NeuralButton
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Delete Quiz
            </NeuralButton>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? This will also delete all student attempts. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <NeuralButton variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </NeuralButton>
            <NeuralButton
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                deleteMutation.mutate();
              }}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Delete Quiz
            </NeuralButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {showPreview && (
        <QuizPreview
          settings={settings}
          questions={questions}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
