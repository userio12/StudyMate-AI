export default function RoomLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="h-8 w-48 rounded bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-parchment-200 dark:bg-navy-700" />
        <div className="h-4 w-3/4 rounded bg-parchment-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}
