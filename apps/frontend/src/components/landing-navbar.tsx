'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <header className="flex items-center justify-between glass rounded-full px-4 sm:px-6 py-3 shadow-md relative">
        
        {/* Left Section (Brand) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
            <FontAwesomeIcon icon={faBrain} className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-heading text-base sm:text-lg font-bold text-foreground tracking-tight">StudyMate-AI</span>
        </Link>

        {/* Center Section (Navigation) */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="relative text-sm font-medium text-muted transition-colors hover:text-foreground group py-1">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
            <Link href="/#features" className="relative text-sm font-medium text-muted transition-colors hover:text-foreground group py-1">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
            <Link href="/about" className="relative text-sm font-medium text-muted transition-colors hover:text-foreground group py-1">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          </div>
        </nav>

        {/* Right Section (Auth Actions) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/sign-in"
            className="hidden sm:block text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="hidden sm:inline-flex items-center rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-400 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Sign up
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button type="button"
            className="md:hidden flex items-center justify-center p-2 text-muted hover:text-foreground transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FontAwesomeIcon icon={faXmark} className="w-5 h-5" /> : <FontAwesomeIcon icon={faBars} className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-xl overflow-hidden md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col p-4">
            <nav className="flex flex-col gap-1 mb-4">
              <Link href="/" className="group relative overflow-hidden px-4 py-3 text-base font-medium text-muted hover:bg-surface-hover hover:text-foreground rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10">Home</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/#features" className="group relative overflow-hidden px-4 py-3 text-base font-medium text-muted hover:bg-surface-hover hover:text-foreground rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10">Features</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/about" className="group relative overflow-hidden px-4 py-3 text-base font-medium text-muted hover:bg-surface-hover hover:text-foreground rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10">About</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <Link
                href="/sign-in"
                className="w-full text-center px-4 py-3 text-base font-medium text-muted hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="w-full flex justify-center items-center rounded-xl bg-brand-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-brand-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
