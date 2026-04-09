'use client';

import { useEffect, useState } from 'react';
import { NeuralButton } from '@/components/ui/neural-button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, ChevronDown, Users } from 'lucide-react';
import { toast } from 'sonner';

type CsvSheet = 'quiz' | 'gradebook';

interface Group {
  id: string;
  name: string;
  memberCount: number;
}

interface QuizExportButtonProps {
  courseId: string;
}

export function QuizExportButton({ courseId }: QuizExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvSheet, setCsvSheet] = useState<CsvSheet>('gradebook');
  const [groups, setGroups] = useState<Group[]>([]);
  // "all" sentinel means export every enrolled student (no group filter)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  // Fetch groups on mount so the picker can show them. Non-fatal if it fails
  // — faculty can still export "all enrolled" and the select just stays hidden.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/faculty/courses/${courseId}/groups`)
      .then((res) => (res.ok ? res.json() : { groups: [] }))
      .then((data) => {
        if (!cancelled) setGroups(data.groups || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const download = async (format: 'xlsx' | 'csv', sheet?: CsvSheet) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ format });
      if (format === 'csv' && sheet) params.set('sheet', sheet);
      if (selectedGroupId !== 'all') params.set('groupId', selectedGroupId);

      const res = await fetch(
        `/api/faculty/courses/${courseId}/quiz-export?${params.toString()}`
      );
      if (!res.ok) {
        toast.error('Failed to export grades');
        return;
      }

      const blob = await res.blob();

      // Try to pull filename from Content-Disposition, fall back to a default
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ||
        `gradebook-${courseId}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Grades exported successfully');
      setCsvDialogOpen(false);
    } catch {
      toast.error('Failed to export grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Group picker — only shown when the course has at least one group */}
      {groups.length > 0 && (
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="h-9 w-auto min-w-[180px]">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All enrolled students</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name} ({g.memberCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <NeuralButton variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Export Grades
            <ChevronDown className="h-4 w-4 ml-1" />
          </NeuralButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => download('xlsx')}>
            <div className="flex flex-col">
              <span className="font-medium">Excel (.xlsx)</span>
              <span className="text-xs text-muted-foreground">
                Course gradebook + quiz-by-quiz breakdown
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCsvDialogOpen(true)}>
            <div className="flex flex-col">
              <span className="font-medium">CSV</span>
              <span className="text-xs text-muted-foreground">
                Gradebook or quiz breakdown (pick one)
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export as CSV</DialogTitle>
            <DialogDescription>
              CSV files can only contain one sheet. Choose which one to download.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            value={csvSheet}
            onValueChange={(v) => setCsvSheet(v as CsvSheet)}
            className="gap-3 py-2"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="gradebook" id="csv-gradebook" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="csv-gradebook" className="cursor-pointer font-medium">
                  Course gradebook
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  One row per student with their overall grade and totals
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="quiz" id="csv-quiz" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="csv-quiz" className="cursor-pointer font-medium">
                  Quiz-by-quiz breakdown
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  One row per student per quiz with scores and attempts
                </p>
              </div>
            </div>
          </RadioGroup>

          <DialogFooter>
            <NeuralButton
              variant="outline"
              size="sm"
              onClick={() => setCsvDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </NeuralButton>
            <NeuralButton
              variant="neural"
              size="sm"
              onClick={() => download('csv', csvSheet)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download
            </NeuralButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
