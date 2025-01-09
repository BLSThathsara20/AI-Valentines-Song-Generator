import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ErrorLoggerProps {
  error: {
    status?: number;
    message: string;
    details?: any;
    timestamp: number;
  };
  onClose: () => void;
}

export function ErrorLogger({ error, onClose }: ErrorLoggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 max-w-2xl w-full z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-red-500">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Error Details</div>
              <div className="text-sm text-gray-300 mt-1">{error.message}</div>
              {error.status && (
                <div className="text-sm text-gray-400 mt-1">
                  Status Code: {error.status}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronUpIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isExpanded && error.details && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-300">Technical Details:</div>
            <pre className="text-xs bg-gray-800 p-3 rounded overflow-x-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
            <div className="text-xs text-gray-400">
              Time: {new Date(error.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Global error logging
let errorLogListener: ((error: any) => void) | null = null;

export function logError(error: any) {
  if (errorLogListener) {
    errorLogListener({
      status: error.response?.status,
      message: error.message || 'An error occurred',
      details: {
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      },
      timestamp: Date.now()
    });
  }
} 