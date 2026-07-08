export default function DocumentsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-2 h-4 w-56 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/30 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
