import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { StickyPlayer } from './StickyPlayer';
import { HeartIcon, MusicalNoteIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

export function SongPlayerPage() {
  const { songId } = useParams();
  const { setCurrentSong, setIsPlaying, isPlaying, currentSong } = usePlayerStore();
  const [sender, setSender] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (songId) {
      try {
        // First, decode the base64 URL parameter
        const decodedData = JSON.parse(atob(songId));
        const { url, title, sender } = decodedData;
        
        // Ensure the URL is properly constructed
        let fullUrl = url;
        if (!url.startsWith('http')) {
          // Remove any leading slashes and construct the full URL
          const cleanPath = url.replace(/^\/+/, '');
          fullUrl = `${window.location.origin}/${cleanPath}`;
        }
        
        // Set the current song with the full URL
        setCurrentSong({ url: fullUrl, title });
        setSender(sender);
        setError(null);
        
        // Preload the audio to check if it's valid
        const audio = new Audio(fullUrl);
        audio.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
        });
        audio.addEventListener('error', (e) => {
          setError('Failed to load audio. Please check your internet connection and try again.');
          setIsLoading(false);
        });
      } catch (error) {
        setError('Failed to load song data. Please try again.');
        setIsLoading(false);
      }
    }
  }, [songId, setCurrentSong]);

  // Separate effect for loading the audio source
  useEffect(() => {
    if (audioRef.current && currentSong?.url) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
    }
  }, [currentSong?.url]);

  // Separate effect for handling play/pause
  useEffect(() => {
    if (audioRef.current && !isLoading) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            setError('Failed to play audio. Please check your internet connection and try again.');
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isLoading, setIsPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setError(null); // Clear any previous errors
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            setError('Failed to play audio. Please check your internet connection and try again.');
          });
        }
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 to-red-50 overflow-hidden">
      {/* Floating Hearts Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          >
            <HeartIcon className="w-6 h-6 text-pink-200 transform rotate-45" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-3xl mx-auto text-center">
          <HeartIcon className="w-16 h-16 text-pink-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            Your Special Love Song
          </h1>
          {sender && (
            <p className="text-xl text-gray-600 mb-12 animate-slide-up">
              Sent with love by {sender}
            </p>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 animate-fade-in flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl mb-12">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent" />
                <span className="text-gray-600">Loading your love song...</span>
              </div>
            </div>
          ) : (
            /* Main Player Card */
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="relative">
                {/* Spinning Record Animation */}
                <div className={`w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 
                  ${isPlaying ? 'animate-spin-slow' : ''} relative`}>
                  <div className="absolute inset-4 rounded-full bg-gray-900 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Play/Pause Button Overlay */}
                <button
                  onClick={togglePlay}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    w-20 h-20 rounded-full bg-pink-500 text-white shadow-lg
                    hover:bg-pink-600 transition-all duration-300
                    flex items-center justify-center
                    hover:scale-110"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-10 h-10" />
                  ) : (
                    <PlayIcon className="w-10 h-10 ml-1" />
                  )}
                </button>
              </div>

              {/* Song Title */}
              <div className="mt-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentSong?.title}
                </h2>
                <p className="text-gray-500 mt-2">Now Playing</p>
              </div>

              {/* Audio Wave Animation */}
              <div className="flex justify-center gap-1 h-12 items-center mb-8">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-pink-500 rounded-full transition-all duration-300 ${
                      isPlaying ? 'animate-wave' : 'h-2'
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isPlaying ? `${Math.random() * 100}%` : '8px'
                    }}
                  />
                ))}
              </div>

              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500 text-white rounded-full
                  hover:bg-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <HeartIcon className="w-6 h-6" />
                Create Your Own Love Song
              </Link>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-center text-gray-500 text-sm animate-fade-in">
            Want to create a special song for someone you love?{' '}
            <Link to="/" className="text-pink-500 hover:text-pink-600 underline">
              Try our Valentine's Song Generator
            </Link>
          </div>
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setIsPlaying(false);
          setError('Failed to play audio. Please check your internet connection and try again.');
        }}
        onCanPlay={() => {
          console.log('Audio can play'); // Debug log
          if (isPlaying) {
            audioRef.current?.play().catch(error => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
              setError('Failed to play audio. Please check your internet connection and try again.');
            });
          }
        }}
      />
    </div>
  );
} 