export default function ChatLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="h-8 w-64 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-6 space-y-4">
        <div className="h-24 w-full rounded-lg bg-white/30 dark:bg-white/5" />
        <div className="h-24 w-3/4 rounded-lg bg-white/30 dark:bg-white/5" />
        <div className="h-24 w-5/6 rounded-lg bg-white/30 dark:bg-white/5" />
      </div>
    </div>
  );
}
