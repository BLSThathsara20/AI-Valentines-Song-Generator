import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { sendSMS } from '../services/smsService';
import { createPlayUrl, shortenUrl } from '../services/urlService';

const MAX_CHARS = Number(import.meta.env.VITE_SMS_MAX_CHARS) || 160;

interface SMSShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  songUrl: string;
}

// Animated SMS Icon Component
function AnimatedSMSIcon() {
  return (
    <div className="animate-pulse">
      <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="w-7 h-7 text-pink-500"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </div>
    </div>
  );
}

export function SMSShareModal({ isOpen, onClose, songTitle, songUrl }: SMSShareModalProps) {
  const [phone, setPhone] = useState(() => localStorage.getItem('PHONE_STORAGE_KEY') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const initializeMessage = async () => {
      const songData = {
        url: songUrl,
        title: songTitle,
        sender: "A Valentine's Friend"
      };
      const playUrl = createPlayUrl(songData);
      const shortened = await shortenUrl(playUrl);
      setShortUrl(shortened);
      
      const initialMessage = `Check out this Valentine's song I created: "${songTitle}"\n\nListen here: ${shortened}`;
      
      // Truncate message if it exceeds character limit
      const truncatedMessage = initialMessage.length > MAX_CHARS 
        ? initialMessage.slice(0, MAX_CHARS - 3) + '...'
        : initialMessage;
      
      setMessage(truncatedMessage);
      setCharCount(truncatedMessage.length);
    };

    if (isOpen) {
      initializeMessage();
    }
  }, [isOpen, songTitle, songUrl]);

  if (!isOpen) return null;

  const validatePhone = (value: string) => {
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, '');
    // Only allow up to 9 digits
    const truncatedValue = cleanedValue.slice(0, 9);
    setPhone(truncatedValue);
    setError(validatePhone(truncatedValue));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_CHARS) {
      setMessage(newMessage);
      setCharCount(newMessage.length);
    }
  };

  const handleSendSMS = async () => {
    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await sendSMS(phone, message);
      
      if (success) {
        localStorage.setItem('PHONE_STORAGE_KEY', phone);
        onClose();
      } else {
        throw new Error('Failed to send SMS');
      }
    } catch (err) {
      setError('Failed to send SMS. Please try again.');
      console.error('SMS error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 ease-out scale-100 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <AnimatedSMSIcon />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Share via SMS</h3>
              <p className="text-sm text-gray-500 mt-1">Send this special song to your loved ones</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-pink-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Your message will include:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-pink-500">•</span>
              <span>Song title and shortened link</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">•</span>
              <span>Invitation to create their own song</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
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
                  error ? 'border-red-300' : 'border-gray-100'
                } rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all`}
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter a 9-digit phone number (e.g., 760000000)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Preview
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={handleMessageChange}
                className="w-full px-4 py-3 text-sm text-gray-700 border-2 border-gray-100 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                rows={6}
                maxLength={MAX_CHARS}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {charCount}/{MAX_CHARS}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendSMS}
              disabled={isLoading || !!error}
              className={`flex-1 px-6 py-3 rounded-xl text-white
                transition-all duration-300 flex items-center justify-center gap-2
                shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
                ${isLoading || error ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
              {isLoading ? 'Sending...' : 'Send SMS'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 