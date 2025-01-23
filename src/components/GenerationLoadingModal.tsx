import { useState } from 'react';
import { HeartIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface GenerationLoadingModalProps {
  isOpen: boolean;
  onEmailSubmit: (email: string) => void;
  defaultEmail: string;
  isGenerating: boolean;
}

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export function GenerationLoadingModal({ 
  isOpen, 
  onEmailSubmit, 
  defaultEmail,
  isGenerating 
}: GenerationLoadingModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isValid, setIsValid] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      onEmailSubmit(email);
      setIsValid(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <HeartIcon
              key={i}
              className="absolute text-pink-100 animate-float-heart"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                width: `${Math.random() * 20 + 20}px`
              }}
            />
          ))}
        </div>

        <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x" />
        
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Love Song</h3>
            <p className="text-sm text-gray-600">
              Want to be notified when your song is ready? Enter your email below!
            </p>
          </div>

          {showSuccess ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="text-green-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium">Email saved successfully!</p>
              <p className="text-gray-600 text-sm">We'll notify you when your song is ready.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email for Notification
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsValid(true);
                  }}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 text-sm text-gray-700 border-2 ${
                    isValid ? 'border-gray-100' : 'border-red-300'
                  } rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all`}
                />
                {!isValid && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid email address</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl 
                  hover:from-pink-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Save Email
              </button>
            </form>
          )}

          <div className={`mt-8 space-y-4 transform transition-all duration-500 ${
            isGenerating
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Please wait while we create your perfect Valentine's song...
            </p>
          </div>
        </div>

        <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x" />
      </div>
    </div>
  );
} 