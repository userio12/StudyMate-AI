export default function RoomsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-2 h-4 w-64 rounded bg-parchment-300 dark:bg-navy-700" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-parchment-200 dark:bg-navy-800"
          />
        ))}
      </div>
    </div>
  );
}
