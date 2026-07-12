'use client';
/* eslint-disable react-compiler/react-compiler */

import { useState, useEffect } from 'react';

type SearchProvider = 'duckduckgo' | 'tavily' | 'off';

export function useSearchPreference() {
  const [provider, setProvider] = useState<SearchProvider>('duckduckgo');

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('studymate_search_provider');
      if (stored) {
        setProvider(stored as SearchProvider);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateProvider = (newProvider: SearchProvider) => {
    setProvider(newProvider);
    localStorage.setItem('studymate_search_provider', newProvider);
  };

  return { searchProvider: provider, setSearchProvider: updateProvider };
}
