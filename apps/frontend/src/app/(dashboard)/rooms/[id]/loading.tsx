export default function RoomLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="h-8 w-48 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-white/30 dark:bg-white/5" />
        <div className="h-4 w-3/4 rounded bg-white/30 dark:bg-white/5" />
      </div>
    </div>
  );
}
