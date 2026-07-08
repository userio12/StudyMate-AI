export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-2 h-4 w-72 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-white/30 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
