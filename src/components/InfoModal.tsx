import { useEffect, useRef } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-lg mx-4 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-pink-500">💝</span>
          How It Works
        </h2>
        
        <div className="space-y-4 text-gray-600">
          <p>
            Create your perfect Valentine's Day song in three easy steps:
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">1. Choose Your Style 🎵</h3>
            <p>Select the voice type, genre, mood, and era for your song. This helps create the perfect musical atmosphere.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">2. Add Lyrics (Optional) ✍️</h3>
            <p>You can either write your own lyrics or use our AI to help generate romantic lyrics based on your ideas.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">3. Create Your Song 🎼</h3>
            <p>Click the create button and watch as AI transforms your choices into a beautiful Valentine's Day song!</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
} 