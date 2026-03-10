'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuizQuestionProps {
  question: {
    id: string;
    question_type: string;
    question_text: string;
    points: number;
    options: Array<{
      id: string;
      option_text: string;
    }>;
  };
  index: number;
  selectedOptionIds: string[];
  textAnswer: string;
  onSelectOption: (questionId: string, optionIds: string[]) => void;
  onTextAnswer: (questionId: string, text: string) => void;
  disabled?: boolean;
}

export function QuizQuestion({
  question,
  index,
  selectedOptionIds,
  textAnswer,
  onSelectOption,
  onTextAnswer,
  disabled,
}: QuizQuestionProps) {
  const handleRadioChange = (optionId: string) => {
    onSelectOption(question.id, [optionId]);
  };

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    const newIds = checked
      ? [...selectedOptionIds, optionId]
      : selectedOptionIds.filter(id => id !== optionId);
    onSelectOption(question.id, newIds);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="font-medium text-sm text-muted-foreground shrink-0 pt-0.5">
          {index + 1}.
        </span>
        <div className="flex-1">
          <p className="font-medium">{question.question_text}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {question.points} point{question.points !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="ml-6">
        {/* Multiple Choice / True-False */}
        {(question.question_type === 'multiple_choice' ||
          question.question_type === 'true_false') && (
          <div className="space-y-2">
            {question.options.map(opt => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedOptionIds.includes(opt.id)
                    ? 'border-neural-primary bg-neural-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={selectedOptionIds.includes(opt.id)}
                  onChange={() => handleRadioChange(opt.id)}
                  disabled={disabled}
                  className="h-4 w-4 text-neural-primary focus:ring-neural-primary"
                />
                <span className="text-sm">{opt.option_text}</span>
              </label>
            ))}
          </div>
        )}

        {/* Multiple Select */}
        {question.question_type === 'multiple_select' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-1">Select all that apply</p>
            {question.options.map(opt => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedOptionIds.includes(opt.id)
                    ? 'border-neural-primary bg-neural-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedOptionIds.includes(opt.id)}
                  onChange={e => handleCheckboxChange(opt.id, e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 rounded text-neural-primary focus:ring-neural-primary"
                />
                <span className="text-sm">{opt.option_text}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {question.question_type === 'short_answer' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Your answer</Label>
            <Textarea
              value={textAnswer}
              onChange={e => onTextAnswer(question.id, e.target.value)}
              placeholder="Type your answer..."
              rows={3}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
