import { useState, useEffect } from 'react';

interface ValentineCaptchaProps {
  onSuccess: () => void;
  isOpen: boolean;
}

interface AttemptState {
  count: number;
  lastAttemptTime?: number;
  timeoutUntil?: number;
}

export function ValentineCaptcha({ onSuccess, isOpen }: ValentineCaptchaProps) {
  const [targetHeart, setTargetHeart] = useState('');
  const [selectedHeart, setSelectedHeart] = useState('');
  const [attempts, setAttempts] = useState<AttemptState>(() => {
    // Load attempts from localStorage
    const saved = localStorage.getItem('valentine_captcha_attempts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if timeout is still active
      if (parsed.timeoutUntil && Date.now() < parsed.timeoutUntil) {
        return parsed;
      }
    }
    return { count: 0 };
  });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const hearts = [
    { emoji: '❤️', name: 'Red Heart' },
    { emoji: '💖', name: 'Sparkling Heart' },
    { emoji: '💝', name: 'Heart with Ribbon' },
    { emoji: '💕', name: 'Two Hearts' },
    { emoji: '💗', name: 'Growing Heart' },
    { emoji: '💓', name: 'Beating Heart' }
  ];

  // Timer effect for countdown
  useEffect(() => {
    if (attempts.timeoutUntil) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((attempts.timeoutUntil! - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setAttempts({ count: 0 });
          localStorage.setItem('valentine_captcha_attempts', JSON.stringify({ count: 0 }));
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [attempts.timeoutUntil]);

  useEffect(() => {
    if (isOpen) {
      // If in timeout, don't generate new heart
      if (attempts.timeoutUntil && Date.now() < attempts.timeoutUntil) {
        const remaining = Math.ceil((attempts.timeoutUntil - Date.now()) / 1000);
        setTimeLeft(remaining);
        return;
      }

      const randomHeart = hearts[Math.floor(Math.random() * hearts.length)];
      setTargetHeart(randomHeart.emoji);
      setSelectedHeart('');
    }
  }, [isOpen, attempts.timeoutUntil]);

  const handleHeartSelect = (heart: string) => {
    setSelectedHeart(heart);
    
    if (heart === targetHeart) {
      // Success - reset attempts
      setAttempts({ count: 0 });
      localStorage.setItem('valentine_captcha_attempts', JSON.stringify({ count: 0 }));
      setTimeout(onSuccess, 500);
    } else {
      // Wrong selection
      const newAttempts = {
        count: attempts.count + 1,
        lastAttemptTime: Date.now(),
        timeoutUntil: undefined
      } as AttemptState;

      // Add timeout after 3 attempts
      if (newAttempts.count >= 3) {
        const timeoutDuration = 60 * 1000; // 1 minute
        newAttempts.timeoutUntil = Date.now() + timeoutDuration;
        setTimeLeft(60);
      }

      setAttempts(newAttempts);
      localStorage.setItem('valentine_captcha_attempts', JSON.stringify(newAttempts));

      // Visual feedback for wrong selection
      setTimeout(() => {
        setSelectedHeart('');
      }, 800);
    }
  };

  if (!isOpen) return null;

  // Show timeout message if in timeout period
  if (attempts.timeoutUntil && timeLeft > 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Too Many Attempts
            </h2>
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-gray-600 mb-2">
              Please wait {timeLeft} seconds before trying again
            </p>
            <p className="text-sm text-gray-500">
              This helps us prevent automated access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Valentine's Song Generator
          </h2>
          <p className="text-gray-600">
            To continue, please find and select this heart:
          </p>
          <div className="mt-4 text-5xl animate-bounce">
            {targetHeart}
          </div>
          {attempts.count > 0 && (
            <p className="text-sm text-red-500 mt-2">
              Attempts remaining: {3 - attempts.count}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
          {hearts.map((heart) => (
            <button
              key={heart.emoji}
              onClick={() => handleHeartSelect(heart.emoji)}
              className={`aspect-square rounded-xl transition-all duration-300 flex items-center justify-center text-4xl hover:bg-pink-50 ${
                selectedHeart === heart.emoji
                  ? heart.emoji === targetHeart
                    ? 'bg-green-100 scale-105 shadow-lg'
                    : 'bg-red-100 scale-105 shadow-lg'
                  : 'bg-gray-50'
              }`}
              title={heart.name}
              disabled={!!selectedHeart}
            >
              {heart.emoji}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Click on the matching heart to continue
        </p>
      </div>
    </div>
  );
} 