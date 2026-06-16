import { create } from 'zustand';

interface Conversation {
  id: string;
  title: string;
  lastMessageAt?: string | null;
}

interface ChatState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
}));
