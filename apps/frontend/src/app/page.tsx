import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowUpRightFromSquare, faBolt, faLock, faChevronRight, faGraduationCap, faCommentDots, faFileLines, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Features } from '@/components/features';
import { LandingNavbar } from '@/components/landing-navbar';
import { Footer } from '@/components/footer';
import { WordRotator } from '@/components/word-rotator';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  const steps = [
    { num: '01', title: 'Upload your PDFs', desc: 'Drop in lecture notes, textbooks, or research papers. We process them instantly.' },
    { num: '02', title: 'Ask anything', desc: 'Chat naturally with your materials. Get answers backed by exact page citations.' },
    { num: '03', title: 'Test yourself', desc: 'Generate adaptive quizzes that target your weak points and reinforce memory.' },
  ] as const;

  const trust = [
    { icon: faBolt,          label: 'Powered by Gemini 2.0', sub: 'Lightning Fast AI' },
    { icon: faLock,         label: '100% Private',      sub: 'Your data is encrypted' },
    { icon: faArrowUpRightFromSquare, label: 'Open Source',        sub: 'MIT License' },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-surface selection:bg-brand-500/30">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <LandingNavbar />

      <main className="flex-1">

        {/* ── Hero Section ──────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6">
          {/* Cinematic Lighting Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            {/* Pulsing Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              AI STUDY PLATFORM FOR STUDENTS
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              <span className="text-foreground">Upload your notes.</span>
              <br />
              <WordRotator 
                className="bg-gradient-to-r from-brand-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent drop-shadow-sm mt-2"
                words={[
                  "Learn it smarter.", 
                  "Understand it deeper.", 
                  "Pass your exams.", 
                  "Remember it longer.", 
                  "Study more effectively."
                ]} 
              />
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-muted font-medium">
              Upload your PDFs, chat with your materials using RAG-powered citations,
              and generate adaptive quizzes — all in one beautiful workspace.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Start studying for free <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <a
                href="https://github.com/userio12/StudyMate-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-1/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-2 hover:border-border-bright w-full sm:w-auto"
              >
                <FontAwesomeIcon icon={faGithub} className="w-5 h-5" /> View on GitHub
              </a>
            </div>

            {/* Trust bar */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80">
              {trust.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 border border-border text-muted-fg">
                    <FontAwesomeIcon icon={Icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    <p className="text-xs text-muted-fg font-medium">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mock Dashboard UI Showcase */}
            <div className="mt-20 md:mt-32 relative mx-auto max-w-5xl rounded-2xl md:rounded-3xl border border-border/60 bg-surface-1/40 p-2 sm:p-4 backdrop-blur-xl shadow-2xl overflow-hidden group perspective-1000">
              {/* Animated Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-violet-500/20 opacity-50" />
              
              {/* Inner Window */}
              <div className="relative rounded-[1rem] md:rounded-2xl border border-border bg-[#0a0a0a] shadow-inner overflow-hidden aspect-video flex flex-col transform transition-transform duration-700 ease-out group-hover:scale-[1.01] group-hover:shadow-[0_0_80px_rgba(99,102,241,0.15)]">
                {/* Mac-style Window header */}
                <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2 backdrop-blur-md">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="mx-auto flex items-center gap-2 rounded-md bg-black/20 px-3 py-1 text-[11px] font-medium text-white/40 font-mono border border-white/5">
                    <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" /> studymate.ai/dashboard
                  </div>
                </div>
                
                {/* Body of mock window */}
                <div className="flex-1 flex bg-[#0a0a0a]">
                  {/* Sidebar mock */}
                  <div className="hidden sm:block w-64 border-r border-white/5 bg-white/[0.02] p-5">
                     <div className="flex items-center gap-3 mb-8">
                       <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-xs shadow-lg">S</div>
                       <span className="text-white font-bold tracking-tight text-lg">StudyMate-AI</span>
                     </div>
                     <div className="space-y-1">
                       <div className="flex items-center gap-3 text-white/50 text-sm py-2 px-3 hover:text-white transition-colors cursor-default rounded-lg hover:bg-white/5"><FontAwesomeIcon icon={faFileLines} className="w-4 h-4" /> Documents</div>
                       <div className="flex items-center gap-3 text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2 text-sm"><FontAwesomeIcon icon={faCommentDots} className="w-4 h-4" /> Chat</div>
                       <div className="flex items-center gap-3 text-white/50 text-sm py-2 px-3 hover:text-white transition-colors cursor-default rounded-lg hover:bg-white/5"><FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4" /> Quiz</div>
                     </div>
                  </div>
                  {/* Main Chat Content mock */}
                  <div className="flex-1 p-6 md:p-10 flex flex-col justify-end space-y-6 relative overflow-hidden">
                     {/* Background Watermark */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <FontAwesomeIcon icon={faGraduationCap} className="w-64 h-64" />
                     </div>
                     
                     <div className="self-end max-w-[80%] p-4 rounded-2xl rounded-tr-sm brand-gradient shadow-[0_0_20px_rgba(99,102,241,0.2)] relative z-10 text-white text-[13px] md:text-sm font-medium leading-relaxed">
                       Can you summarize the key takeaways from the machine learning lecture?
                     </div>

                     <div className="self-start max-w-[80%] p-5 rounded-2xl rounded-tl-sm bg-[#151515] border border-white/10 backdrop-blur-md relative z-10 text-white/90 text-[13px] md:text-sm leading-relaxed shadow-xl">
                       <p className="mb-3">Sure! Here are the core concepts from your lecture notes:</p>
                       <ul className="list-disc pl-5 space-y-2 text-white/70">
                         <li><strong className="text-white">Supervised Learning:</strong> Training models on labeled data to predict outcomes.</li>
                         <li><strong className="text-white">Neural Networks:</strong> Computing systems inspired by the biological brain&apos;s architecture.</li>
                       </ul>
                       <div className="mt-4 flex gap-2">
                         <span className="inline-flex items-center gap-1.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-inner">
                           <FontAwesomeIcon icon={faFileLines} className="w-3 h-3" /> cs-lecture-4.pdf (pg. 12)
                         </span>
                       </div>
                     </div>
                     
                     <div className="mt-4 h-14 w-full rounded-2xl bg-black/40 border border-white/10 flex items-center px-4 relative z-10 shadow-inner backdrop-blur-md">
                       <span className="text-white/40 text-sm">Ask a follow-up question...</span>
                       <div className="ml-auto h-8 w-8 rounded-xl bg-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer">
                         <FontAwesomeIcon icon={faArrowUp} className="w-3.5 h-3.5 text-black" />
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Features (Card Grid) ──────────────────────────────────────── */}
        <Features />

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how-it-works" className="relative border-y border-border bg-surface-1/30 px-4 sm:px-6 py-24 md:py-32 overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="mx-auto max-w-6xl relative z-10">
            <div className="mb-20 text-center flex flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold tracking-widest text-brand-500 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Workflow
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                From upload to insight in minutes
              </h2>
            </div>

            <div className="relative grid gap-8 md:gap-12 lg:grid-cols-3">
              {/* Connector line (desktop only) */}
              <div className="absolute top-12 left-[15%] right-[15%] hidden h-[2px] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent lg:block" />

              {steps.map(({ num, title, desc }) => (
                <div key={num} className="relative flex flex-col items-center text-center group">
                  <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-surface border-4 border-surface-2 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:border-brand-500/30 group-hover:bg-brand-500/5">
                    <span className="font-heading text-3xl font-black text-brand-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">{num}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
                  <p className="text-base text-muted leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Massive Edge-to-Edge CTA ──────────────────────────────────── */}
        <section className="px-4 sm:px-6 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="relative rounded-2xl md:rounded-3xl p-[2px] overflow-hidden group">
              {/* Spinning gradient border effect */}
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-full w-full rounded-2xl md:rounded-3xl bg-surface-1 px-6 py-12 md:py-16 text-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight max-w-3xl leading-tight">
                    Ready to revolutionize <br className="hidden md:block" /> your study routine?
                  </h2>
                  <p className="mt-6 md:mt-8 text-lg md:text-xl text-muted font-medium max-w-xl mx-auto">
                    Join thousands of students and researchers saving hours every week with AI-powered insights.
                  </p>
                  
                  <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      href="/sign-up"
                      className="group inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-white brand-glow transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      Create your free account <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-xs text-muted-fg font-medium sm:ml-4">No credit card required.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
