'use client';

import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export interface OptionData {
  id?: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

interface QuizQuestionOptionEditorProps {
  option: OptionData;
  index: number;
  questionType: string;
  onChange: (option: OptionData) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function QuizQuestionOptionEditor({
  option,
  index,
  questionType,
  onChange,
  onDelete,
  canDelete,
}: QuizQuestionOptionEditorProps) {
  const inputType = questionType === 'multiple_select' ? 'checkbox' : 'radio';

  return (
    <div className="flex items-center gap-2 group">
      <input
        type={inputType}
        checked={option.is_correct}
        onChange={e => onChange({ ...option, is_correct: e.target.checked })}
        className="h-4 w-4 text-neural-primary focus:ring-neural-primary shrink-0"
        title={option.is_correct ? 'Correct answer' : 'Mark as correct'}
      />
      <Input
        value={option.option_text}
        onChange={e => onChange({ ...option, option_text: e.target.value })}
        placeholder={`Option ${index + 1}`}
        className="flex-1"
      />
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove option"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
