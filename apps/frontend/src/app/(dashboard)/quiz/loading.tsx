export default function QuizLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-32 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-2 h-4 w-56 rounded bg-white/30 dark:bg-white/5" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-white/30 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
