'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useRoomChat } from '@/hooks/use-room-chat';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Send, Loader2, Wifi, WifiOff } from 'lucide-react';

interface RoomChatProps {
  roomId: string;
  currentUserId: string;
}

export function RoomChat({ roomId, currentUserId }: RoomChatProps) {
  const {
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    sendMessage,
    handleInputChange,
  } = useRoomChat(roomId);

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  }

  return (
    <div className="flex h-96 flex-col rounded-xl border border-parchment-300 bg-parchment-50 dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-center justify-between border-b border-parchment-300 px-4 py-2 dark:border-navy-700">
        <span className="text-xs text-navy-500 dark:text-parchment-400">
          {onlineUsers.length} online
        </span>
        {isConnected ? (
          <Wifi size={14} className="text-green-500" />
        ) : (
          <WifiOff size={14} className="text-red-500" />
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-navy-500 dark:text-parchment-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.userId === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-xs rounded-xl px-3 py-2 text-sm',
                  isOwn
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-parchment-200 text-navy-800 dark:bg-navy-700 dark:text-parchment-200',
                )}
              >
                <p>{msg.content}</p>
                <p
                  className={cn(
                    'mt-1 text-right text-[10px]',
                    isOwn ? 'text-terracotta-100' : 'text-navy-500 dark:text-parchment-400',
                  )}
                >
                  {formatRelativeTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-navy-500 dark:text-parchment-400">
            <Loader2 size={12} className="animate-spin" />
            Someone is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-parchment-300 p-3 dark:border-navy-700"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleInputChange();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-parchment-300 bg-parchment-100 px-3 py-2 text-sm text-navy-800 placeholder:text-parchment-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500 dark:border-navy-600 dark:bg-navy-900 dark:text-parchment-100 dark:placeholder:text-navy-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || !isConnected}
          className="rounded-lg bg-terracotta-500 p-2 text-white transition-colors hover:bg-terracotta-600 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
