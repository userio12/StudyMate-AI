'use client';

import { use, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useConversation } from '@/hooks/use-chat';
import { useTrustLevel } from '@/hooks/use-trust-level';
import { Loader2 } from 'lucide-react';
import type { ContinuityContext } from '@studymate/shared';

export default function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { conversation, isLoading } = useConversation(id);
  const { persistActivity } = useTrustLevel();

  useEffect(() => {
    persistActivity();
  }, [persistActivity]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin text-terracotta-500" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-navy-600 dark:text-parchment-400">
          Conversation not found
        </p>
      </div>
    );
  }

  const continuity: ContinuityContext | null = conversation.continuity ?? null;

  return (
    <ChatInterface
      conversationId={id}
      continuity={continuity}
      initialMessages={conversation.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        citations: m.citations as Array<{
          chunkId: string;
          documentTitle: string;
          snippet: string;
        }> | undefined,
      }))}
    />
  );
}
