'use client';

import { use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRoom } from '@/hooks/use-rooms';
import { RoomChat } from '@/components/rooms/room-chat';
import { InviteCodeDisplay } from '@/components/rooms/invite-code-display';
import { OnlineUsers } from '@/components/rooms/online-users';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { room, isLoading } = useRoom(id);
  const { user, isLoaded } = useUser();

  if (isLoading || !isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin text-terracotta-500" />
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-navy-600 dark:text-parchment-400">
          Room not found
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/rooms"
        className="mb-4 inline-flex items-center gap-1 text-sm text-navy-600 hover:text-navy-800 dark:text-parchment-400"
      >
        <ArrowLeft size={16} />
        Back to rooms
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-navy-800 dark:text-parchment-100">
            {room.name}
          </h1>
          <div className="mt-2">
            <InviteCodeDisplay code={room.inviteCode} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-navy-500 dark:text-parchment-400">
            {room.members.length} online
          </span>
          <OnlineUsers
            users={room.members.map((m) => ({ id: m.userId }))}
          />
        </div>
      </div>

      <div className="mt-8">
        <RoomChat roomId={id} currentUserId={user.id} />
      </div>
    </div>
  );
}
