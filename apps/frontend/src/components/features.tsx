import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUpload, faCommentDots, faGraduationCap, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const coreFeatures = [
  {
    icon: faUpload,
    title: 'Document Processing',
    description: 'Drag and drop your PDFs. We automatically extract, chunk, and embed every single page into a semantic vector store for instant retrieval.',
    metric: 'Instant Indexing',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'group-hover:border-blue-500/30'
  },
  {
    icon: faCommentDots,
    title: 'AI Chat with Citations',
    description: 'Ask complex questions and get answers firmly grounded in your own materials, complete with precise page-level source citations.',
    metric: 'Zero Hallucinations',
    color: 'text-brand-500',
    bg: 'bg-brand-500/10',
    border: 'group-hover:border-brand-500/30'
  },
  {
    icon: faGraduationCap,
    title: 'Adaptive Quizzes',
    description: 'Automatically generate rigorous multiple-choice, true/false, and short-answer quizzes. Download beautiful PDF reports of your results.',
    metric: 'Auto-Grading',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'group-hover:border-violet-500/30'
  },
  {
    icon: faUsers,
    title: 'Real-Time Study Rooms',
    description: 'Collaborate with peers in low-latency live workspaces. Share documents, chat, and tackle complex study materials together.',
    metric: 'Live Sync',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'group-hover:border-emerald-500/30'
  }
];

export function Features() {
  return (
    <section id="features" className="relative px-4 sm:px-6 py-24 sm:py-32">
      {/* Background Orbs for the feature section to match the aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-violet w-[500px] h-[500px] top-0 left-[-250px] opacity-[0.03] float-slow" />
        <div className="orb orb-brand w-[400px] h-[400px] bottom-0 right-[-200px] opacity-[0.03] float-medium" />
      </div>

      <div className="relative mx-auto max-w-6xl z-10">
        {/* Header Section */}
        <div className="mb-20 text-center flex flex-col items-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold tracking-widest text-brand-500 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
            Everything you need, <br className="hidden md:block" />
            <span className="gradient-text">all in one place</span>
          </h2>
          <p className="text-muted max-w-2xl text-lg md:text-xl">
            Built for the way brains actually learn. A full AI study stack in one seamless experience — no juggling between tools.
          </p>
        </div>

        {/* Clean 2x2 Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {coreFeatures.map((feature, idx) => (
            <div 
              key={feature.title} 
              className={`glass bg-surface-1/40 rounded-3xl border border-border p-8 group transition-all duration-300 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${feature.border} hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border ${feature.color} group-hover:scale-110 transition-transform duration-300 ${feature.bg}`}>
                  <FontAwesomeIcon icon={feature.icon} className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center rounded-full bg-surface-3 px-3 py-1 text-[10px] font-bold tracking-widest text-muted-fg uppercase">
                  {feature.metric}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                {feature.title}
              </h3>
              
              <p className="text-base text-muted leading-relaxed flex-1">
                {feature.description}
              </p>
              
              <div className="mt-8 pt-6 border-t border-border/50">
                <Link href="/sign-up" className={`inline-flex items-center gap-2 text-sm font-semibold ${feature.color} hover:opacity-80 transition-opacity`}>
                  Try it now
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
