interface ErrorDetails {
  error_type?: string;
  error_code?: number;
  error_detail?: string;
  raw_message?: string;
  message?: string;
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorDetails: ErrorDetails;
}

export function ErrorDetailsModal({ isOpen, onClose, errorDetails }: ErrorDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {errorDetails.error_type && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Error Type:</h4>
              <p className="mt-1 text-sm bg-red-50 text-red-700 p-2 rounded">
                {errorDetails.error_type}
              </p>
            </div>
          )}

          {errorDetails.error_code && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Error Code:</h4>
              <p className="mt-1 text-sm bg-gray-50 text-gray-700 p-2 rounded">
                {errorDetails.error_code}
              </p>
            </div>
          )}

          {errorDetails.error_detail && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Error Detail:</h4>
              <p className="mt-1 text-sm bg-gray-50 text-gray-700 p-2 rounded">
                {errorDetails.error_detail}
              </p>
            </div>
          )}

          {errorDetails.message && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Message:</h4>
              <p className="mt-1 text-sm bg-gray-50 text-gray-700 p-2 rounded">
                {errorDetails.message}
              </p>
            </div>
          )}

          {errorDetails.raw_message && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Raw Message:</h4>
              <p className="mt-1 text-sm bg-gray-50 text-gray-700 p-2 rounded">
                {errorDetails.raw_message}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 