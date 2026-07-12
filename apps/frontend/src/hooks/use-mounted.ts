import { useState, useEffect } from 'react';

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  
  // Disable react-compiler for this specific hook to avoid the set-state-in-effect warning,
  // while allowing the rest of the application's components to be fully optimized.
  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return mounted;
}
