import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';

export function GenerationLoadingModal({ 
  isOpen, 
  onClose,
  onEmailSubmit,
  defaultEmail = '',
  isGenerating = false
}: { 
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
  defaultEmail?: string;
  isGenerating?: boolean;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [showEmailInput, setShowEmailInput] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isGenerating && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onEmailSubmit(email);
      setShowEmailInput(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative max-w-md w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-hearts"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            >
              <HeartIcon className="w-6 h-6 text-pink-500/20" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x" />

          <div className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-6">
                <HeartIcon className="w-12 h-12 text-pink-500 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Creating Your Love Song
              </h2>
              <p className="text-gray-600 mb-6">
              This may take a few minutes.We will notify you when it's ready 
              (Please do not close this window )
              </p>

              <div className={`transform transition-all duration-500 ${
                showEmailInput 
                  ? 'translate-y-0 opacity-100' 
                  : '-translate-y-10 opacity-0 pointer-events-none'
              }`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold
                      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                      flex items-center justify-center gap-2"
                  >
                    <HeartIcon className="w-5 h-5" />
                    Notify Me When Ready
                  </button>
                </form>
              </div>

              <div className={`transform transition-all duration-500 ${
                showSuccess
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-10 opacity-0'
              }`}>
                <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-green-800 font-medium">Email Saved Successfully!</p>
                    <p className="text-green-600 text-sm">We'll notify you when your love song is ready.</p>
                  </div>
                </div>
              </div>

              <div className={`mt-8 space-y-4 transform transition-all duration-500 ${
                !showEmailInput ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="flex justify-center space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {isGenerating 
                    ? "Crafting your perfect Valentine's melody..." 
                    : "Your love song is almost ready!"}
                </p>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x" />
        </div>
      </div>
    </div>
  );
} 