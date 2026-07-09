'use client';

import * as React from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSearchPreference } from '@/hooks/use-search-preference';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faRobot, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
  const { isLoaded, user } = useUser();
  const { searchProvider, setSearchProvider } = useSearchPreference();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-5">
        <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
          <FontAwesomeIcon icon={faGear} className="text-muted w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted">Manage your study preferences and account.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-border/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-surface-3 flex items-center justify-center overflow-hidden border border-border/50">
              {isLoaded && user?.imageUrl ? (
                <img src={user.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">{user?.fullName || 'User'}</p>
              <p className="text-sm text-muted">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-1 border border-border/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faGlobe} className="text-brand-500 w-5 h-5" />
          <h2 className="text-lg font-semibold text-foreground">Web Search Preferences</h2>
        </div>
        <div className="space-y-4 max-w-xl">
          <p className="text-sm text-muted leading-relaxed">
            Choose which search engine the AI should use to retrieve real-time information for your questions.
          </p>
          <select
            value={searchProvider}
            onChange={(e) => setSearchProvider(e.target.value as any)}
            className="w-full max-w-sm rounded-lg border border-border/50 bg-surface-2 px-3 py-2.5 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          >
            <option value="duckduckgo">DuckDuckGo (Free, Default)</option>
            <option value="tavily">Tavily (Requires API Key in Backend)</option>
            <option value="off">Off (Disable Web Search)</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-1 border border-border/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faRobot} className="text-brand-500 w-5 h-5" />
          <h2 className="text-lg font-semibold text-foreground">AI Intelligence</h2>
        </div>
        <div className="space-y-4 max-w-xl">
          <p className="text-sm text-muted leading-relaxed">
            StudyMate AI is now exclusively powered by <strong>Google Gemini</strong>. This provides state-of-the-art performance for RAG chat, document processing, and adaptive quiz generation without requiring manual model selection.
          </p>
          <div className="p-4 rounded-lg bg-brand-500/10 border border-brand-500/20">
            <p className="text-sm font-medium text-brand-400">
              Your intelligence engine is up to date and fully optimized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
