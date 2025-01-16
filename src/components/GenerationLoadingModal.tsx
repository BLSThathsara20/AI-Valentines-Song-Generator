import { useState, useEffect } from 'react';
import { MusicalNoteIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GenerationLoadingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function GenerationLoadingModal({ isOpen, onClose }: GenerationLoadingModalProps) {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    'Creating your melody',
    'Adding some love notes',
    'Sprinkling musical magic',
    'Making it special',
    'Almost ready',
  ];

  useEffect(() => {
    if (isOpen) {
      // Animate dots
      const dotsInterval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);

      // Rotate messages
      const messageInterval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % messages.length);
      }, 3000);

      return () => {
        clearInterval(dotsInterval);
        clearInterval(messageInterval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}

        {/* Animated Record */}
        <div className="relative h-40 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-red-500 animate-spin-slow 
              flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-pink-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Floating Notes */}
          {[...Array(6)].map((_, i) => (
            <MusicalNoteIcon
              key={i}
              className="absolute w-6 h-6 text-pink-400 animate-float"
              style={{
                left: `${10 + i * 18}%`,
                animationDelay: `${i * 0.2}s`,
                top: '50%'
              }}
            />
          ))}
        </div>

        {/* Loading Message */}
        <div className="text-center space-y-4">
          <p className="text-xl font-medium text-gray-800">
            {messages[messageIndex]}{dots}
          </p>
          <p className="text-sm text-gray-500">
            This usually takes 2-5 minutes
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 