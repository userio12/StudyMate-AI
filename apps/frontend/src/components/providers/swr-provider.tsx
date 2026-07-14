'use client';

import { SWRConfig } from 'swr';
import React from 'react';

export function SWRProvider({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback: any;
}) {
  return <SWRConfig value={{ fallback }}>{children}</SWRConfig>;
}
