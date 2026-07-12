import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter, faDiscord, faFacebook } from '@fortawesome/free-brands-svg-icons';

export function Footer() {
  return (
    <footer className="relative bg-surface-1/30 border-t border-border overflow-hidden pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-6 lg:gap-8">
          
          {/* Column 1: Brand & Description (Spans full width on mobile, 2 cols on lg) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col">
            {/* Header / Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group shrink-0 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-transform duration-300 group-hover:scale-105">
                <FontAwesomeIcon icon={faBrain} className="text-white w-5 h-5" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xl tracking-tight leading-none mb-1">
                  <span className="font-bold text-foreground">Study</span>
                  <span className="font-bold text-brand-500">Mate</span>
                </div>
                <span className="text-[10px] text-muted-fg font-medium tracking-widest uppercase">AI-powered</span>
              </div>
            </Link>

            {/* Description */}
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-8">
              Your ultimate AI companion for smarter, faster learning. Upload your documents, chat with citations, and generate adaptive quizzes.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-auto">
              <a href="https://github.com/userio12/StudyMate-AI" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 border border-border text-muted transition-all hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-500 hover:scale-105">
                <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 border border-border text-muted transition-all hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-500 hover:scale-105">
                <FontAwesomeIcon icon={faTwitter} className="w-4 h-4" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 border border-border text-muted transition-all hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-500 hover:scale-105">
                <FontAwesomeIcon icon={faDiscord} className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 border border-border text-muted transition-all hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-500 hover:scale-105">
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
              </a>
              <a href="mailto:hello@studymate.ai" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 border border-border text-muted transition-all hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-500 hover:scale-105">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Column 2: Product */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold tracking-widest text-foreground uppercase mb-6">Product</h3>
            <ul className="flex flex-col space-y-4">
              <li><Link href="/#features" className="text-sm text-muted transition-colors hover:text-brand-500">Features</Link></li>
              <li><Link href="/sign-up" className="text-sm text-muted transition-colors hover:text-brand-500">Get Started</Link></li>
              <li><Link href="/about" className="text-sm text-muted transition-colors hover:text-brand-500">About Us</Link></li>
              <li><a href="https://github.com/userio12/StudyMate-AI/releases" target="_blank" rel="noopener noreferrer" className="text-sm text-muted transition-colors hover:text-brand-500">Changelog</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold tracking-widest text-foreground uppercase mb-6">Resources</h3>
            <ul className="flex flex-col space-y-4">
              <li><a href="https://github.com/userio12/StudyMate-AI#readme" target="_blank" rel="noopener noreferrer" className="text-sm text-muted transition-colors hover:text-brand-500">Documentation</a></li>
              <li><a href="https://github.com/userio12/StudyMate-AI" target="_blank" rel="noopener noreferrer" className="text-sm text-muted transition-colors hover:text-brand-500">Blog</a></li>
              <li><a href="https://github.com/userio12/StudyMate-AI/discussions" target="_blank" rel="noopener noreferrer" className="text-sm text-muted transition-colors hover:text-brand-500">Community</a></li>
              <li><a href="https://github.com/userio12/StudyMate-AI" target="_blank" rel="noopener noreferrer" className="text-sm text-muted transition-colors hover:text-brand-500">Open Source</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-bold tracking-widest text-foreground uppercase mb-6">Legal</h3>
            <ul className="flex flex-col space-y-4">
              <li><Link href="/privacy" className="text-sm text-muted transition-colors hover:text-brand-500">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted transition-colors hover:text-brand-500">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-sm text-muted transition-colors hover:text-brand-500">Cookie Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-fg">
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">StudyMate-AI</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Built with</span>
            <span className="font-semibold text-foreground">Next.js</span>
            <span>&amp;</span>
            <span className="font-semibold text-foreground">Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
