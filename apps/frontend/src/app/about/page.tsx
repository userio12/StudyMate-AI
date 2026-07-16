import { LandingNavbar } from '@/components/landing-navbar';
import { Footer } from '@/components/footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faBullseye } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#020617] overflow-hidden">
      <LandingNavbar />
      
      <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-24 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-0 h-96 w-96 rounded-full bg-brand-500/10 blur-[120px] -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-[150px] translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Our mission is to help you <span className="text-brand-400 italic">learn faster</span>.
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              StudyMate-AI was built from the ground up to solve a simple problem: traditional studying is slow, passive, and inefficient. We believe that with the right AI tools, anyone can master complex subjects in half the time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-slate-800 transition-transform duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:bg-[#131c31]">
              <div className="h-12 w-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faBullseye} className="text-brand-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                To create a world where every student has a personalized, tireless AI tutor that understands their unique learning style and curriculum perfectly.
              </p>
            </div>
            
            <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-slate-800 transition-transform duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-[#131c31]">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faHeart} className="text-violet-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Values</h3>
              <p className="text-slate-400 leading-relaxed">
                We prioritize absolute privacy, seamless user experiences, and scientifically-backed learning methods over quick gimmicks.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-900/40 to-violet-900/40 rounded-3xl p-8 sm:p-10 md:p-16 border border-brand-500/20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Join the study revolution</h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Stop re-reading your textbooks. Start actively engaging with your material using the power of semantic search and spaced repetition.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-full bg-blue-500 px-8 py-4 font-bold text-white transition-all hover:bg-blue-400 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                Start for free today
              </Link>
            </div>
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/20 blur-[80px]"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
