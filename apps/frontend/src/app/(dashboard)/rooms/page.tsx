'use client';

import { useState } from 'react';
import { RoomCard } from '@/components/rooms/room-card';
import { useRooms } from '@/hooks/use-rooms';
import { useApiClient } from '@/lib/api-client';
import { Users, Loader2, Plus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';

export default function RoomsPage() {
  const { rooms, isLoading, mutate } = useRooms();
  const api = useApiClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    setCreating(true);
    try {
      await api.post('/rooms', { name: roomName });
      await mutate();
      setRoomName('');
      setShowCreate(false);
      toast.success('Room created');
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    try {
      await api.post(`/rooms/${inviteCode}/join`);
      await mutate();
      setInviteCode('');
      setShowJoin(false);
      toast.success('Joined room');
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy-800 dark:text-parchment-100">
            Study Rooms
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
            Study together with friends in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJoin(!showJoin)}
            className="inline-flex items-center gap-2 rounded-lg border border-parchment-300 px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-parchment-100 dark:border-navy-600 dark:text-parchment-300"
          >
            <LogIn size={16} />
            Join
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
          >
            <Plus size={16} />
            Create room
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
            aria-label="Room name"
            autoComplete="off"
            className="flex-1 rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-navy-800 placeholder:text-navy-400 focus:border-terracotta-500 focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-parchment-100"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !roomName.trim()}
            className="rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600 disabled:opacity-50"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
          </button>
        </div>
      )}

      {showJoin && (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            aria-label="Invite code"
            autoComplete="off"
            className="flex-1 rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm font-mono text-navy-800 placeholder:text-navy-400 focus:border-terracotta-500 focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-parchment-100"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <button
            onClick={handleJoin}
            disabled={!inviteCode.trim()}
            className="rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600 disabled:opacity-50"
          >
            Join
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-parchment-200 dark:bg-navy-800"
            />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="studymate-glow rounded-full p-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
            No rooms yet. Create or join one.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.name}
              inviteCode={room.inviteCode}
              createdAt={room.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
