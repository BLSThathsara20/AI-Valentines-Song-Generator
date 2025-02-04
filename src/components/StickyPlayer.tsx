import { useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon, XMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { usePlayerStore } from '../store/playerStore';

interface StickyPlayerProps {
  showClose?: boolean;
}

export function StickyPlayer({ showClose = true }: StickyPlayerProps) {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Add states for tracking progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHoveringTrack, setIsHoveringTrack] = useState(false);

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
      audioRef.current.volume = volume;
    }
  }, [isPlaying, currentSong?.url, volume, setIsPlaying]);

  // Handle time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Add a click handler for closing volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const volumeButton = document.getElementById('volume-button');
      const volumeSlider = document.getElementById('volume-slider');
      
      if (!volumeButton?.contains(event.target as Node) && 
          !volumeSlider?.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the close button handler to set isPlaying to false
  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset the time
    }
    
    // First set playing state to false
    setIsPlaying(false);
    
    // Notify about state change before removing the song
    if (currentSong?.url) {
      window.dispatchEvent(new CustomEvent('audioStateChange', {
        detail: { isPlaying: false, url: currentSong.url }
      }));
    }
    
    // Finally remove the current song
    setCurrentSong(null);
  };

  // Update the play/pause handler to properly manage state
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            // Dispatch custom event to notify other players
            window.dispatchEvent(new CustomEvent('audioStateChange', {
              detail: { isPlaying: true, url: currentSong?.url }
            }));
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
      }
    }
  };

  // Add handler for audio ended event
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="absolute top-0 left-0 right-0 h-1 bg-gray-200 cursor-pointer group"
          onClick={handleProgressClick}
          onMouseEnter={() => setIsHoveringTrack(true)}
          onMouseLeave={() => setIsHoveringTrack(false)}
        >
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-red-500 relative"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            {/* Hover effect and draggable handle */}
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-pink-500 transform transition-transform ${
              isHoveringTrack ? 'scale-125' : 'scale-0'
            }`} />
          </div>
          {/* Time tooltip on hover */}
          {isHoveringTrack && (
            <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded z-[60]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6 ml-0.5" />
              )}
            </button>

            <div>
              <div className="font-medium text-gray-800">{currentSong.title}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="relative">
              <button
                id="volume-button"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
              >
                <SpeakerWaveIcon className="w-6 h-6" />
              </button>
              
              {showVolumeSlider && (
                <div 
                  id="volume-slider"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-[60]"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              )}
            </div>

            {showClose && (
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentSong.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onError={(e) => {
          console.error('Audio error:', e);
          setIsPlaying(false);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
} 