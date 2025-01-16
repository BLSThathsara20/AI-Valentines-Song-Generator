import { useState, useEffect } from 'react';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  songUrl: string;
}

export function WhatsAppShareModal({ isOpen, onClose, songTitle, songUrl }: WhatsAppShareModalProps) {
  // Create a shareable link that will work with the SongPlayerPage
  const songData = {
    url: songUrl,
    title: songTitle,
    sender: "A Valentine's Friend"
  };
  const encodedData = btoa(JSON.stringify(songData));
  const playPageUrl = `${window.location.origin}/lyrics-to-song/#/play/${encodedData}`;

  const [message, setMessage] = useState(
    `🎵 Check out this Valentine's song I created: "${songTitle}"\n\n` +
    `Listen here: ${playPageUrl}\n\n` +
    `💝 Create your own Valentine's song at: ${window.location.origin}/lyrics-to-song/`
  );

  const handleShare = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Share via WhatsApp</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg mb-4 text-gray-700 resize-none"
          placeholder="Add your message..."
        />

        <button
          onClick={handleShare}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 
            transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <ShareIcon className="w-5 h-5" />
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
} 