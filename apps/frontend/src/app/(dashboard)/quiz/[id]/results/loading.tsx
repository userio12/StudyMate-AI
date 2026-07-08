export default function ResultsLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="mx-auto h-32 w-32 rounded-full bg-white/30 dark:bg-white/5" />
      <div className="mt-6 space-y-3">
        <div className="mx-auto h-4 w-48 rounded bg-white/30 dark:bg-white/5" />
        <div className="mx-auto h-4 w-36 rounded bg-white/30 dark:bg-white/5" />
      </div>
    </div>
  );
}
