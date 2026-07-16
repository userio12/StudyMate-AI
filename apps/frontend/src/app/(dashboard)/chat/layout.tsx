'use client';

import { useConversations } from '@/hooks/use-chat';
import { useRouter } from 'next/navigation';
import { ConversationList } from '@/components/chat/conversation-list';
import { DashboardSidebar } from '@/components/dashboard-shell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
  const { conversations } = useConversations();
  const router = useRouter();

  const handleCreate = () => {
    router.push('/chat');
  };

  return (
    <>
      <DashboardSidebar>
        {/* Top Header with Back Button */}
        <div className="flex h-16 shrink-0 items-center border-b border-border/50 px-4">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 group-hover:bg-surface-hover transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </div>
            Back to Dashboard
          </Link>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted tracking-wider uppercase mb-2">Your Chats</p>
            <ConversationList conversations={conversations} onCreate={handleCreate} />
          </div>
        </div>
      </DashboardSidebar>
      
      {/* The main chat interface will render normally here */}
      <div className="flex-1 h-full min-h-[calc(100vh-8rem)]">
        {children}
      </div>
    </>
  );
}
