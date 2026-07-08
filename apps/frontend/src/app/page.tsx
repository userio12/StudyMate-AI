import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowUpRightFromSquare, faBolt, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Features } from '@/components/features';
import { LandingNavbar } from '@/components/landing-navbar';
import { Footer } from '@/components/footer';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');


  const steps = [
    { num: '01', title: 'Upload your PDFs', desc: 'Drop in lecture notes, textbooks, or research papers.' },
    { num: '02', title: 'Ask anything', desc: 'Chat naturally — get answers backed by your own documents.' },
    { num: '03', title: 'Test yourself', desc: 'Generate quizzes and track your progress over time.' },
  ] as const;

  const trust = [
    { icon: faBolt,          label: 'Powered by Gemini', sub: 'Google AI' },
    { icon: faLock,         label: '100% Private',      sub: 'Your data' },
    { icon: faArrowUpRightFromSquare, label: 'Open Source',        sub: 'MIT License' },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <LandingNavbar />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden mesh-bg px-4 sm:px-6 pb-16 sm:pb-24 pt-24 sm:pt-28 text-center md:pt-36">
          {/* Decorative orbs */}
          <div className="orb orb-brand w-96 h-96 -top-24 -left-24 animate-[float_10s_ease-in-out_infinite]" />
          <div className="orb orb-violet w-80 h-80 top-1/2 -right-20 animate-[float_14s_ease-in-out_infinite_reverse]" />
          <div className="orb orb-cyan w-64 h-64 bottom-0 left-1/3 animate-[float_8s_ease-in-out_infinite_1s]" />

          <div className="relative z-10 mx-auto max-w-4xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              Powered by Google Gemini 2.0 Flash
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
              <span className="text-slate-100">Study smarter</span>
              <br />
              <span className="gradient-text">with AI that reads your docs</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Upload your PDFs, chat with your materials using RAG-powered citations,
              and generate adaptive quizzes — all in one beautiful workspace.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl brand-gradient px-7 py-3.5 text-sm font-bold text-white brand-glow transition-all duration-200 hover:opacity-90 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-[0.98]"
              >
                Start studying for free <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/userio12/StudyMate-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-1 px-7 py-3.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-border-bright hover:bg-surface-2 hover:text-foreground"
              >
                <FontAwesomeIcon icon={faGithub} className="w-4 h-4" /> View on GitHub
              </a>
            </div>

            {/* Trust bar */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
              {trust.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 text-slate-500">
                  <FontAwesomeIcon icon={Icon} className="w-4 h-4 text-slate-600" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-300">{label}</p>
                    <p className="text-[10px] text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features (Bento Grid) ──────────────────────────────────────── */}
        <Features />

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how-it-works" className="relative border-y border-border bg-surface-1/30 px-4 sm:px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-20 text-center flex flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold tracking-widest text-brand-500 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                How it works
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                From upload to insight in minutes
              </h2>
            </div>

            <div className="relative grid gap-8 md:gap-10 sm:grid-cols-3">
              {/* Connector line (desktop only) */}
              <div className="absolute left-[16%] right-[16%] top-10 hidden h-[2px] bg-gradient-to-r from-transparent via-border-bright to-transparent sm:block" />

              {steps.map(({ num, title, desc }) => (
                <div key={num} className="relative flex flex-col items-center text-center group">
                  <div className="relative z-10 mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-surface-2 border border-border shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand-500/40 group-hover:bg-brand-500/5">
                    <span className="font-mono text-xl md:text-2xl font-bold text-brand-500">{num}</span>
                  </div>
                  <div className="glass bg-surface-1/40 border border-border rounded-[2rem] p-6 md:p-8 w-full flex-1 transition-all duration-300 group-hover:border-brand-500/20 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">{title}</h3>
                    <p className="text-sm md:text-base text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 py-16 md:py-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-3xl md:rounded-[3rem] border border-border bg-surface-1/50 px-6 py-12 md:p-20 overflow-hidden shadow-2xl glass">
              {/* Very subtle static glow instead of messy moving orbs */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-brand-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight max-w-2xl">
                  Ready to study smarter?
                </h2>
                <p className="mt-4 md:mt-6 text-base md:text-lg text-muted max-w-lg mx-auto">
                  Free forever. No credit card needed. Open source.
                </p>
                <Link
                  href="/sign-up"
                  className="mt-8 md:mt-10 inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-base font-bold text-white brand-glow transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.98]"
                >
                  Get started for free <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
