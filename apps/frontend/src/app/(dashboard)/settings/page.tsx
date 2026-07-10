'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchPreference } from '@/hooks/use-search-preference';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faRobot, faGlobe, faUserShield } from '@fortawesome/free-solid-svg-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const { isLoaded, user } = useUser();
  const { searchProvider, setSearchProvider } = useSearchPreference();

  return (
    <div className="pb-10 max-w-5xl mx-auto space-y-8">
      
      {/* ── Hero Control Panel ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-surface-1/40 p-6 sm:p-10 shadow-lg glass group">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 via-transparent to-brand-500/10 opacity-70" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-slate-500/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center justify-center rounded-2xl bg-slate-500/10 border border-slate-500/20 p-4 mb-6 shadow-inner">
              <FontAwesomeIcon icon={faGear} className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              Settings & Preferences
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Manage your account details, configure web search integrations, and monitor the AI intelligence engine.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* ── Account Information ────────────────────────────────────────────── */}
        <section className="glass bg-surface-1/40 border border-border/60 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <FontAwesomeIcon icon={faUserShield} className="text-blue-400 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Account Profile</h2>
          </div>
          
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-surface-2/50 border border-border/50">
            <div className="h-20 w-20 rounded-full bg-surface-3 flex items-center justify-center overflow-hidden border-2 border-border shadow-inner shrink-0">
              {isLoaded && user?.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                </>
              ) : (
                <span className="text-2xl font-black text-slate-400">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-lg truncate">{user?.fullName || 'User'}</p>
              <p className="text-sm text-muted truncate">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                Active Member
              </div>
            </div>
          </div>
        </section>

        {/* ── Web Search Preferences ────────────────────────────────────────────── */}
        <section className="glass bg-surface-1/40 border border-border/60 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <FontAwesomeIcon icon={faGlobe} className="text-cyan-400 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Web Search</h2>
          </div>
          
          <p className="text-sm text-muted leading-relaxed mb-6">
            Choose which search engine the AI should use to retrieve real-time information and up-to-date facts for your questions.
          </p>
          
          <div className="p-1 rounded-xl bg-surface-2 border border-border/50">
            <Select
              value={searchProvider}
              onValueChange={(value) => setSearchProvider(value as any)}
            >
              <SelectTrigger className="w-full h-12 bg-transparent border-none focus:ring-0 shadow-none text-base font-medium">
                <SelectValue placeholder="Select a search provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="duckduckgo" className="cursor-pointer">DuckDuckGo (Free, Default)</SelectItem>
                <SelectItem value="tavily" className="cursor-pointer">Tavily (Requires API Key)</SelectItem>
                <SelectItem value="off" className="cursor-pointer text-red-400">Off (Disable Web Search)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* ── AI Intelligence Engine ────────────────────────────────────────────── */}
        <section className="md:col-span-2 glass bg-surface-1/40 border border-border/60 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
              <FontAwesomeIcon icon={faRobot} className="text-brand-400 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">AI Intelligence Engine</h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <p className="text-base text-muted leading-relaxed">
              StudyMate AI is exclusively powered by <strong>Google Gemini</strong>. This provides state-of-the-art performance for RAG chat, automated document chunking, and adaptive quiz generation without requiring manual model selection.
            </p>
            
            <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 flex flex-col items-center justify-center text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/20 mb-4">
                <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping opacity-75" />
                <FontAwesomeIcon icon={faRobot} className="text-brand-400 w-6 h-6 relative z-10" />
              </div>
              <p className="text-base font-bold text-foreground">
                Engine is Online
              </p>
              <p className="text-sm text-brand-400/80 mt-1">
                Optimized and fully up to date.
              </p>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
