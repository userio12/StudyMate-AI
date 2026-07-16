'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/api-client';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    isSubmitting: false,
    error: ''
  });
  
  const api = useApiClient();
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setForm(prev => ({ ...prev, isSubmitting: true, error: '' }));
      
      await api.post('/tasks', {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      });
      
      // Refresh the tasks list on the page
      await mutate('/tasks');
      
      // Reset form and close dialog
      setForm({ title: '', description: '', dueDate: '', isSubmitting: false, error: '' });
      onOpenChange(false);
    } catch (err: any) {
      setForm(prev => ({ ...prev, error: err.message || 'Failed to create task', isSubmitting: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new assignment, reading, or deadline to your Kanban board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {form.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {form.error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
              Title
            </label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="text-foreground min-h-[40px] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={form.isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!form.title.trim() || form.isSubmitting}
              className="bg-brand-500 hover:bg-brand-400 text-white min-w-[100px]"
            >
              {form.isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
