import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  songUrl: string;
}

// WhatsApp Icon Component
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// Animated WhatsApp Icon Component
function AnimatedWhatsAppIcon() {
  return (
    <div className="animate-pulse">
      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
        <WhatsAppIcon className="w-7 h-7 text-green-500" />
      </div>
    </div>
  );
}

export function WhatsAppShareModal({ isOpen, onClose, songTitle, songUrl }: WhatsAppShareModalProps) {
  // Create a shareable link that will work with the SongPlayerPage
  const songData = {
    url: songUrl,
    title: songTitle || 'Love Song',
    sender: "A Valentine's Friend"
  };

  // Base64 encode the song data
  const encodedData = btoa(JSON.stringify(songData));
  const playPageUrl = `${window.location.origin}/lyrics-to-song/#/play/${encodedData}`;

  // Log the data for debugging
  console.log('WhatsApp Share Data:', { songUrl, songTitle, encodedData });

  const [message, setMessage] = useState(
    `🎵 Check out this Valentine's song I created: "${songTitle}"\n\n` +
    `Listen here: ${playPageUrl}\n\n` +
    `💝 Create your own Valentine's song at: ${window.location.origin}/lyrics-to-song/`
  );

  useEffect(() => {
    // Update message when songUrl or songTitle changes
    const newSongData = {
      url: songUrl,
      title: songTitle || 'Love Song',
      sender: "A Valentine's Friend"
    };
    const newEncodedData = btoa(JSON.stringify(newSongData));
    const newPlayPageUrl = `${window.location.origin}/lyrics-to-song/#/play/${newEncodedData}`;
    
    setMessage(
      `🎵 Check out this Valentine's song I created: "${songTitle}"\n\n` +
      `Listen here: ${newPlayPageUrl}\n\n` +
      `💝 Create your own Valentine's song at: ${window.location.origin}/lyrics-to-song/`
    );
  }, [songUrl, songTitle]);

  const handleShare = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 ease-out scale-100 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <AnimatedWhatsAppIcon />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Share via WhatsApp</h3>
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

        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Your message will include:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Song title and link</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Invitation to create their own song</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 text-sm text-gray-700 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              rows={6}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 
                transition-all duration-300 flex items-center justify-center gap-2
                shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Share on WhatsApp
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