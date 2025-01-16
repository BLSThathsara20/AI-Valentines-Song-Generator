import { useState } from 'react';
import { EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import emailjs from '@emailjs/browser';

interface SongStatusEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  songDetails: {
    prompt: string;
    status: string;
    title?: string;
    url?: string;
  };
}

const EMAIL_STORAGE_KEY = 'valentine_notification_email';

export function SongStatusEmailModal({ isOpen, onClose, songDetails }: SongStatusEmailModalProps) {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem(EMAIL_STORAGE_KEY) || '';
  });
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (isTest: boolean = false) => {
    setIsLoading(true);
    const emailData = {
      to_email: email,
      from_name: "Valentine's Song Generator",
      to_name: "Music Lover",
      reply_to: "no-reply@example.com",
      song_prompt: isTest ? "Test song prompt" : songDetails.prompt,
      song_status: isTest ? "TEST" : songDetails.status,
      song_title: songDetails.title || '',
      song_url: songDetails.url || '',
      timestamp: new Date().toLocaleString(),
      message: isTest 
        ? "This is a test email to verify your notification settings."
        : `Your Valentine's song "${songDetails.title}" is ${songDetails.status}!`,
      bcc: "",
      cc: ""
    };

    console.log('Sending email notification:', emailData);

    try {
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
        emailData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', result);

      if (!isTest) {
        localStorage.setItem(EMAIL_STORAGE_KEY, email);
        console.log('Notification email saved:', email);
      }

      if (!isTest) onClose();
      
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'success',
          message: isTest 
            ? 'Test email sent successfully!' 
            : 'Song status notification has been set up! You will receive updates at ' + email
        }
      }));
    } catch (error) {
      console.error('Failed to send email:', error);
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'error',
          message: 'Failed to send email. Please try again.'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendEmail(false);
  };

  const handleTestEmail = async () => {
    await sendEmail(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Get Song Status Updates
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          We'll notify you when your song is ready! Enter your email address below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-pink-300 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Setting up...</span>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5" />
                  Notify Me
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isLoading || !email}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            >
              Test Email
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
      </div>
    </div>
  );
} 