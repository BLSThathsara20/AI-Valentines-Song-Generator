import React, { useState, useEffect } from 'react';
import { HeartIcon, SparklesIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { LoadingWave } from './';
import { StyleOption } from './StyleOption';

// Add environment variable for max songs
const MAX_SONGS_PER_USER = import.meta.env.VITE_MAX_SONGS_PER_USER ? parseInt(import.meta.env.VITE_MAX_SONGS_PER_USER) : 2;

interface SongGenerationFunctionProps {
  selectedOptions: {
    voiceType: string;
    genre: string;
    mood: string;
    era: string;
  };
  handleSelectChange: (field: string, value: string) => void;
  showLyricsInput: boolean;
  setShowLyricsInput: (show: boolean) => void;
  lyricsIdea: string;
  setLyricsIdea: (lyrics: string) => void;
  promptType: 'romantic' | 'friendship' | 'nature' | 'inspiration';
  setPromptType: (type: 'romantic' | 'friendship' | 'nature' | 'inspiration') => void;
  isGeneratingLyrics: boolean;
  generateLyrics: () => void;
  prompt: string;
  handlePromptChange: (text: string) => void;
  isGenerating: boolean;
  generateMusic: () => void;
  history: Array<{
    id: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: number;
    songs?: Array<{
      id: string;
      title: string;
      song_path: string;
    }>;
  }>;
  handlePreviewClick: () => void;
  MIN_LYRICS_CHARS: number;
  MAX_LYRICS_CHARS: number;
  GENRE_OPTIONS: Array<{ value: string; label: string }>;
  MOOD_OPTIONS: Array<{ value: string; label: string }>;
  ERA_OPTIONS: Array<{ value: string; label: string }>;
  PROMPT_TYPES: Array<{ value: string; label: string }>;
  getGenreIcon: (genre: string) => string;
  getMoodIcon: (mood: string) => string;
  getEraIcon: (era: string) => string;
}

const SongGenerationFunction: React.FC<SongGenerationFunctionProps> = ({
  selectedOptions,
  handleSelectChange,
  showLyricsInput,
  setShowLyricsInput,
  lyricsIdea,
  setLyricsIdea,
  promptType,
  setPromptType,
  isGeneratingLyrics,
  generateLyrics,
  prompt,
  handlePromptChange,
  isGenerating,
  generateMusic,
  history,
  handlePreviewClick,
  MIN_LYRICS_CHARS,
  MAX_LYRICS_CHARS,
  GENRE_OPTIONS,
  MOOD_OPTIONS,
  ERA_OPTIONS,
  PROMPT_TYPES,
  getGenreIcon,
  getMoodIcon,
  getEraIcon
}) => {
  const [isExpanded, setIsExpanded] = useState(history.length === 0);

  // Watch for changes in history length
  useEffect(() => {
    // If history has items, collapse the accordion
    // If history is empty, expand the accordion
    setIsExpanded(history.length === 0);
  }, [history.length]);

  const handleLyricsChange = (text: string) => setLyricsIdea(text);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-4">
      {/* Accordion Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative overflow-hidden cursor-pointer
          bg-gradient-to-r from-pink-50 via-red-50 to-pink-50
          hover:from-pink-100 hover:via-red-100 hover:to-pink-100
          transition-all duration-500 transform
          ${isExpanded ? 'shadow-lg' : 'shadow-md hover:shadow-lg'}
        `}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 animate-gradient-x" />
          {[...Array(3)].map((_, i) => (
            <HeartIcon
              key={i}
              className="absolute text-pink-500 animate-float-slow"
              style={{
                right: `${i * 25}%`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon with pulse effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20" />
                <HeartIcon className="w-8 h-8 text-pink-500 relative z-10 animate-pulse" />
              </div>
              
              {/* Text content */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {history.length === 0 ? (
                    <>
                      Generate Your First Love Song
                      <span className="animate-bounce">✨</span>
                    </>
                  ) : (
                    <>
                      Create Another Love Song
                      <span className="animate-pulse">💝</span>
                    </>
                  )}
                </h2>
                {history.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {history.length === MAX_SONGS_PER_USER 
                      ? "Maximum songs limit reached" 
                      : `${history.length} of ${MAX_SONGS_PER_USER} songs created`}
                  </p>
                )}
              </div>
            </div>

            {/* Right side with chevron and message */}
            <div className="flex items-center gap-3">
              {history.length > 0 && !isExpanded && (
                <div className="hidden md:flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full">
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Create more songs</span>
                </div>
              )}
              <div 
                className={`
                  w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center
                  transition-transform duration-300
                  ${isExpanded ? 'rotate-0' : 'rotate-180'}
                `}
              >
                <ChevronUpIcon className="w-5 h-5 text-pink-500" />
              </div>
            </div>
          </div>

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500" />
        </div>
      </div>

      {/* Accordion Content */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'max-h-[5000px] opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        style={{
          transitionProperty: 'max-height, opacity',
          transitionDuration: isExpanded ? '500ms' : '300ms'
        }}
      >
        <div className="p-4 md:p-6">
          {/* Step 1: Music Style */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-pink-500" />
              Step 1: Music Style
            </h2>

            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6 border border-pink-100 shadow-lg relative overflow-hidden">
              {/* Decorative floating hearts */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-float-slow"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      opacity: 0.1
                    }}
                  >
                    <HeartIcon className="w-6 h-6 text-pink-500" />
                  </div>
                ))}
              </div>

              {/* Voice Type - 2 columns */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span>Voice Type</span>
                  <span className="text-xs text-gray-500">(Choose the singer's voice)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <StyleOption
                    label="Female Voice"
                    value="female"
                    selected={selectedOptions.voiceType === 'female'}
                    icon="👩"
                    onChange={(value) => handleSelectChange('voiceType', value)}
                    colorScheme="pink"
                  />
                  <StyleOption
                    label="Male Voice"
                    value="male"
                    selected={selectedOptions.voiceType === 'male'}
                    icon="👨"
                    onChange={(value) => handleSelectChange('voiceType', value)}
                    colorScheme="blue"
                  />
                </div>
              </div>

              {/* Genre - 2 columns on mobile, 3 on desktop */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span>Genre</span>
                  <span className="text-xs text-gray-500">(Select music style)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {GENRE_OPTIONS.map((option) => (
                    <StyleOption
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      selected={selectedOptions.genre === option.value}
                      icon={getGenreIcon(option.value)}
                      onChange={(value) => handleSelectChange('genre', value)}
                      colorScheme={selectedOptions.voiceType === 'male' ? 'blue' : 'pink'}
                    />
                  ))}
                </div>
              </div>

              {/* Mood - 2 columns on mobile, 3 on desktop */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span>Mood</span>
                  <span className="text-xs text-gray-500">(How should it feel?)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOOD_OPTIONS.map((option) => (
                    <StyleOption
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      selected={selectedOptions.mood === option.value}
                      icon={getMoodIcon(option.value)}
                      onChange={(value) => handleSelectChange('mood', value)}
                      colorScheme={selectedOptions.voiceType === 'male' ? 'blue' : 'pink'}
                    />
                  ))}
                </div>
              </div>

              {/* Era - 2 columns on mobile, 3 on desktop */}
              <div className="mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span>Era</span>
                  <span className="text-xs text-gray-500">(Choose time period)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ERA_OPTIONS.map((option) => (
                    <StyleOption
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      selected={selectedOptions.era === option.value}
                      icon={getEraIcon(option.value)}
                      onChange={(value) => handleSelectChange('era', value)}
                      colorScheme={selectedOptions.voiceType === 'male' ? 'blue' : 'pink'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Lyrics (Optional) */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-pink-500" />
              Step 2: Write Your Lyrics
            </h2>

            {/* Main Lyrics Input */}
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6 border border-pink-100 shadow-lg space-y-6">
              {/* AI Assistant Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-white shadow-md">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">AI Lyrics Assistant</h3>
                    <p className="text-sm text-gray-600">Let AI help write your love song</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLyricsInput}
                    onChange={(e) => {
                      setShowLyricsInput(e.target.checked);
                      if (!e.target.checked) {
                        setLyricsIdea('');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-red-500"></div>
                </label>
              </div>

              {/* AI Generation Section */}
              {showLyricsInput && (
                <div className="space-y-4">
                  {/* Style Pills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Your Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROMPT_TYPES.map(type => {
                        const isSelected = promptType === type.value;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setPromptType(type.value as typeof promptType)}
                            className={`relative overflow-hidden group p-3 rounded-xl transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg scale-[1.02]'
                                : 'bg-white hover:bg-pink-50 text-gray-600 hover:text-pink-500 border border-pink-100'
                            }`}
                          >
                            <div className="relative z-10">
                              <span className="block text-lg mb-1">
                                {type.value === 'romantic' ? '💝' : 
                                 type.value === 'friendship' ? '🤝' : 
                                 type.value === 'nature' ? '🌸' : '✨'}
                              </span>
                              <span className="text-sm font-medium">{type.label}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-red-500/20 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lyrics Idea Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Song
                      <span className="text-xs text-gray-500 ml-2">
                        ({MIN_LYRICS_CHARS}-{MAX_LYRICS_CHARS} characters)
                      </span>
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full p-4 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent min-h-[120px] shadow-sm bg-white/80 backdrop-blur-sm"
                        placeholder="What's your love story? Describe the feelings, moments, or memories you want to capture in your song..."
                        value={lyricsIdea}
                        onChange={(e) => handleLyricsChange(e.target.value)}
                        maxLength={MAX_LYRICS_CHARS}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">{lyricsIdea.length}/{MAX_LYRICS_CHARS}</span>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateLyrics}
                    disabled={isGeneratingLyrics || lyricsIdea.length < MIN_LYRICS_CHARS}
                    className={`w-full relative overflow-hidden p-4 rounded-xl text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      isGeneratingLyrics || lyricsIdea.length < MIN_LYRICS_CHARS
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 hover:scale-[1.02]'
                    }`}
                  >
                    {isGeneratingLyrics ? (
                      <>
                        <LoadingWave />
                        <span>Creating Your Lyrics...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate with AI
                      </>
                    )}
                    {!isGeneratingLyrics && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-red-500/20 animate-pulse" />
                    )}
                  </button>
                </div>
              )}

              {/* Final Lyrics Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Song Lyrics
                  {showLyricsInput && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Feel free to edit the generated lyrics)
                    </span>
                  )}
                </label>
                
                {/* Lyrics Guidelines */}
                <div className="mb-4 p-4 bg-pink-50/50 backdrop-blur-sm rounded-xl relative overflow-hidden
                  before:absolute before:inset-0 before:border before:border-gradient-to-r before:from-pink-200 before:via-red-200 before:to-pink-200 before:rounded-xl before:animate-gradient-x">
                  <div className="relative z-10">
                    <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-pink-400" />
                      Important Guidelines
                    </h4>
                    <ul className="space-y-2.5 text-sm text-gray-500">
                      <li className="flex items-start gap-2.5">
                        <span className="text-pink-400 mt-0.5">•</span>
                        <span>Do not include copyrighted lyrics or content from existing songs</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-pink-400 mt-0.5">•</span>
                        <span>Avoid explicit, offensive, or inappropriate content</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-pink-400 mt-0.5">•</span>
                        <span>Keep the lyrics personal and original to create a unique song</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-pink-400 mt-0.5">•</span>
                        <span>Focus on expressing genuine emotions and feelings</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full p-4 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent min-h-[200px] shadow-sm bg-white/80 backdrop-blur-sm"
                    placeholder={showLyricsInput 
                      ? "Your AI-generated lyrics will appear here. You can edit them before creating your song..."
                      : "Write your song lyrics here..."}
                    value={prompt}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_LYRICS_CHARS) {
                        handlePromptChange(e.target.value);
                      }
                    }}
                    maxLength={MAX_LYRICS_CHARS}
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs text-gray-500">{prompt.length}/{MAX_LYRICS_CHARS}</span>
                  </div>
                  {/* Floating hearts decoration */}
                  <div className="absolute -right-2 -top-2 text-pink-500/20 text-2xl">💝</div>
                  <div className="absolute -left-2 -bottom-2 text-red-500/20 text-2xl">💝</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Generate Button */}
          <div className="mb-6">

            <div className="flex gap-2">
              <button
                onClick={generateMusic}
                disabled={isGenerating || history.length >= MAX_SONGS_PER_USER}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white 
                  flex items-center justify-center gap-2 transition-all
                  ${isGenerating || history.length >= MAX_SONGS_PER_USER 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <LoadingWave />
                    Generating...
                  </>
                ) : history.length >= MAX_SONGS_PER_USER ? (
                  <>
                    <span>Song Limit Reached ({MAX_SONGS_PER_USER}/{MAX_SONGS_PER_USER})</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Create Valentine's Song
                  </>
                )}
              </button>
              
              <button
                onClick={handlePreviewClick}
                className="hidden px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preview Request/Response"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongGenerationFunction;