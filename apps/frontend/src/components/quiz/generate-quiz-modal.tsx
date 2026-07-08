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
  onGenerate: (difficulty: DifficultyLevel) => Promise<void>;
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

  const handleGenerate = async () => {
    await onGenerate(selectedDifficulty);
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
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-fg mt-1">
            {selectedDifficulty === defaultDifficulty && (
              <span className="text-brand-500 font-medium">Recommended for you</span>
            )}
          </p>
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
