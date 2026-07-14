'use client';

import { useRouter } from 'next/navigation';
import { useConversations } from '@/hooks/use-chat';
import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  const router = useRouter();
  const { mutate } = useConversations();

  const handleCreated = (id: string) => {
    mutate(); // Refresh the sidebar conversation list
    window.history.replaceState(null, '', `/chat/${id}`); // Seamlessly update URL without React unmounting
  };

  return (
    <ChatInterface onConversationCreated={handleCreated} />
  );
}
