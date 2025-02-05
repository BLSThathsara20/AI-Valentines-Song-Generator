import { useState, useEffect } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import SongProgressingBanner from '../assets/images/song-progressing-banner.png';

interface GenerationLoadingModalProps {
  isOpen: boolean;
  onEmailSubmit: (email: string) => void;
  defaultEmail: string;
  isGenerating: boolean;
  onNotificationDetailsSubmit?: (details: { email: string; phone: string }) => void;
}

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (value: string): string => {
  const cleanedValue = value.replace(/\D/g, '');
  if (cleanedValue.length === 0) {
    return 'Phone number is required';
  }
  if (cleanedValue.length !== 9) {
    return 'Phone number must be exactly 9 digits (e.g., 760000000)';
  }
  if (!cleanedValue.startsWith('7')) {
    return 'Phone number must start with 7';
  }
  return '';
};

const PHONE_STORAGE_KEY = 'valentine_phone_number';

export function GenerationLoadingModal({ 
  isOpen, 
  onEmailSubmit, 
  defaultEmail,
  isGenerating,
  onNotificationDetailsSubmit
}: GenerationLoadingModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isValid, setIsValid] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [phone, setPhone] = useState(() => localStorage.getItem(PHONE_STORAGE_KEY) || '');
  const [phoneError, setPhoneError] = useState('');
  const [showSMSSuccess, setShowSMSSuccess] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setShowSMSSuccess(false);
      setShowConsentError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const shouldSubmit = showSuccess && showSMSSuccess && onNotificationDetailsSubmit;
    if (shouldSubmit) {
      onNotificationDetailsSubmit({ email, phone });
    }
  }, [showSuccess, showSMSSuccess]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConsentError(false);

    if (!hasConsent) {
      setShowConsentError(true);
      return;
    }

    // Only validate email if it's not empty
    if (email && !validateEmail(email)) {
      setIsValid(false);
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }

    // Save both email and phone
    if (email) {
      onEmailSubmit(email);
    }
    localStorage.setItem(PHONE_STORAGE_KEY, phone);
    
    setIsValid(true);
    setShowSuccess(true);
    setShowSMSSuccess(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, '');
    const truncatedValue = cleanedValue.slice(0, 9);
    setPhone(truncatedValue);
    setPhoneError(validatePhone(truncatedValue));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="flex-none">
          <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x rounded-t-2xl" />
          
          {/* Banner Image */}
          <div className="w-full">
            <img 
              src={SongProgressingBanner} 
              alt="Song Generation in Progress" 
              className="w-full h-auto object-cover rounded-t-lg"
            />
          </div>

          <div className="text-center px-6 pt-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your love song is being created</h3>
           
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {showSuccess ? (
            <div className="text-center py-4 animate-fade-in space-y-4">
              <div className="text-green-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">Contact details saved!</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Details Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsValid(true);
                    }}
                    placeholder="Enter your email (optional)"
                    className={`w-full px-4 py-3 text-sm text-gray-700 border-2 ${
                      isValid ? 'border-gray-100' : 'border-red-300'
                    } rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all`}
                  />
                  {!isValid && (
                    <p className="mt-1 text-sm text-red-500">Please enter a valid email address or leave it empty</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-pink-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      +94
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="760000000"
                      className={`w-full pl-12 pr-4 py-3 text-sm text-gray-700 border-2 ${
                        phoneError ? 'border-red-300' : 'border-gray-100'
                      } rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all`}
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a 9-digit phone number (e.g., 760000000)
                  </p>
                </div>
              </div>

              {/* Consent Checkbox with Updated Styling */}
              <div className="space-y-4">
                {/* Privacy Notice */}
                <div className="bg-pink-50/50 backdrop-blur-sm rounded-xl p-4 border border-pink-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By providing your mobile number and email address, you agree to receive notifications regarding the status of your song. Your information will be used solely for this purpose and will not be shared with third parties. You can request the deletion of your data at any time by contacting us.
                  </p>
                </div>

                {/* Consent Checkbox */}
                <div className="bg-pink-50/50 backdrop-blur-sm rounded-xl p-4 border border-pink-100">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={hasConsent}
                        onChange={(e) => {
                          setHasConsent(e.target.checked);
                          setShowConsentError(false);
                        }}
                        className="w-4 h-4 text-pink-600 border-2 border-gray-300 rounded 
                          focus:ring-pink-500 focus:ring-2 cursor-pointer
                          checked:bg-pink-600 checked:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed">
                      I agree to the collection and use of my data as described above.
                    </p>
                  </label>
                </div>
                {showConsentError && (
                  <p className="text-sm text-red-500 px-4">
                    Please consent to receive notifications, or you'll need to check back manually after 24 hours.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl 
                  hover:from-pink-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Save Contact Details
              </button>
            </form>
          )}
        </div>

        {/* Fixed Footer - Generation Status */}
        <div className="flex-none p-6 border-t border-gray-100">
          <div className={`space-y-4 transform transition-all duration-500 ${
            isGenerating ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Creating your perfect Valentine's song...
            </p>
          </div>
        </div>

        <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x rounded-b-2xl" />
      </div>
    </div>
  );
} 