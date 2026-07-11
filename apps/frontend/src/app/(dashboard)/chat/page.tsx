'use client';

import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPlus, faComments } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';

export default function ChatPage() {
  const router = useRouter();
  const api = useApiClient();

  const handleCreate = async () => {
    try {
      const { id } = await api.post<{ id: string; title: string }>('/chat/conversations', {
        title: 'New conversation',
      });
      router.push(`/chat/${id}`);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  return (
    <div className="flex h-full min-h-[80vh] flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface-1/40 p-6 sm:p-8 lg:p-12 text-center shadow-2xl glass group">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent opacity-70" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50" />

          {/* Decorative floating watermark */}
          <div className="absolute top-10 left-10 opacity-5">
             <FontAwesomeIcon icon={faComments} className="w-24 h-24" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Massive Glowing Icon */}
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 shadow-[inset_0_0_30px_rgba(99,102,241,0.1)] transition-transform duration-700 ease-out group-hover:scale-110 group-hover:shadow-[inset_0_0_50px_rgba(99,102,241,0.2)]">
              <FontAwesomeIcon icon={faCommentDots} className="text-brand-400 w-12 h-12" />
            </div>
            
            {/* Cinematic Typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 leading-tight">
              Start a New <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Ask questions about your study materials, generate automated summaries, and get exact page citations powered by our advanced AI engine.
            </p>
            
            {/* Massive Primary Action Button */}
            <button 
              onClick={handleCreate} 
              className="group/btn relative inline-flex items-center justify-center gap-3 rounded-xl brand-gradient px-6 py-3 text-base font-extrabold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] overflow-hidden"
            >
              {/* Shine effect across the button */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-90" /> 
              Create New Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
