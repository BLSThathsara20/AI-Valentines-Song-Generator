import { PlayIcon, PauseIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { usePlayerStore } from '../store/playerStore';

interface CustomMusicPlayerProps {
  src: string;
  title: string;
  tags: string[];
  imageUrl: string;
  onShareEmail?: () => void;
}

export function CustomMusicPlayer({ 
  src, 
  title,
  tags,
  imageUrl,
  onShareEmail
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

        {onShareEmail && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareEmail();
            }}
            className="p-2 rounded-full text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          >
            <EnvelopeIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
} 