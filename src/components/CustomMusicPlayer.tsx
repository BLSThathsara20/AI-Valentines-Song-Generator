import { PlayIcon, PauseIcon, EnvelopeIcon, ShareIcon, BellIcon } from '@heroicons/react/24/outline';
import { usePlayerStore } from '../store/playerStore';

interface CustomMusicPlayerProps {
  src: string;
  title: string;
  tags: string[];
  imageUrl: string;
  status?: 'pending' | 'completed' | 'failed';
  onShareEmail?: () => void;
  onShareWhatsApp?: () => void;
  onSendNotification?: () => void;
  onTestEmail?: () => void;
}

export function CustomMusicPlayer({ 
  src, 
  title,
  tags,
  imageUrl,
  status,
  onShareEmail,
  onShareWhatsApp,
  onSendNotification,
  onTestEmail
}: CustomMusicPlayerProps) {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore();

  const isCurrentSong = currentSong?.url === src;

  const handlePlay = () => {
    if (isCurrentSong) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong({ url: src, title });
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={handlePlay}
          className="group relative"
        >
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white shadow-lg transform group-hover:scale-110 transition-transform">
            {isCurrentSong && isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 ml-0.5" />
            )}
          </span>
        </button>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'completed' && onSendNotification && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSendNotification();
              }}
              className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Send Completion Email"
            >
              <BellIcon className="w-5 h-5" />
            </button>
          )}
          {onTestEmail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTestEmail();
              }}
              className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Send Test Email"
            >
              <BellIcon className="w-5 h-5" />
            </button>
          )}
          {onShareEmail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareEmail();
              }}
              className="p-2 rounded-full text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
              title="Share via Email"
            >
              <EnvelopeIcon className="w-5 h-5" />
            </button>
          )}
          
          {onShareWhatsApp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareWhatsApp();
              }}
              className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Share via WhatsApp"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 