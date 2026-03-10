'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface QuizSettings {
  title: string;
  description: string;
  status: 'draft' | 'published';
  time_limit_minutes: number | null;
  max_attempts: number;
  pass_threshold: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: 'after_submission' | 'after_each' | 'never';
  require_pass_to_complete: boolean;
  xp_reward: number;
}

interface QuizSettingsFormProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
}

export function QuizSettingsForm({ settings, onChange }: QuizSettingsFormProps) {
  const update = (partial: Partial<QuizSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quiz-title">Quiz Title *</Label>
          <Input
            id="quiz-title"
            value={settings.title}
            onChange={e => update({ title: e.target.value })}
            placeholder="e.g., Module 1 Assessment"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quiz-desc">Description</Label>
          <Textarea
            id="quiz-desc"
            value={settings.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="Optional instructions for students..."
            rows={3}
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={settings.status}
          onValueChange={(v: 'draft' | 'published') => update({ status: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft (hidden from students)</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time & Attempts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time-limit">Time Limit (minutes)</Label>
          <Input
            id="time-limit"
            type="number"
            min={0}
            value={settings.time_limit_minutes ?? ''}
            onChange={e => {
              const v = e.target.value;
              update({ time_limit_minutes: v === '' ? null : parseInt(v) || null });
            }}
            placeholder="No limit"
          />
          <p className="text-xs text-muted-foreground">Leave empty for no time limit</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-attempts">Max Attempts</Label>
          <Input
            id="max-attempts"
            type="number"
            min={0}
            value={settings.max_attempts}
            onChange={e => update({ max_attempts: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">0 = unlimited</p>
        </div>
      </div>

      {/* Pass Threshold & XP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pass-threshold">Pass Threshold (%)</Label>
          <Input
            id="pass-threshold"
            type="number"
            min={0}
            max={100}
            value={settings.pass_threshold}
            onChange={e => update({ pass_threshold: parseInt(e.target.value) || 70 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="xp-reward">XP Reward</Label>
          <Input
            id="xp-reward"
            type="number"
            min={0}
            max={10000}
            value={settings.xp_reward}
            onChange={e => update({ xp_reward: parseInt(e.target.value) || 50 })}
          />
          <p className="text-xs text-muted-foreground">Bonus XP pool for quiz</p>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Shuffle Questions</Label>
            <p className="text-xs text-muted-foreground">Randomize question order</p>
          </div>
          <Switch
            checked={settings.shuffle_questions}
            onCheckedChange={v => update({ shuffle_questions: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Shuffle Options</Label>
            <p className="text-xs text-muted-foreground">Randomize answer choices</p>
          </div>
          <Switch
            checked={settings.shuffle_options}
            onCheckedChange={v => update({ shuffle_options: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Require Pass to Complete Module</Label>
            <p className="text-xs text-muted-foreground">Students must pass this quiz before marking the module complete</p>
          </div>
          <Switch
            checked={settings.require_pass_to_complete}
            onCheckedChange={v => update({ require_pass_to_complete: v })}
          />
        </div>
      </div>

      {/* Show Correct Answers */}
      <div className="space-y-2">
        <Label>Show Correct Answers</Label>
        <Select
          value={settings.show_correct_answers}
          onValueChange={(v: 'after_submission' | 'after_each' | 'never') =>
            update({ show_correct_answers: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="after_submission">After submission</SelectItem>
            <SelectItem value="after_each">After each question</SelectItem>
            <SelectItem value="never">Never</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
