'use client';

import { use, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useConversation } from '@/hooks/use-chat';
import { useTrustLevel } from '@/hooks/use-trust-level';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
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
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-500 dark:text-brand-300 w-6 h-6" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-ink-400 dark:text-ink-200">
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
