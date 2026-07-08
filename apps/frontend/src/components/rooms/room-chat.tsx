'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useRoomChat } from '@/hooks/use-room-chat';
import { cn, formatRelativeTime } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faWifi } from '@fortawesome/free-solid-svg-icons';

interface RoomChatProps {
  roomId: string;
  currentUserId: string;
}

export function RoomChat({ roomId, currentUserId }: RoomChatProps) {
  const { messages, onlineUsers, isConnected, typingUsers, sendMessage, handleInputChange } =
    useRoomChat(roomId);
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
    <div className="glass-card flex flex-col overflow-hidden" style={{ height: '480px' }}>
      {/* ── Header ────── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-ring" />
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faWifi} className="text-red-400 w-3 h-3 opacity-50" />
              <span className="text-xs text-red-400">Offline</span>
            </span>
          )}
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{onlineUsers.length} online</span>
        </div>
        <div className="flex -space-x-1.5">
          {onlineUsers.slice(0, 4).map((uid) => (
            <div
              key={uid}
              className="h-6 w-6 rounded-full brand-gradient border border-space-900 flex items-center justify-center"
              title={uid}
            >
              <span className="text-[10px] font-bold text-white">
                {uid.slice(0, 1).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Messages ──── */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-2xl">
              💬
            </div>
            <p className="text-sm font-medium text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-600">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.userId === currentUserId;
          return (
            <div key={msg.id} className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
              {/* Avatar */}
              <div className={cn(
                'h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5',
                isOwn ? 'brand-gradient text-white' : 'bg-surface-3 text-slate-400',
              )}>
                {msg.userId.slice(0, 1).toUpperCase()}
              </div>

              <div className={cn('flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start', 'max-w-[70%]')}>
                <div className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-sm leading-snug',
                  isOwn
                    ? 'brand-gradient text-white rounded-tr-sm'
                    : 'bg-surface-2 border border-border text-slate-200 rounded-tl-sm',
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-700 px-1">
                  {formatRelativeTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600">
              {typingUsers.length === 1 ? 'Someone is' : `${typingUsers.length} people are`} typing...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ─────── */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-2xl bg-surface-1 border border-border p-1.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleInputChange();
            }}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1 bg-transparent px-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none border-none focus:ring-0 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white brand-glow transition-all duration-200 hover:opacity-90 hover:scale-[1.05] disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Send message"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-[14px] h-[14px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
