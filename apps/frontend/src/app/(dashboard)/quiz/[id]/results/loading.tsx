export default function ResultsLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="mx-auto h-32 w-32 rounded-full bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-6 space-y-3">
        <div className="mx-auto h-4 w-48 rounded bg-parchment-200 dark:bg-navy-700" />
        <div className="mx-auto h-4 w-36 rounded bg-parchment-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}
