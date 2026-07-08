'use client';

import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
import { useConversations } from '@/hooks/use-chat';
import { ConversationList } from '@/components/chat/conversation-list';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';

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
      <div className="glass-card mt-12 flex flex-col items-center gap-4 py-16 text-center border-brand-500/20 max-w-2xl mx-auto">
        <div className="studymate-glow rounded-full p-4">
          <FontAwesomeIcon icon={faCommentDots} className="text-white w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-muted">
          No conversations yet. Start a new one.
        </p>
        <button
          onClick={handleCreate}
          className="rounded-lg brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 brand-glow hover:scale-105 active:scale-95 mt-2"
        >
          New conversation
        </button>
      </div>
    );
  }

  return <ConversationList conversations={conversations} onCreate={handleCreate} />;
}
