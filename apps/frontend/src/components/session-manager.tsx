'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export function SessionManager() {
  const { userId, isLoaded } = useAuth();
  const previousUserId = useRef<string | null | undefined>(userId);

  useEffect(() => {
    if (!isLoaded) return;

    // If the user transition from having an ID to not having an ID, they just signed out
    if (previousUserId.current && !userId) {
      // Clear all local session data to prevent cross-account pollution
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error('Failed to clear storage on sign out', e);
      }
      
      // Force redirect to landing page and flush all memory state
      window.location.href = '/';
    }

    previousUserId.current = userId;
  }, [userId, isLoaded]);

  return null;
}
