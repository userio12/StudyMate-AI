export default function ChatLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="h-8 w-64 rounded bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-6 space-y-4">
        <div className="h-24 w-full rounded-lg bg-parchment-200 dark:bg-navy-700" />
        <div className="h-24 w-3/4 rounded-lg bg-parchment-200 dark:bg-navy-700" />
        <div className="h-24 w-5/6 rounded-lg bg-parchment-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}
