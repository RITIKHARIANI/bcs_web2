'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NeuralButton } from '@/components/ui/neural-button';
import { QuizQuestionOptionEditor, type OptionData } from './QuizQuestionOptionEditor';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

export interface QuestionData {
  id?: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer';
  question_text: string;
  explanation: string;
  sort_order: number;
  points: number;
  short_answer_keywords: string[];
  case_sensitive: boolean;
  options: OptionData[];
}

interface QuizQuestionEditorProps {
  question: QuestionData;
  index: number;
  onChange: (question: QuestionData) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  multiple_select: 'Multiple Select',
  true_false: 'True / False',
  short_answer: 'Short Answer',
};

const TYPE_COLORS: Record<string, string> = {
  multiple_choice: 'bg-blue-100 text-blue-800',
  multiple_select: 'bg-purple-100 text-purple-800',
  true_false: 'bg-green-100 text-green-800',
  short_answer: 'bg-orange-100 text-orange-800',
};

export function QuizQuestionEditor({
  question,
  index,
  onChange,
  onDelete,
  dragHandleProps,
}: QuizQuestionEditorProps) {
  const update = (partial: Partial<QuestionData>) => {
    onChange({ ...question, ...partial });
  };

  const handleTypeChange = (type: QuestionData['question_type']) => {
    let options = question.options;

    if (type === 'true_false') {
      options = [
        { option_text: 'True', is_correct: true, sort_order: 0 },
        { option_text: 'False', is_correct: false, sort_order: 1 },
      ];
    } else if (type === 'short_answer') {
      options = [];
    } else if (
      question.question_type === 'true_false' ||
      question.question_type === 'short_answer'
    ) {
      // Switching from TF or SA to MC/MS - start fresh
      options = [
        { option_text: '', is_correct: false, sort_order: 0 },
        { option_text: '', is_correct: false, sort_order: 1 },
      ];
    }

    update({ question_type: type, options });
  };

  const updateOption = (optIndex: number, option: OptionData) => {
    const newOptions = [...question.options];

    // For MC/TF: only one correct answer
    if (
      option.is_correct &&
      (question.question_type === 'multiple_choice' ||
        question.question_type === 'true_false')
    ) {
      newOptions.forEach((o, i) => {
        if (i !== optIndex) o.is_correct = false;
      });
    }

    newOptions[optIndex] = option;
    update({ options: newOptions });
  };

  const addOption = () => {
    update({
      options: [
        ...question.options,
        {
          option_text: '',
          is_correct: false,
          sort_order: question.options.length,
        },
      ],
    });
  };

  const removeOption = (optIndex: number) => {
    const newOptions = question.options
      .filter((_, i) => i !== optIndex)
      .map((o, i) => ({ ...o, sort_order: i }));
    update({ options: newOptions });
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    update({ short_answer_keywords: keywords });
  };

  const showOptions =
    question.question_type !== 'short_answer';
  const isFixedOptions = question.question_type === 'true_false';

  return (
    <Card className="cognitive-card">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div {...dragHandleProps} className="pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">
                Q{index + 1}
              </span>
              <Badge className={TYPE_COLORS[question.question_type] || ''}>
                {TYPE_LABELS[question.question_type]}
              </Badge>
              <div className="ml-auto flex items-center gap-2">
                <Label htmlFor={`pts-${index}`} className="text-xs text-muted-foreground">
                  Points:
                </Label>
                <Input
                  id={`pts-${index}`}
                  type="number"
                  min={1}
                  value={question.points}
                  onChange={e =>
                    update({ points: parseInt(e.target.value) || 1 })
                  }
                  className="w-16 h-8 text-sm"
                />
              </div>
            </div>

            {/* Type Selector */}
            <Select
              value={question.question_type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="multiple_select">Multiple Select</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>

            {/* Question Text */}
            <Textarea
              value={question.question_text}
              onChange={e => update({ question_text: e.target.value })}
              placeholder="Enter your question..."
              rows={2}
            />

            {/* Options (MC, MS, TF) */}
            {showOptions && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {question.question_type === 'multiple_select'
                    ? 'Check all correct answers'
                    : 'Select the correct answer'}
                </Label>
                {question.options.map((option, oi) => (
                  <QuizQuestionOptionEditor
                    key={oi}
                    option={option}
                    index={oi}
                    questionType={question.question_type}
                    onChange={o => updateOption(oi, o)}
                    onDelete={() => removeOption(oi)}
                    canDelete={!isFixedOptions && question.options.length > 2}
                  />
                ))}
                {!isFixedOptions && (
                  <NeuralButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="mt-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </NeuralButton>
                )}
              </div>
            )}

            {/* Short Answer Keywords */}
            {question.question_type === 'short_answer' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Acceptable Keywords (comma-separated)
                </Label>
                <Input
                  value={question.short_answer_keywords.join(', ')}
                  onChange={e => handleKeywordsChange(e.target.value)}
                  placeholder="keyword1, keyword2, ..."
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to require manual grading. Answers containing any keyword are auto-graded as correct.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={question.case_sensitive}
                    onChange={e =>
                      update({ case_sensitive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label className="text-xs text-muted-foreground cursor-pointer">
                    Case sensitive
                  </Label>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Explanation (shown after answering)
              </Label>
              <Textarea
                value={question.explanation}
                onChange={e => update({ explanation: e.target.value })}
                placeholder="Optional explanation..."
                rows={2}
              />
            </div>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete question"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
