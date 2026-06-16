export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="h-8 w-32 rounded bg-parchment-300 dark:bg-navy-700" />
      <div className="mt-2 h-4 w-48 rounded bg-parchment-300 dark:bg-navy-700" />

      <div className="mt-6 flex-1 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`h-16 rounded-xl bg-parchment-200 dark:bg-navy-800 ${
                i % 2 === 0 ? 'w-3/4' : 'w-1/2'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 h-12 rounded-xl bg-parchment-200 dark:bg-navy-800" />
    </div>
  );
}
