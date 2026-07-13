'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/api-client';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const api = useApiClient();
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      await api.post('/tasks', {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      
      // Refresh the tasks list on the page
      await mutate('/tasks');
      
      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setDueDate('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} position="right">
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogDescription>
          Add a new assignment, reading, or deadline to your Kanban board.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read Chapter 4"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
            Description <span className="text-muted-fg text-xs font-normal">(Optional)</span>
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details..."
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1.5">
            Due Date <span className="text-muted-fg text-xs font-normal">(Optional)</span>
          </label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-foreground min-h-[40px] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!title.trim() || isSubmitting}
            className="bg-brand-500 hover:bg-brand-400 text-white min-w-[100px]"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
