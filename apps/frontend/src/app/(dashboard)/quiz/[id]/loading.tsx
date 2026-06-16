export default function QuizLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="h-8 w-56 rounded bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-6 space-y-6">
        <div className="h-4 w-full rounded bg-parchment-200 dark:bg-navy-700" />
        <div className="h-4 w-full rounded bg-parchment-200 dark:bg-navy-700" />
        <div className="h-4 w-3/4 rounded bg-parchment-200 dark:bg-navy-700" />
        <div className="h-4 w-5/6 rounded bg-parchment-200 dark:bg-navy-700" />
        <div className="h-4 w-2/3 rounded bg-parchment-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}
