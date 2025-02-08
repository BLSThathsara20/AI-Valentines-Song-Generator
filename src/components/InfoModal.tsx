import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
              {/* Sticky Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>

              <div className="p-4 md:p-6 max-w-lg w-full overflow-y-auto max-h-[90vh]">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Create your perfect Valentine's song in 2 easy steps!</h2>
                  <p className="text-sm md:text-xl text-gray-600">How It Works</p>
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
                        Enter your heartfelt lyrics or use our AI-powered lyrics generator and edit it to your liking. (Recommended to use English and tamil inputs for optimum results)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Important Notes:</h4>
                  <ul className="text-xs md:text-sm text-gray-600 space-y-1.5 md:space-y-2">
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

                {/* Terms and Conditions Section */}
                <div className="mt-6 md:mt-8 border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-800 mb-4">Terms and Conditions</h3>
                  <div className="relative p-0.5 rounded-xl overflow-hidden bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative space-y-4 text-sm text-gray-600 max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white/95 backdrop-blur-sm rounded-lg p-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-red-50 opacity-50"></div>
                      <div className="relative">
                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">1. Eligibility</h4>
                          <p>1.1 This Valentine's Song Generator is open to all individuals.</p>
                          <p>1.2 Users must comply with all local laws and regulations.</p>
                        </section>

                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">2. Platform Use</h4>
                          <p>2.1 The platform allows users to create personalized Valentine's songs using AI technology.</p>
                          <p>2.2 The service is provided "as is" without guarantees of uninterrupted operation.</p>
                        </section>

                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">3. User Responsibilities</h4>
                          <p>3.1 Users are responsible for the lyrics and content they submit.</p>
                          <p>3.2 Content must be original and not violate any copyrights.</p>
                          <p>3.3 Users must refrain from submitting inappropriate or offensive content.</p>
                        </section>

                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">4. Intellectual Property</h4>
                          <p>4.1 The platform and its features remain the property of Enfection.</p>
                          <p>4.2 Generated songs are for personal use only and may not be used commercially.</p>
                        </section>

                        <section className="pb-3" >
                          <h4 className="font-semibold text-gray-800 pb-1">5. Privacy & Data</h4>
                          <p>5.1 User data is handled according to our Privacy Policy.</p>
                          <p>5.2 Email and phone numbers are used solely for song delivery notifications.</p>
                        </section>

                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">6. Content Moderation</h4>
                          <p>6.1 We reserve the right to reject inappropriate content.</p>
                          <p>6.2 Users may be restricted for violating these terms.</p>
                        </section>

                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">7. Service Limitations</h4>
                          <p>7.1 Maximum {import.meta.env.VITE_MAX_SONGS_PER_USER || 2} songs per user.</p>
                          <p>7.2 Generation times may vary based on system load.</p>
                        </section>

                        <section className="pb-3">
                          <h4 className="font-semibold text-gray-800 pb-1">8. Modifications</h4>
                          <p>8.1 We reserve the right to modify or terminate the service.</p>
                          <p>8.2 Changes will be communicated through the platform.</p>
                        </section>
                      </div>
                    </div>
                  </div>
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