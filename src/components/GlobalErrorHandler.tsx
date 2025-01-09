import { useState, useEffect } from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GlobalError {
  message: string;
  timestamp: number;
}

let globalErrorListener: ((error: GlobalError) => void) | null = null;

export function showGlobalError(message: string) {
  if (globalErrorListener) {
    globalErrorListener({ message, timestamp: Date.now() });
  }
}

export function GlobalErrorHandler() {
  const [error, setError] = useState<GlobalError | null>(null);

  useEffect(() => {
    globalErrorListener = (newError: GlobalError) => {
      setError(newError);
    };

    const handleError = (event: ErrorEvent) => {
      showGlobalError(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      globalErrorListener = null;
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md z-50 animate-slide-in">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-lg flex items-start">
        <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-red-800">{error.message}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="ml-4 text-red-500 hover:text-red-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 