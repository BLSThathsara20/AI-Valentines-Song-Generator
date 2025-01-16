import { useState } from 'react';
import { EnvelopeIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import emailjs from '@emailjs/browser';

interface ShareSongEmailProps {
  songTitle: string;
  songUrl: string;
  onClose: () => void;
}

// Add these from your EmailJS account
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Animated heart component
function AnimatedHeart({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className="animate-pulse">
      <HeartIcon className={`${className} text-pink-500`} />
    </div>
  );
}

export function ShareSongEmail({ songTitle, songUrl, onClose }: ShareSongEmailProps) {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    loveNote: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const songData = {
        url: songUrl.startsWith('http') ? songUrl : `${window.location.origin}${songUrl}`,
        title: songTitle,
        sender: formData.senderName
      };
      const encodedData = btoa(JSON.stringify(songData));
      const playPageUrl = `${window.location.origin}/lyrics-to-song/#/play/${encodedData}`;

      const templateParams = {
        to_email: formData.recipientEmail,
        to_name: formData.recipientName,
        from_name: formData.senderName,
        message: formData.loveNote,
        song_title: songTitle,
        song_url: playPageUrl
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 ease-out scale-100 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <AnimatedHeart />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Share Your Love Song</h3>
              <p className="text-sm text-gray-500 mt-1">Send this special song to your loved one</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-pink-600 mb-2">Love Song Sent! 💝</h4>
            <p className="text-gray-600">Your special song is on its way to warm their heart</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-pink-50 rounded-xl p-4 mb-6 border border-pink-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient's Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                  className="w-full px-3 py-2 bg-white rounded-lg mb-3 text-gray-700 border-2 border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  placeholder="Enter their name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient's Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  className="w-full px-3 py-2 bg-white rounded-lg mb-3 text-gray-700 border-2 border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  placeholder="Enter their email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                  className="w-full px-3 py-2 bg-white rounded-lg text-gray-700 border-2 border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Love Note
              </label>
              <div className="relative">
                <textarea
                  required
                  value={formData.loveNote}
                  onChange={(e) => setFormData(prev => ({ ...prev, loveNote: e.target.value }))}
                  className="w-full px-4 py-3 bg-white rounded-xl text-gray-700 border-2 border-gray-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  rows={4}
                  placeholder="Write a personal message..."
                />
                <HeartIcon className="absolute right-3 top-3 w-5 h-5 text-pink-300" />
              </div>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Failed to send email. Please try again.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 
                  disabled:bg-pink-300 transition-all duration-300 flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5" />
                    Send Love Song
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 