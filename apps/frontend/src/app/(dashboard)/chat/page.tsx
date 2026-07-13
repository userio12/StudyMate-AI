'use client';

import { useRouter } from 'next/navigation';
import { useConversations } from '@/hooks/use-chat';
import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  const router = useRouter();
  const { mutate } = useConversations();

  const handleCreated = (id: string) => {
    mutate(); // Refresh the sidebar conversation list
    router.replace(`/chat/${id}`); // Seamlessly update URL without full reload
  };

  return (
    <ChatInterface onConversationCreated={handleCreated} />
  );
}
