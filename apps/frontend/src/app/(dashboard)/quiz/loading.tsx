export default function QuizLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-32 rounded bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-2 h-4 w-56 rounded bg-parchment-300 dark:bg-navy-700" />

      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-parchment-200 dark:bg-navy-800"
          />
        ))}
      </div>
    </div>
  );
}
