import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { HeartIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import WelcomeBanner from '../assets/images/song-player-banner.jpg';
import { FacebookShareModal } from './FacebookShareModal';
import { WhatsAppShareModal } from './WhatsAppShareModal';

export function SongPlayerPage() {
  const { songId } = useParams();
  const { setCurrentSong, setIsPlaying, isPlaying, currentSong } = usePlayerStore();
  const [sender, setSender] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facebookShareModalOpen, setFacebookShareModalOpen] = useState(false);
  const [whatsAppShareModalOpen, setWhatsAppShareModalOpen] = useState(false);

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
        audio.addEventListener('error', () => {
          setError('Failed to load audio. Please check your internet connection and try again.');
          setIsLoading(false);
        });
      } catch {
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

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Banner */}
          <div className="w-full mb-8 rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            <img 
              src={WelcomeBanner} 
              alt="Valentine's Song Player" 
              className="w-full h-auto object-cover animate-fade-in"
            />
          </div>

          {/* Song Info Section */}
          <div className="hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg animate-fade-in">
            <HeartIcon className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Your Special Valentine's Song
            </h1>
            {sender && (
              <div className="inline-block bg-pink-50 px-4 py-2 rounded-full animate-slide-up">
                <p className="text-lg text-pink-600">
                  Sent with love by {sender} 💝
                </p>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 animate-fade-in flex items-center justify-center gap-2 shadow-md">
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
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="relative">
                {/* Spinning Record Animation */}
                <div className={`w-32 sm:w-48 h-32 sm:h-48 mx-auto mb-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 
                  ${isPlaying ? 'animate-spin-slow' : ''} relative shadow-xl`}>
                  <div className="absolute inset-4 rounded-full bg-gray-900 flex items-center justify-center">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Play/Pause Button Overlay */}
                <button
                  onClick={togglePlay}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-pink-500 text-white shadow-lg
                    hover:bg-pink-600 transition-all duration-300
                    flex items-center justify-center
                    hover:scale-110 active:scale-95"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 sm:w-10 h-8 sm:h-10" />
                  ) : (
                    <PlayIcon className="w-8 sm:w-10 h-8 sm:h-10 ml-1" />
                  )}
                </button>
              </div>

              {/* Song Title */}
              <div className="mt-8 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {currentSong?.title}
                </h2>
                <p className="text-gray-500">Now Playing</p>
              </div>

              {/* Audio Wave Animation */}
              <div className="flex justify-center gap-1 h-12 items-center mb-8">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-gradient-to-t from-pink-500 to-red-500 rounded-full transition-all duration-300 ${
                      isPlaying ? 'animate-wave' : 'h-2'
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isPlaying ? `${Math.random() * 100}%` : '8px'
                    }}
                  />
                ))}
              </div>

              {/* Button Container with Responsive Layout */}
              <div className="flex flex-col gap-6">
                {/* Main Action Button - Full Width on Mobile */}
                <Link 
                  to="/"
                  className="w-full sm:w-auto mx-auto inline-flex items-center justify-center gap-2 px-8 py-4 
                    bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full
                    hover:from-pink-600 hover:to-red-600 transition-all duration-300 
                    hover:scale-105 shadow-lg text-lg font-medium"
                >
                  <HeartIcon className="w-6 h-6" />
                  Create another song
                </Link>

                {/* Icon Buttons Container - Centered Row */}
                <div className="flex justify-center items-center gap-4">
                  {/* Download Button */}
                  <button
                    onClick={() => {
                      if (currentSong?.url) {
                        try {
                          const link = document.createElement('a');
                          link.href = currentSong.url;
                          const formattedTitle = currentSong.title 
                            ? `valentine-song-${currentSong.title.toLowerCase().replace(/\s+/g, '-')}` 
                            : 'valentine-song';
                          link.download = `${formattedTitle}.mp3`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (error) {
                          console.error('Download failed:', error);
                          setError('Failed to download song. Please try again.');
                        }
                      }
                    }}
                    className="p-4 bg-white text-pink-500 rounded-full hover:bg-pink-50 border-2 border-pink-500 
                      transition-all duration-300 hover:scale-110 shadow-lg group tooltip-container"
                    aria-label="Download Song"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="tooltip">Download Song</span>
                  </button>

                  {/* Facebook Share Button */}
                  <button
                    onClick={() => setFacebookShareModalOpen(true)}
                    className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 
                      transition-all duration-300 hover:scale-110 shadow-lg group tooltip-container"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="tooltip">Share on Facebook</span>
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    onClick={() => setWhatsAppShareModalOpen(true)}
                    className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 
                      transition-all duration-300 hover:scale-110 shadow-lg group tooltip-container"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="tooltip">Share on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-center text-gray-500 text-sm animate-fade-in bg-white/50 backdrop-blur-sm rounded-xl p-4">
            Want to create a special song for someone you love?{' '}
            <Link to="/" className="text-pink-500 hover:text-pink-600 underline font-medium">
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
          // console.log('Audio can play');
          if (isPlaying) {
            audioRef.current?.play().catch(error => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
              setError('Failed to play audio. Please check your internet connection and try again.');
            });
          }
        }}
      />

      {/* Modals for sharing */}
      {facebookShareModalOpen && (
        <FacebookShareModal
          isOpen={facebookShareModalOpen}
          onClose={() => setFacebookShareModalOpen(false)}
          songTitle={currentSong?.title || ''}
          songUrl={currentSong?.url || ''}
        />
      )}
      {whatsAppShareModalOpen && (
        <WhatsAppShareModal
          isOpen={whatsAppShareModalOpen}
          onClose={() => setWhatsAppShareModalOpen(false)}
          songTitle={currentSong?.title || ''}
          songUrl={currentSong?.url || ''}
        />
      )}
    </div>
  );
}