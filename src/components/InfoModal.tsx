import { Modal } from './Modal';
import { Fragment } from 'react';
import { Transition } from '@headlessui/react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop with animation */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose} // Close when clicking outside
          />
        </Transition.Child>

        {/* Modal container with animation */}
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-full scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-full scale-95"
          >
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all max-w-lg w-full animate-slide-up">
              <div className="p-4 md:p-6 max-w-lg w-full overflow-y-auto max-h-[90vh]">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Create your perfect Valentine's song in 2 easy steps!</h2>
                  <p className="text-sm md:text-base text-gray-600">How It Works</p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-pink-50 rounded-lg md:rounded-xl transform transition-all hover:scale-[1.02] hover:shadow-md">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-0.5 md:mb-1 text-sm md:text-base">Select your song style</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Select voice type, genre, mood, and era for your perfect Valentine's song
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-red-50 rounded-lg md:rounded-xl transform transition-all hover:scale-[1.02] hover:shadow-md">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-0.5 md:mb-1 text-sm md:text-base">Write Your Lyrics</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                      Enter your heartfelt lyrics or use our AI-powered lyrics generator and edit it to your liking. (Recomended to use Englishnglish and tamil inputs for optimum results)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Important Notes:</h4>
                  <ul className="text-xs md:text-sm text-gray-600 space-y-1.5 md:space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">•</span>
                      Generation takes maximum 24 hours
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">•</span>
                      Maximum {import.meta.env.VITE_MAX_SONGS_PER_USER || 2} songs per user
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">•</span>
                      Get email and sms notifications when ready
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">•</span>
                      All content must be family-friendly
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onClose}
                  className="mt-4 md:mt-6 w-full py-2 md:py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm md:text-base rounded-lg hover:from-pink-600 hover:to-red-600 transition-all font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Let's Get Started! 💝
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  );
} 