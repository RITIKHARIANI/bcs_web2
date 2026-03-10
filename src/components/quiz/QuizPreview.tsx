'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NeuralButton } from '@/components/ui/neural-button';
import { X } from 'lucide-react';
import type { QuizSettings } from './QuizSettingsForm';
import type { QuestionData } from './QuizQuestionEditor';

interface QuizPreviewProps {
  settings: QuizSettings;
  questions: QuestionData[];
  onClose: () => void;
}

export function QuizPreview({ settings, questions, onClose }: QuizPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center px-4 pt-8 pb-4 z-[100] overflow-y-auto">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{settings.title || 'Untitled Quiz'}</CardTitle>
            {settings.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {settings.description}
              </p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {settings.time_limit_minutes && (
                <Badge variant="outline">{settings.time_limit_minutes} min</Badge>
              )}
              <Badge variant="outline">Pass: {settings.pass_threshold}%</Badge>
              <Badge variant="outline">
                {questions.reduce((s, q) => s + q.points, 0)} pts
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-medium text-sm text-muted-foreground shrink-0">
                  {i + 1}.
                </span>
                <div className="flex-1">
                  <p className="font-medium">{q.question_text || 'Untitled question'}</p>
                  <p className="text-xs text-muted-foreground">{q.points} point{q.points !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {q.question_type !== 'short_answer' && (
                <div className="ml-6 space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className="flex items-center gap-2 p-2 rounded border text-sm"
                    >
                      <div className={`w-4 h-4 rounded-${q.question_type === 'multiple_select' ? 'sm' : 'full'} border-2 border-gray-300 shrink-0`} />
                      <span>{opt.option_text || `Option ${oi + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}

              {q.question_type === 'short_answer' && (
                <div className="ml-6">
                  <div className="border rounded p-3 text-sm text-muted-foreground bg-gray-50">
                    Student answer field...
                  </div>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              No questions added yet
            </p>
          )}

          <div className="pt-4 border-t">
            <NeuralButton variant="neural" className="w-full" disabled>
              Submit Quiz (Preview Only)
            </NeuralButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
