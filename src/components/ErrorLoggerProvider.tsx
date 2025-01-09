import { useState, useEffect } from 'react';
import { ErrorLogger } from './ErrorLogger';

let setGlobalError: ((error: any) => void) | null = null;

export function logError(error: any) {
  if (setGlobalError) {
    setGlobalError(error);
  }
}

export function ErrorLoggerProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setGlobalError = setError;
    return () => {
      setGlobalError = null;
    };
  }, []);

  return (
    <>
      {children}
      {error && (
        <ErrorLogger
          error={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
} 