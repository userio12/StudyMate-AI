'use client';

import { useState } from 'react';
import { RoomCard } from '@/components/rooms/room-card';
import { useRooms } from '@/hooks/use-rooms';
import { useApiClient } from '@/lib/api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSpinner, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
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
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Study Rooms
          </h1>
          <p className="mt-1 text-sm text-muted">
            Study together with friends in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJoin(!showJoin)}
            className="glass-card inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-surface-2 active:scale-95"
          >
            <FontAwesomeIcon icon={faRightToBracket} className="w-4 h-4" />
            Join
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 brand-glow hover:scale-[1.02] active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            Create room
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="glass mt-4 flex items-center gap-2 rounded-2xl border border-border p-1.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
            aria-label="Room name"
            autoComplete="off"
            className="flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted outline-none border-none focus:ring-0 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !roomName.trim()}
            className="flex h-9 min-w-20 items-center justify-center rounded-xl brand-gradient text-sm font-medium text-white brand-glow transition-all duration-200 hover:opacity-90 hover:scale-[1.05] disabled:opacity-40 disabled:pointer-events-none"
          >
            {creating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : 'Create'}
          </button>
        </div>
      )}

      {showJoin && (
        <div className="glass mt-4 flex items-center gap-2 rounded-2xl border border-border p-1.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            aria-label="Invite code"
            autoComplete="off"
            className="flex-1 bg-transparent px-3 text-sm font-mono text-foreground placeholder:text-muted outline-none border-none focus:ring-0 focus:outline-none uppercase"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <button
            onClick={handleJoin}
            disabled={!inviteCode.trim()}
            className="flex h-9 min-w-20 items-center justify-center rounded-xl brand-gradient text-sm font-medium text-white brand-glow transition-all duration-200 hover:opacity-90 hover:scale-[1.05] disabled:opacity-40 disabled:pointer-events-none"
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
              className="h-28 animate-pulse rounded-xl bg-white/30 dark:bg-white/5"
            />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass-card mt-12 flex flex-col items-center gap-3 py-16 text-center border-brand-500/20 max-w-2xl mx-auto">
          <div className="studymate-glow rounded-full p-4">
            <FontAwesomeIcon icon={faUsers} className="text-white w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted">
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
