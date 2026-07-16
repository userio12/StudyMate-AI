'use client';


import { useState, useEffect } from 'react';

type SearchProvider = 'duckduckgo' | 'tavily' | 'off';

export function useSearchPreference() {
  const [provider, setProvider] = useState<SearchProvider>('tavily');

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('studymate_search_provider_v2');
      if (stored) {
        setProvider(stored as SearchProvider);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateProvider = (newProvider: SearchProvider) => {
    setProvider(newProvider);
    localStorage.setItem('studymate_search_provider_v2', newProvider);
  };

  return { searchProvider: provider, setSearchProvider: updateProvider };
}
