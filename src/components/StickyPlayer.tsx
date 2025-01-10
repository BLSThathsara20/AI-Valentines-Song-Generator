import { useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePlayerStore } from '../store/playerStore';

interface StickyPlayerProps {
  showClose?: boolean;
}

export function StickyPlayer({ showClose = true }: StickyPlayerProps) {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong?.url]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <div>
              <div className="font-medium text-gray-800">{currentSong.title}</div>
              <div className="text-sm text-gray-500">Now Playing</div>
            </div>
          </div>
          
          {showClose && (
            <button
              onClick={() => setCurrentSong(null)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentSong.url}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setIsPlaying(false);
        }}
      />
    </div>
  );
} 