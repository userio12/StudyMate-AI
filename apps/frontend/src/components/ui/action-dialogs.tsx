'use client';

import * as React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrash, faPenToSquare, faThumbtack } from '@fortawesome/free-solid-svg-icons';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isPending?: boolean;
}

interface RenameDialogProps extends ActionDialogProps {
  currentName: string;
  onConfirm: (newName: string) => void;
}

export function RenameDialog({
  open,
  onOpenChange,
  title,
  currentName,
  onConfirm,
  isPending,
}: RenameDialogProps) {
  const [name, setName] = React.useState(currentName);

  React.useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== currentName) {
      onConfirm(name.trim());
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4 text-brand-400" />
          {title}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new name..."
            autoFocus
            disabled={isPending}
            className="w-full"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !name.trim() || name === currentName}
            className="min-w-[80px]"
          >
            {isPending ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

interface ConfirmDeleteDialogProps extends ActionDialogProps {
  itemName: string;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  itemName,
  onConfirm,
  isPending,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-500">
          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          {title}
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>&quot;{itemName}&quot;</strong>? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          className="min-w-[90px]"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : 'Delete'}
        </Button>
      </div>
    </Dialog>
  );
}

interface ConfirmPinDialogProps extends ActionDialogProps {
  itemName: string;
  isPinned: boolean;
  onConfirm: () => void;
}

export function ConfirmPinDialog({
  open,
  onOpenChange,
  title,
  itemName,
  isPinned,
  onConfirm,
  isPending,
}: ConfirmPinDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faThumbtack} className="w-4 h-4 text-brand-400" />
          {title}
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to {isPinned ? 'unpin' : 'pin'} <strong>&quot;{itemName}&quot;</strong>?
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onConfirm}
          disabled={isPending}
          className="min-w-[90px]"
        >
          {isPending ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : isPinned ? 'Unpin' : 'Pin'}
        </Button>
      </div>
    </Dialog>
  );
}
