import { useState } from 'react';
import { Dialog, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import type { DifficultyLevel } from '@studymate/shared';

interface GenerateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDifficulty: DifficultyLevel;
  onGenerate: (difficulty: DifficultyLevel, topic?: string) => Promise<void>;
  generating: boolean;
}

export function GenerateQuizModal({
  open,
  onOpenChange,
  defaultDifficulty,
  onGenerate,
  generating,
}: GenerateQuizModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(defaultDifficulty);
  const [topic, setTopic] = useState('');

  const handleGenerate = async () => {
    await onGenerate(selectedDifficulty, topic.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Generate Quiz</DialogTitle>
        <DialogDescription>
          Customize your quiz settings before generating.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Difficulty Level
          </label>
          <Select 
            value={selectedDifficulty} 
            onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel)}
            disabled={generating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adaptive">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-brand-500 w-3 h-3" />
                  Adaptive (AI-Powered)
                </span>
              </SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-fg mt-1">
            {selectedDifficulty === 'adaptive' ? (
              <span className="text-brand-500 font-medium">Dynamically adjusts based on your past quiz performance</span>
            ) : selectedDifficulty === defaultDifficulty && (
              <span className="text-brand-500 font-medium">Recommended based on your Trust Level</span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Custom Topic (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., React Hooks, Mitochondria..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generating}
            className="w-full rounded-xl bg-surface-1 border border-border px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            disabled={generating}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 brand-glow hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
            ) : (
              <FontAwesomeIcon icon={faWandMagicSparkles} className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>
      </div>
    </Dialog>
  );
}
