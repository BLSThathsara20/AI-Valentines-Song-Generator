import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import CaptchaBanner from '../assets/images/captcha-banner.png';

const HEART_EMOJIS = ['❤️', '💖', '💝', '💗', '💓', '💕'];

export function ValentineCaptcha({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) {
  const [selectedHeart, setSelectedHeart] = useState<string | null>(null);
  const [targetHeart, setTargetHeart] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetHeart(HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)]);
    }
  }, [isOpen]);

  const handleHeartClick = (heart: string) => {
    setSelectedHeart(heart);
    if (heart === targetHeart) {
      setShowSuccess(true);
      setTimeout(() => onSuccess(), 300);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`relative max-w-md w-full transform transition-all duration-300 my-4 ${
        showSuccess ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Floating hearts background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-hearts"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            >
              <HeartIcon className="w-6 h-6 text-pink-500/20" />
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-transform duration-300 ${
          shake ? 'animate-shake' : ''
        } ${showSuccess ? 'scale-105' : ''}`}>
          {/* Top Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x" />

          {/* Content */}
          <div className="p-0 sm:p-0">
            {/* Banner Image */}
            <div className="w-full -mt-4">
              <img 
                src={CaptchaBanner} 
                alt="Valentine's Captcha" 
                className="w-full object-cover animate-fade-in"
              />
            </div>

            <div className="px-4 sm:px-8 pb-4  sm:pb-8 -mt-6 relative z-10">
              {/* Target Heart */}
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-pink-50 rounded-full flex items-center justify-center animate-pulse-subtle">
                  <span className="text-3xl sm:text-4xl animate-bounce-subtle">{targetHeart}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 animate-shimmer" />
              </div>

              {/* Heart Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {HEART_EMOJIS.map((heart, index) => (
                  <button
                    key={heart}
                    onClick={() => handleHeartClick(heart)}
                    className={`
                      relative group aspect-square rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300
                      ${selectedHeart === heart 
                        ? heart === targetHeart
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 scale-105 shadow-lg' 
                          : 'bg-gradient-to-br from-pink-500 to-red-500 scale-105 shadow-lg'
                        : 'bg-white hover:bg-pink-50 border-2 border-pink-100 hover:border-pink-300'
                      }
                      transform hover:scale-105 active:scale-95
                    `}
                    disabled={showSuccess}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <span className={`text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300 inline-block
                      ${selectedHeart === heart && heart === targetHeart ? 'animate-success' : ''}`}>
                      {heart}
                    </span>
                    
                    {/* Hover Effects */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-red-500/10 to-pink-500/10 animate-gradient-x rounded-xl sm:rounded-2xl" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 animate-gradient-x" />
        </div>
      </div>
    </div>
  );
} 