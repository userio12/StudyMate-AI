'use client';

import { useState, useEffect } from 'react';

type SearchProvider = 'duckduckgo' | 'tavily' | 'off';

export function useSearchPreference() {
  const [provider, setProvider] = useState<SearchProvider>('duckduckgo');

  useEffect(() => {
    const stored = localStorage.getItem('studymate_search_provider');
    if (stored) {
      setProvider(stored as SearchProvider);
    }
  }, []);

  const updateProvider = (newProvider: SearchProvider) => {
    setProvider(newProvider);
    localStorage.setItem('studymate_search_provider', newProvider);
  };

  return { searchProvider: provider, setSearchProvider: updateProvider };
}
