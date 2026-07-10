'use client';

import { useState } from 'react';
import { RoomCard } from '@/components/rooms/room-card';
import { useRooms } from '@/hooks/use-rooms';
import { useApiClient } from '@/lib/api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSpinner, faPlus, faRightToBracket, faSignal } from '@fortawesome/free-solid-svg-icons';
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
    <div className="pb-10">
      
      {/* ── Hero Control Panel ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-surface-1/40 p-6 sm:p-10 mb-10 shadow-lg glass group">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-70" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6">
              <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              Study Rooms
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Study together in real-time. Create a new multiplayer room to collaborate with peers, or join an existing session using an invite code.
            </p>
          </div>
          
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-3">
            <button 
              onClick={() => { setShowCreate(true); setShowJoin(false); }}
              className="w-full lg:w-auto group/btn relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-extrabold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] overflow-hidden border-0"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
              Create New Room
            </button>

            <button 
              onClick={() => { setShowJoin(true); setShowCreate(false); }}
              className="w-full lg:w-auto group/btn2 inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-surface-2/50 px-8 py-4 text-base font-bold text-foreground transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 backdrop-blur-sm"
            >
              <FontAwesomeIcon icon={faRightToBracket} className="w-4 h-4 text-emerald-400 transition-transform duration-300 group-hover/btn2:translate-x-1" />
              Join with Code
            </button>
          </div>
        </div>
      </header>

      {/* Floating Inputs */}
      {showCreate && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300 bg-surface-1 mb-10 flex items-center gap-3 rounded-2xl border border-emerald-500/30 p-2 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20 max-w-xl mx-auto glass">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Name your new room..."
            aria-label="Room name"
            autoComplete="off"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="flex-1 bg-transparent px-4 py-2 text-base text-foreground placeholder:text-muted outline-none border-none focus:ring-0 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !roomName.trim()}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {creating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : 'Create'}
          </button>
        </div>
      )}

      {showJoin && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300 bg-surface-1 mb-10 flex items-center gap-3 rounded-2xl border border-emerald-500/30 p-2 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20 max-w-xl mx-auto glass">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code..."
            aria-label="Invite code"
            autoComplete="off"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="flex-1 bg-transparent px-4 py-2 text-base font-mono text-foreground placeholder:text-muted outline-none border-none focus:ring-0 focus:outline-none uppercase"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <button
            onClick={handleJoin}
            disabled={!inviteCode.trim()}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            Join
          </button>
        </div>
      )}

      {/* ── Active Rooms ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between px-1 mb-6">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <FontAwesomeIcon icon={faSignal} className="w-4 h-4 text-emerald-500" /> Active Rooms
          </h2>
          {!isLoading && rooms.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-muted-fg border border-border">
              {rooms.length} Room{rooms.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[140px] animate-pulse rounded-[1.5rem] bg-surface-2/50 border border-border/50"
              />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="glass-card mt-4 flex flex-col items-center gap-4 py-20 text-center rounded-[2rem] border-dashed border-2 hover:border-emerald-500/30 transition-colors">
            <div className="rounded-2xl bg-emerald-500/10 p-5 border border-emerald-500/20">
              <FontAwesomeIcon icon={faUsers} className="text-emerald-400 w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                No active rooms
              </p>
              <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
                Create a new room or use an invite code to start studying with friends in real-time.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </div>
  );
}
