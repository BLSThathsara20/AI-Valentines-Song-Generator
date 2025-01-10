import { useState } from 'react';
import { EnvelopeIcon, HeartIcon } from '@heroicons/react/24/outline';
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
        url: songUrl,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
            <HeartIcon className="w-6 h-6 text-pink-500" />
            Share Your Love Song
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Send this special song to your loved one
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Your love song has been sent!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient's Name
              </label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Love Note
              </label>
              <textarea
                required
                value={formData.loveNote}
                onChange={(e) => setFormData(prev => ({ ...prev, loveNote: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
                placeholder="Write a personal message..."
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm">
                Failed to send email. Please try again.
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-pink-300 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Sending...</span>
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
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
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