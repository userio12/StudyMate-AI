import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonChalkboard, faUpload, faCommentDots, faGraduationCap, faCheck } from '@fortawesome/free-solid-svg-icons';

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

        {/* Clean Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Upload & Index (Spans 1 col) */}
          <div className="glass bg-surface-1/40 rounded-3xl border border-border p-6 md:p-8 group hover:border-brand-500/30 transition-all duration-300 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="mb-5 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-brand-500 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-500/10 group-hover:border-brand-500/20">
              <FontAwesomeIcon icon={faUpload} className="w-5 h-5" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3 tracking-tight">Upload & Index</h3>
            <p className="text-sm md:text-base text-muted leading-relaxed flex-1">
              Drag and drop PDFs. We extract, chunk, and embed every page into a semantic vector store instantly.
            </p>
            <div className="mt-8">
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-3/4 rounded-full relative">
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-muted-fg mt-3 font-mono text-right">Processing 124 pages...</p>
            </div>
          </div>

          {/* Feature 2: Smart Flashcards (Large, spans 2 cols) */}
          <div className="glass bg-surface-1/40 rounded-3xl border border-border p-6 md:p-8 lg:col-span-2 group hover:border-brand-500/30 transition-all duration-300 flex flex-col sm:flex-row gap-6 md:gap-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-brand-500 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-500/10 group-hover:border-brand-500/20">
                  <FontAwesomeIcon icon={faPersonChalkboard} className="w-5 h-5" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3 tracking-tight">Smart Flashcards</h3>
                <p className="text-sm md:text-base text-muted max-w-lg leading-relaxed">
                  Upload your notes — AI auto-generates cards and spaced repetition sends them to you right when you&apos;re about to forget. Zero manual setup required.
                </p>
              </div>
            </div>
            
            <div className="shrink-0 flex items-end">
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="bg-surface-2 border border-border rounded-xl md:rounded-2xl p-4 text-center group-hover:border-border-bright transition-colors duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">247</p>
                  <p className="text-[10px] font-bold text-muted-fg uppercase tracking-widest">Cards</p>
                </div>
                <div className="bg-surface-2 border border-border rounded-xl md:rounded-2xl p-4 text-center group-hover:border-border-bright transition-colors duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-brand-400 mb-1">94%</p>
                  <p className="text-[10px] font-bold text-brand-500/70 uppercase tracking-widest">Retention</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Adaptive Quizzes (Large, spans 2 cols) */}
          <div className="glass bg-surface-1/40 rounded-3xl border border-border p-6 md:p-8 lg:col-span-2 group hover:border-brand-500/30 transition-all duration-300 flex flex-col sm:flex-row gap-6 md:gap-8 items-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="flex-1">
              <div className="mb-5 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-brand-500 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-500/10 group-hover:border-brand-500/20">
                <FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3 tracking-tight">Adaptive Quizzes</h3>
              <p className="text-sm md:text-base text-muted leading-relaxed">
                Generate multiple-choice, true/false, and short-answer quizzes from your materials. Our AI tracks your weak areas and dynamically adjusts difficulty to reinforce learning automatically.
              </p>
            </div>
            
            <div className="w-full sm:w-64 shrink-0 bg-surface-2 border border-border rounded-xl md:rounded-2xl p-4 md:p-5 group-hover:border-border-bright transition-colors duration-300">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-16 bg-surface-3 rounded-full"></div>
                  <div className="h-7 w-7 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center border border-brand-500/30">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                  </div>
                </div>
                <div className="h-px w-full bg-border"></div>
                <div className="flex items-center justify-between">
                  <div className="h-2 w-24 bg-surface-3 rounded-full"></div>
                  <div className="h-7 w-7 rounded-full bg-surface-3 text-muted-fg text-xs font-bold flex items-center justify-center border border-border">B</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-2 w-20 bg-surface-3 rounded-full"></div>
                  <div className="h-7 w-7 rounded-full bg-surface-3 text-muted-fg text-xs font-bold flex items-center justify-center border border-border">C</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Chat with Citations (Small, spans 1 col) */}
          <div className="glass bg-surface-1/40 rounded-3xl border border-border p-6 md:p-8 group hover:border-brand-500/30 transition-all duration-300 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="mb-5 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-brand-500 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-500/10 group-hover:border-brand-500/20">
              <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3 tracking-tight">Chat with Citations</h3>
            <p className="text-sm md:text-base text-muted leading-relaxed">
              Ask questions and get answers grounded in your own documents with precise page-level citations.
            </p>
            <div className="mt-6 md:mt-8 pt-4">
              <div className="bg-surface-2 border border-border rounded-xl p-3 md:p-4 relative group-hover:border-border-bright transition-colors">
                <p className="text-xs md:text-sm text-foreground">The mitochondria is the powerhouse of the cell.</p>
                <div className="absolute -bottom-3 right-4 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] px-3 py-1 rounded-full font-bold tracking-wider">
                  Pg. 42
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
