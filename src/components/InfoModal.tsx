import { XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 md:p-6 max-w-lg w-full overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-6 md:mb-8">
          <div className="text-3xl md:text-4xl mb-3 md:mb-4">💝</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">How It Works</h2>
          <p className="text-sm md:text-base text-gray-600">Create your perfect Valentine's song in 3 easy steps!</p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Step 1 */}
          <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-pink-50 rounded-lg md:rounded-xl">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-0.5 md:mb-1 text-sm md:text-base">Choose Your Style</h3>
              <p className="text-gray-600 text-xs md:text-sm">
                Select voice type, genre, mood, and era for your perfect Valentine's song
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-red-50 rounded-lg md:rounded-xl">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-0.5 md:mb-1 text-sm md:text-base">Write Your Lyrics</h3>
              <p className="text-gray-600 text-xs md:text-sm">
                Enter your heartfelt lyrics or use our AI-powered lyrics generator
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-purple-50 rounded-lg md:rounded-xl">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-0.5 md:mb-1 text-sm md:text-base">Generate & Share</h3>
              <p className="text-gray-600 text-xs md:text-sm">
                Create your song and share it with your loved ones
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Important Notes:</h4>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1.5 md:space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-pink-500">•</span>
              Generation takes 2-3 minutes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">•</span>
              Maximum 5 songs per user
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">•</span>
              Get email notifications when ready
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">•</span>
              All content must be family-friendly
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-4 md:mt-6 w-full py-2 md:py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm md:text-base rounded-lg hover:from-pink-600 hover:to-red-600 transition-all font-medium"
        >
          Got it!
        </button>
      </div>
    </Modal>
  );
} 