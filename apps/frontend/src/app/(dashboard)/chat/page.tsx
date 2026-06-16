'use client';

import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
import { useConversations } from '@/hooks/use-chat';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageSquare } from 'lucide-react';
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
          <div key={i} className="h-12 rounded-lg bg-parchment-200 dark:bg-navy-800" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="studymate-glow rounded-full p-4">
          <MessageSquare size={32} className="text-white" />
        </div>
        <p className="text-center text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
          No conversations yet. Start a new one.
        </p>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
        >
          New conversation
        </button>
      </div>
    );
  }

  return <ConversationList conversations={conversations} onCreate={handleCreate} />;
}
