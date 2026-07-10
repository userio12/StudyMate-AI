import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RoomsLoading() {
  return (
    <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
      <div className="rounded-full bg-surface-1/40 p-5 glass border border-border/50 shadow-xl">
         <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
      <p className="text-lg font-bold text-foreground tracking-tight animate-pulse">
        Loading study rooms...
      </p>
    </div>
  );
}
