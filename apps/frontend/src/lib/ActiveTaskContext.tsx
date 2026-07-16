'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ActiveTask {
  id: string;
  title: string;
}

interface ActiveTaskContextType {
  activeTask: ActiveTask | null;
  setActiveTask: (task: ActiveTask | null) => void;
}

const ActiveTaskContext = createContext<ActiveTaskContextType | undefined>(undefined);

export function ActiveTaskProvider({ children }: { children: ReactNode }) {
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);

  return (
    <ActiveTaskContext.Provider value={{ activeTask, setActiveTask }}>
      {children}
    </ActiveTaskContext.Provider>
  );
}

export function useActiveTask() {
  const context = useContext(ActiveTaskContext);
  if (context === undefined) {
    throw new Error('useActiveTask must be used within an ActiveTaskProvider');
  }
  return context;
}
