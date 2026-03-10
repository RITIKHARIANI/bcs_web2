'use client';

import { Badge } from '@/components/ui/badge';

interface QuizBadgeProps {
  status: 'pending' | 'passed' | 'failed' | 'none';
  className?: string;
}

export function QuizBadge({ status, className }: QuizBadgeProps) {
  if (status === 'none') return null;

  const variants: Record<string, { label: string; classes: string }> = {
    pending: {
      label: 'Quiz',
      classes: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    passed: {
      label: 'Passed',
      classes: 'bg-green-50 text-green-700 border-green-200',
    },
    failed: {
      label: 'Not Passed',
      classes: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const v = variants[status];

  return (
    <Badge variant="outline" className={`text-xs ${v.classes} ${className || ''}`}>
      {v.label}
    </Badge>
  );
}
