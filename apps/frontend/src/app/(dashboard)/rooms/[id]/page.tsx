'use client';

import { use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRoom } from '@/hooks/use-rooms';
import { RoomChat } from '@/components/rooms/room-chat';
import { InviteCodeDisplay } from '@/components/rooms/invite-code-display';
import { OnlineUsers } from '@/components/rooms/online-users';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-500 dark:text-brand-300 w-6 h-6" />
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-ink-400 dark:text-ink-200">
          Room not found
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/rooms"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 dark:text-ink-200"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to rooms
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink-600 dark:text-cream-100">
            {room.name}
          </h1>
          <div className="mt-2">
            <InviteCodeDisplay code={room.inviteCode} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-400 dark:text-ink-200">
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
