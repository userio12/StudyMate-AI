'use client';

import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
import { useConversations } from '@/hooks/use-chat';
import { ConversationList } from '@/components/chat/conversation-list';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const router = useRouter();
  const api = useApiClient();
  const { conversations, isLoading } = useConversations();

  const handleCreate = async () => {
    try {
      const { id } = await api.post<{ id: string; title: string }>('/chat/conversations', {
        title: 'New conversation',
      });
      router.push(`/chat/${id}`);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-white/30 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="glass-card mt-12 flex flex-col items-center gap-4 py-16 text-center max-w-2xl mx-auto">
        <div className="rounded-full bg-surface-2 p-4 border border-border/50">
          <FontAwesomeIcon icon={faCommentDots} className="text-muted w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-muted">
          No conversations yet. Start a new one.
        </p>
        <Button onClick={handleCreate} className="mt-2">
          New conversation
        </Button>
      </div>
    );
  }

  return <ConversationList conversations={conversations} onCreate={handleCreate} />;
}
