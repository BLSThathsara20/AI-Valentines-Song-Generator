import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { TaskResponse, GenerationHistoryItem, Song } from '../types/api';
import { LoadingWave } from './';
import { generateValentineLyrics } from '../services/openai';
import { HeartIcon, SparklesIcon, EnvelopeIcon, ShareIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { getErrorMessage } from '../utils/errorHandling';
import { logError } from './ErrorLoggerProvider';
import { InfoModal } from './InfoModal';
import { ValentineCaptcha } from './ValentineCaptcha';
import { profanityFilter } from '../services/profanityFilter';
import { CustomMusicPlayer } from './CustomMusicPlayer';
import { ShareButton } from './ShareButton';
import { ProcessingStatus } from './ProcessingStatus';
import { StickyPlayer } from './StickyPlayer';
import { playSuccessSound } from '../utils/audio';
import { ShareSongEmail } from './ShareSongEmail';
import { ErrorDetailsModal } from './ErrorDetailsModal';
import { SongStatusEmailModal } from './SongStatusEmailModal';
import emailjs from '@emailjs/browser';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { GenerationLoadingModal } from './GenerationLoadingModal';
import { SongStatusNotifier } from './SongStatusNotifier';
import { sendSMS } from '../services/smsService';
import { SMSShareModal } from './SMSShareModal';
import SongGenerationFunction from './SongGenerationFunction';
import { FacebookShareModal } from './FacebookShareModal';
import WelcomeBanner from '../assets/images/welcome-banner.png';

const API_KEY = import.meta.env.VITE_SUNO_API_KEY;
const HISTORY_KEY = 'music_generation_history';
const EMAIL_STORAGE_KEY = 'valentine_notification_email';
const TASKS_STORAGE_KEY = 'valentine_tasks_status';
const PHONE_STORAGE_KEY = 'valentine_phone_number';

// Add max songs per user from environment variable
const MAX_SONGS_PER_USER = import.meta.env.VITE_MAX_SONGS_PER_USER ? parseInt(import.meta.env.VITE_MAX_SONGS_PER_USER) : 2;

console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');

if (!API_KEY) {
  console.error('API key is missing. Please check your .env file');
}

const APP_ENABLED = import.meta.env.VITE_APP_ENABLED === 'true';
const MAINTENANCE_MESSAGE = import.meta.env.VITE_MAINTENANCE_MESSAGE || "System is temporarily unavailable";

const GENRE_OPTIONS = [
  { value: 'pop', label: 'Pop' },
  { value: 'r&b', label: 'R&B' },
  { value: 'hip-hop', label: 'Hip Hop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' }
];

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy' },
  { value: 'sad', label: 'Sad' },
  { value: 'romantic', label: 'Romantic' },
];

const ERA_OPTIONS = [
  { value: '1990s', label: '90s' },
  { value: '2000s', label: '2000s' },
  { value: '2010s', label: '2010s' },
  { value: 'modern', label: 'Modern' }
];

const PROMPT_TYPES = [
  { value: 'romantic', label: 'Romantic Love' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'nature', label: 'Nature & Beauty' },
  { value: 'inspiration', label: 'Inspirational' }
];

const MIN_LYRICS_CHARS = 25;
const MAX_LYRICS_CHARS = 900;
const MAX_HISTORY_ITEMS = MAX_SONGS_PER_USER;
const MAX_SONGS_LIMIT = MAX_SONGS_PER_USER;

// Move type definition outside (this is fine)
type PreviewData = {
  isOpen: boolean;
  request?: any;
  response?: any;
};

// Move PreviewModal component outside MusicGenerator (this is fine)
function PreviewModal({ 
  isOpen, 
  onClose, 
  request, 
  response 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  request?: any; 
  response?: any; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Request/Response Preview</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Request Data:</h4>
            <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(request, null, 2)}
            </pre>
          </div>
          {response && (
            <div>
              <h4 className="font-medium mb-2">Response Data:</h4>
              <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// First, add a NotificationComponent if you don't have one already
function NotificationComponent({ notification, onClose }: { 
  notification: { type: 'success' | 'error' | 'warning'; message: string; duration?: number } | null;
  onClose: () => void;
}) {
  if (!notification) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  }[notification.type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
        <span>{notification.message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Add this component for displaying generation time
function GenerationTime({ startTime, endTime }: { startTime: number; endTime?: number }) {
  if (!startTime || !endTime) return null;

  const duration = endTime - startTime;
  const minutes = Math.floor(duration / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return (
    <span className="text-xs text-gray-500 flex items-center gap-1">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
      Generated in {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
  );
}

// First, let's create a helper type for the history item
type HistoryItemInput = {
  id: string;
  prompt: string;
  status: string;
  timestamp: number;
  completedAt?: number;
  songs?: Song[];
  error?: string;
  tags?: string;
};

// First, add these new components for better style selection
const StyleOption = ({ 
  label, 
  value, 
  selected, 
  icon, 
  onChange,
  colorScheme = 'pink'
}: { 
  label: string;
  value: string;
  selected: boolean;
  icon: React.ReactNode;
  onChange: (value: string) => void;
  colorScheme?: 'pink' | 'blue';
}) => {
  const colors = {
    pink: {
      selected: 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg scale-105',
      hover: 'hover:bg-pink-50 hover:text-pink-500',
      icon: 'text-pink-500',
      border: 'border-pink-200 hover:border-pink-500',
      glow: 'after:bg-pink-500/20'
    },
    blue: {
      selected: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105',
      hover: 'hover:bg-blue-50 hover:text-blue-500',
      icon: 'text-blue-500',
      border: 'border-blue-200 hover:border-blue-500',
      glow: 'after:bg-blue-500/20'
    }
  }[colorScheme];

  return (
    <button
      onClick={() => onChange(value)}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        border backdrop-blur-sm
        ${selected 
          ? `${colors.selected} animate-pulse-subtle`
          : `bg-white/80 ${colors.hover} text-gray-600 ${colors.border}`
        }
        group hover:scale-[1.02] active:scale-[0.98]
        before:absolute before:inset-0 before:rounded-xl before:transition-opacity
        after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity
        hover:after:opacity-10
      `}
    >
      <span 
        className={`
          text-2xl relative z-10 transition-transform duration-300 group-hover:scale-110
          ${selected ? 'text-white' : colors.icon}
        `}
      >
        {icon}
      </span>
      <span className="text-sm font-medium relative z-10">{label}</span>
      
      {/* Add floating hearts for selected items */}
      {selected && (
        <div className="absolute -right-1 -top-1 text-white/30 text-lg animate-float-slow">💝</div>
      )}
    </button>
  );
};

// Add this component for the maintenance message
function MaintenanceMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-red-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="text-6xl mb-4">💝</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          System Maintenance
        </h1>
        <p className="text-gray-600 mb-6">
          {MAINTENANCE_MESSAGE}
        </p>
        <div className="animate-pulse text-pink-500">
          <HeartIcon className="w-8 h-8 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Update the BASE_URL constant to handle both development and production
const BASE_URL = window.location.hostname === 'localhost' 
  ? '/' 
  : '/lyrics-to-song/';

// Add this type
type TaskStatus = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  notificationSent?: boolean;
};

// Add this helper function to manage task status updates
const updateTaskStatus = (taskId: string, updates: Partial<TaskStatus>) => {
  const savedTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '[]');
  const updatedTasks = savedTasks.map((task: TaskStatus) => 
    task.id === taskId 
      ? { ...task, ...updates }
      : task
  );
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
  setTaskStatuses(updatedTasks);
  console.log('Updated task status:', { taskId, updates, currentTasks: updatedTasks });
};

// Update the history item type to include notification status
type GenerationHistoryItem = {
  id: string;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  notificationSent?: boolean;
  completedAt?: number;
  error?: string;
  songs?: any[];
};

// Add this function to handle manual notification sending
const sendCompletionNotification = async (songId: string) => {
  const song = history.find(item => item.id === songId);
  const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
  
  if (!song || !storedEmail) return;

  try {
    console.log('Manually sending completion notification for song:', {
      songId,
      email: storedEmail,
      title: song.songs?.[0]?.title
    });

    const emailData = {
      to_email: storedEmail,
      user_name: "Music Lover",
      message: "Here's your Valentine's song!",
      title: song.title || 'Your Valentine Song',
      status: 'completed',
      url: song.url || ''
    };

    const emailResult = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
      emailData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (emailResult.status === 200) {
      // Update history to mark notification as sent
      const updatedHistory = history.map(item => 
        item.id === songId 
          ? { ...item, notificationSent: true }
          : item
      );
      updateHistory(updatedHistory);
      
      setNotification({
        type: 'success',
        message: 'Notification email sent successfully! 📧',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    setNotification({
      type: 'error',
      message: 'Failed to send notification email. Please try again.',
      duration: 3000
    });
  }
};

// Add this new function to monitor and send notifications
const checkAndSendNotifications = async () => {
  // Get current history from localStorage
  const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);

  if (!storedEmail) return;

  // Find completed songs that haven't been notified
  const pendingNotifications = currentHistory.filter((item: GenerationHistoryItem) => 
    item.status === 'completed' && 
    item.songs?.length > 0 && 
    !item.notificationSent
  );

  // Send notifications for each pending item
  for (const item of pendingNotifications) {
    try {
      console.log('Sending notification for song:', item.id);
      
      const emailData = {
        to_email: storedEmail
      };

      const emailResult = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
        emailData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      if (emailResult.status === 200) {
        // Update history to mark notification as sent
        const updatedHistory = currentHistory.map((historyItem: GenerationHistoryItem) => 
          historyItem.id === item.id 
            ? { ...historyItem, notificationSent: true }
            : historyItem
        );

        // Save to localStorage and update state
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        setHistory(updatedHistory);

        console.log('✅ Notification sent for song:', item.id);
        
        setNotification({
          type: 'success',
          message: 'Song notification sent! 📧',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to send notification for song:', item.id, error);
    }
  }
};

// Add FloatingHearts component at the top level
const FloatingHearts = ({ show = false }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${20 + Math.random() * 15}s`,
            opacity: Math.random() * 0.06 + 0.02 // Random opacity between 0.02 and 0.08
          }}
        >
          <div className={`transform rotate-${Math.floor(Math.random() * 360)} text-pink-${Math.random() > 0.5 ? '400' : '500'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              aria-hidden="true" 
              className="w-6 h-6"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add BackgroundHearts component at the top level
const BackgroundHearts = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 30}s`,
            animationDuration: `${30 + Math.random() * 20}s`,
            opacity: Math.random() * 0.03 + 0.01 // Very subtle opacity between 0.01 and 0.04
          }}
        >
          <div 
            className={`transform rotate-${Math.floor(Math.random() * 360)} transition-opacity duration-1000`}
            style={{
              color: Math.random() > 0.5 ? 'rgb(255, 105, 180)' : 'rgb(255, 140, 105)', // valentine-pink or valentine-orange
              opacity: Math.random() * 0.5 + 0.3 // Color opacity between 0.3 and 0.8
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              aria-hidden="true" 
              className="w-8 h-8 transition-opacity duration-1000"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add this helper function to get the correct song URL
const getSongUrl = (path: string) => {
  if (path.startsWith('http')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${window.location.origin}${BASE_URL}${cleanPath}`;
};

// Add this type for notification details
interface NotificationDetails {
  email: string;
  phone: string;
}

export default function MusicGenerator() {
  const [previewData, setPreviewData] = useState<PreviewData>({ isOpen: false });
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    duration?: number;
  } | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState({
    genre: '',
    voiceType: '',
    mood: '',
    era: ''
  });
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [lyricsIdea, setLyricsIdea] = useState('');
  const [promptType, setPromptType] = useState<'romantic' | 'friendship' | 'nature' | 'inspiration'>('romantic');
  const [showLyricsInput, setShowLyricsInput] = useState(false);
  const completedTasksRef = useRef<Set<string>>(new Set());
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(true);
  const [hasFilteredContent, setHasFilteredContent] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [processingTasks, setProcessingTasks] = useState<Set<string>>(new Set());
  const [currentSong, setCurrentSong] = useState<{url: string; title: string} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEmailShare, setShowEmailShare] = useState(false);
  const [shareableSong, setShareableSong] = useState<{title: string; url: string} | null>(null);
  const [errorModalDetails, setErrorModalDetails] = useState<{
    isOpen: boolean;
    details: any;
  }>({
    isOpen: false,
    details: null
  });
  const [currentSongDetails, setCurrentSongDetails] = useState<{
    prompt: string;
    status: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWhatsAppShare, setShowWhatsAppShare] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showSMSShare, setShowSMSShare] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{ title: string; url: string } | null>(null);
  // Add state to manage expanded state
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [notificationDetails, setNotificationDetails] = useState<NotificationDetails | null>(null);
  const [showFacebookShare, setShowFacebookShare] = useState(false);

  // Add this computed value
  const hasReachedLimit = history.length >= MAX_SONGS_LIMIT;

  // Add this effect at the top of your component, right after the state declarations
  useEffect(() => {
    // Load initial history from localStorage
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Ensure the history items have the correct status type
        const validHistory = parsedHistory.map((item: any) => ({
          ...item,
          status: (item.status === 'completed' || item.status === 'failed') 
            ? item.status 
            : 'pending'
        }));
        setHistory(validHistory);
      } catch (error) {
        console.error('Error loading history:', error);
        // If there's an error, clear the corrupted history
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Add this effect right after the state declarations
  useEffect(() => {
    // Check for pending tasks in history on page load
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const hasPendingTasks = parsedHistory.some((item: GenerationHistoryItem) => 
          item.status === 'pending'
        );

        // If there are pending tasks, show the loading modal
        if (hasPendingTasks) {
          setIsGenerating(true);
          // Add any pending tasks to the processingTasks set
          const pendingTaskIds = parsedHistory
            .filter((item: GenerationHistoryItem) => item.status === 'pending')
            .map((item: GenerationHistoryItem) => item.id);
          setProcessingTasks(new Set(pendingTaskIds));
        }
      } catch (error) {
        console.error('Error checking pending tasks:', error);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch task details
  const fetchTaskDetails = async (taskId: string) => {
    if (!taskId) return null;
    
    try {
      const response = await axios.get<TaskResponse>(
        `https://api.piapi.ai/api/v1/task/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'X-API-Key': API_KEY,
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error(`Error fetching task ${taskId}:`, err);
      return null;
    }
  };

  // Update the updateHistory function
  const updateHistory = (newHistory: HistoryItemInput[]) => {
    const validHistory = newHistory.map(item => ({
      ...item,
      id: item.id || '',
      prompt: item.prompt || '',
      // Ensure status is one of the valid values
      status: (['pending', 'completed', 'failed'].includes(item.status) 
        ? item.status 
        : 'pending') as 'pending' | 'completed' | 'failed',
      timestamp: item.timestamp || Date.now()
    }));
    setHistory(validHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory));
  };

  // Update the history update effect
  useEffect(() => {
    const updateHistoryWithCompletedTasks = async () => {
      const pendingItems = history.filter(item => item.status === 'pending');
      
      if (pendingItems.length === 0) {
        setProcessingTasks(new Set()); // Clear processing tasks when none are pending
        return;
      }

      let hasUpdates = false;
      const newProcessingTasks = new Set(processingTasks);

      const updatedHistory = await Promise.all(
        history.map(async (item) => {
          if (item.status === 'pending') {
            try {
            const taskDetails = await fetchTaskDetails(item.id);
              if (!taskDetails) return item;

              const status = taskDetails.data.status;
              const songs = taskDetails.data.output?.songs;

              if (status === 'completed' || status === 'failed') {
                hasUpdates = true;
                newProcessingTasks.delete(item.id); // Remove from processing tasks
                
                if (status === 'completed' && !completedTasksRef.current.has(item.id)) {
                  playSuccessBeep();
                  completedTasksRef.current.add(item.id);
                  
                  // Show completion notification
                  setNotification({
                    type: 'success',
                    message: '💝 Your love song has been created!',
                    duration: 5000
                  });
                }

              return {
                ...item,
                  status: status,
                  songs: status === 'completed' ? songs : undefined,
                  error: status === 'failed' ? taskDetails.data.error?.message : undefined,
                  completedAt: Date.now()
              };
              } else {
                newProcessingTasks.add(item.id); // Add to processing tasks
              }
            } catch (error) {
              console.error(`Error checking task ${item.id}:`, error);
            }
          }
          return item;
        })
      );

      setProcessingTasks(newProcessingTasks);
      if (hasUpdates) {
        updateHistory(updatedHistory);
      }
    };

    const intervalId = setInterval(updateHistoryWithCompletedTasks, 5000);
    updateHistoryWithCompletedTasks();

    return () => clearInterval(intervalId);
  }, [history]);

  // Update the addToHistory function
  const addToHistory = (item: HistoryItemInput) => {
    const newItem: GenerationHistoryItem = {
      ...item,
      status: 'pending' as const, // Force the correct type
      completedAt: undefined
    };
    
    const newHistory = [newItem, ...history];
    updateHistory(newHistory);
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    updateHistory(newHistory);
  };

  const clearHistory = () => {
    updateHistory([]);
    completedTasksRef.current.clear();
  };

  // Add a new audio context for system beep
  const audioContext = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return null;
  }, []);

  // Add function to play success beep
  const playSuccessBeep = () => {
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  // Update the SongDisplay component
  const SongDisplay = useMemo(() => {
    return ({ song }: { song: Song }) => {
      if (!song.finished) return null;

      const songUrl = getSongUrl(song.song_path);
      const isCurrentlyPlaying = currentSong?.url === songUrl && isPlaying;

      return (
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-md border border-pink-100 overflow-hidden">
            <CustomMusicPlayer 
              src={songUrl} 
              title={song.title}
              tags={song.tags.slice(0, 3)}
              onPlay={(songData) => {
                if (!currentSong || currentSong.url !== songUrl) {
                  setCurrentSong(songData);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              isGlobalPlaying={isCurrentlyPlaying}
              isCurrentSong={currentSong?.url === songUrl}
            />
            <div className="px-4 pb-3 flex justify-end gap-2 border-t border-pink-50 pt-2">
              <button
                onClick={async () => {
                  try {
                    const link = document.createElement('a');
                    link.href = songUrl;
                    // Format the song title for the download
                    const formattedTitle = song.title 
                      ? `honor-valentine-song-${song.title.toLowerCase().replace(/\s+/g, '-')}` 
                      : 'honor-valentine-song';
                    link.download = `${formattedTitle}.mp3`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (error) {
                    console.error('Download failed:', error);
                    setNotification({
                      type: 'error',
                      message: 'Failed to download song. Please try again.',
                      duration: 3000
                    });
                  }
                }}
                className="p-2 text-gray-600 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
                title="Download Song"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShareableSong({
                    title: song.title,
                    url: songUrl
                  });
                  setShowEmailShare(true);
                }}
                className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
                title="Share via Email"
              >
                <EnvelopeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShareableSong({
                    title: song.title,
                    url: songUrl
                  });
                  setShowWhatsAppShare(true);
                }}
                className="p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                title="Share via WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              <button
                onClick={() => sendManualSMS(song)}
                className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Share via SMS"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShareableSong({
                    title: song.title,
                    url: songUrl
                  });
                  setShowFacebookShare(true);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    };
  }, [currentSong?.url, isPlaying, setCurrentSong, setIsPlaying, setShareableSong, setShowEmailShare, setShowWhatsAppShare, setShowFacebookShare]);

  // Add new state for tracking tasks
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Save task statuses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(taskStatuses));
  }, [taskStatuses]);

  // Update generateMusic to save initial task status
  const generateMusic = async () => {
    if (hasReachedLimit) {
      setNotification({
        type: 'warning',
        message: 'You have reached the maximum limit of 5 songs. Please delete some songs to generate more.'
      });
      return;
    }

    if (!prompt.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter lyrics before generating a song'
      });
      return;
    }

    if (!API_KEY) {
      setNotification({
        type: 'error',
        message: 'API key is missing. Please check your configuration.',
        duration: 5000
      });
      return;
    }

    if (!APP_ENABLED) {
      setNotification({
        type: 'error',
        message: MAINTENANCE_MESSAGE,
        duration: 5000
      });
      return;
    }

    // Check if we've reached the song limit
    if (history.length >= MAX_SONGS_LIMIT) {
      setNotification({
        type: 'warning',
        message: 'Maximum song limit reached. Please delete some songs to generate more.',
        duration: 5000
      });
      return;
    }

    // Set generating state to true at the start
    setIsGenerating(true);

    try {
    // Get voice type and build tags/negative tags
    const isFemaleSinger = selectedOptions.voiceType === 'female';
    const voiceTags = isFemaleSinger 
      ? 'female_vocals,female_voice,female_singer'
      : 'male_vocals,male_voice,male_singer';
    const negativeTags = isFemaleSinger 
      ? 'male_vocals,male_voice,male_singer'
      : 'female_vocals,female_voice,female_singer';

      // Append "Song by Honor" to the prompt
      const finalPrompt = `${prompt.trim()}\n\nSong by Honor`;

    const requestData = {
      model: 'music-u',
      task_type: 'generate_music',
      input: {
        gpt_description_prompt: `${selectedOptions.voiceType}, ${selectedOptions.genre}, ${selectedOptions.mood}, ${selectedOptions.era}`,
        lyrics_type: 'user',
        make_instrumental: false,
        negative_tags: negativeTags,
          prompt: finalPrompt,
        seed: Math.floor(Math.random() * 1000000),
        tags: voiceTags
      }
    };

      const startTime = Date.now();

      const response = await axios.post('https://api.piapi.ai/api/v1/task', requestData, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const newTaskId = response.data.data.task_id;
      setTaskId(newTaskId);
      
      // Add to processing tasks first
      setProcessingTasks(prev => new Set(prev).add(newTaskId));
      
      // Add to history immediately
      const historyItem = {
        id: newTaskId,
        prompt: prompt,
        status: 'pending',
        timestamp: startTime,
        notificationSent: false
      };

      const newHistory = [historyItem, ...history];
      updateHistory(newHistory);

      setNotification({
        type: 'success',
        message: 'Music generation started! This may take a few minutes...',
        duration: 5000
      });

      // Initialize new task in storage
      const savedTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '[]');
      const newTask = {
        id: newTaskId,
        status: 'pending',
        notificationSent: false,
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...savedTasks, newTask];
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));

    } catch (error) {
      setProcessingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId || '');
        return newSet;
      });
      
      const errorMessage = getErrorMessage(error);
      setNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });

      logError(`Music Generation Error: ${error}`);
      setIsGenerating(false);
    }
    // Remove the finally block since we'll handle isGenerating in checkTaskStatus
  };

  const generateLyrics = async () => {
    if (!APP_ENABLED) {
      setNotification({
        type: 'error',
        message: MAINTENANCE_MESSAGE,
        duration: 5000
      });
      return;
    }

    const { wasFiltered } = profanityFilter.cleanText(lyricsIdea);
    if (wasFiltered) {
      setNotification({
        type: 'error',
        message: 'Please remove inappropriate content before generating lyrics.',
        duration: 5000
      });
      return;
    }

    if (!lyricsIdea.trim() || lyricsIdea.length < MIN_LYRICS_CHARS) {
      setNotification({
        type: 'error',
        message: `Please enter at least ${MIN_LYRICS_CHARS} characters for your lyrics idea`
      });
      return;
    }

    setIsGeneratingLyrics(true);
    try {
      const lyrics = await generateValentineLyrics(lyricsIdea, promptType);
      setPrompt(lyrics);
      setNotification({
        type: 'success',
        message: 'Lyrics generated! You can edit them before creating the song.'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate lyrics'
      });
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // Add notification effect
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Update the handleSelectChange function
  const handleSelectChange = (field: string, value: string) => {
    try {
      setSelectedOptions(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    setNotification({
      type: 'error',
        message: 'Failed to update selection. Please try again.'
    });
    }
  };

  // Add a preview button click handler
  const handlePreviewClick = () => {
    // Get voice type and build tags/negative tags
    const isFemaleSinger = selectedOptions.voiceType === 'female';
    const voiceTags = isFemaleSinger 
      ? 'female_vocals,female_voice,female_singer'
      : 'male_vocals,male_voice,male_singer';
    const negativeTags = isFemaleSinger 
      ? 'male_vocals,male_voice,male_singer'
      : 'female_vocals,female_voice,female_singer';

    // Build description parts
    const descriptionParts = [];
    
    // Add voice type as primary description
    if (selectedOptions.voiceType === 'female') {
      descriptionParts.push('female vocal', 'female singer', 'female voice');
    } else {
      descriptionParts.push('male vocal', 'male singer', 'male voice');
    }

    // Add other musical elements
    if (selectedOptions.genre) descriptionParts.push(selectedOptions.genre.toLowerCase());
    if (selectedOptions.mood) descriptionParts.push(selectedOptions.mood.toLowerCase());
    if (selectedOptions.era) descriptionParts.push(selectedOptions.era.toLowerCase());

    const requestData = {
      model: "music-u",
      task_type: "generate_music",
      input: {
        prompt: `[Verse]\n${prompt.trim()}\n\nSong by Honor`,
        lyrics_type: "user",
        gpt_description_prompt: descriptionParts.join(', '),
        tags: voiceTags,
        negative_tags: negativeTags,
        make_instrumental: false,
        seed: Math.floor(Math.random() * 1000000)
      },
      config: {
        service_mode: "public",
        webhook_config: {
          endpoint: "",
          secret: ""
        }
      }
    };

    setPreviewData({
      isOpen: true,
      request: requestData
    });
  };

  // Add these helper functions for icons
  const getGenreIcon = (genre: string) => {
    const icons: { [key: string]: string } = {
      'pop': '🎵',
      'rock': '🎸',
      'r&b': '🎹',
      'hip-hop': '🎧',
      'jazz': '🎷',
      'classical': '🎼',
      'electronic': '🎛️'
    };
    return icons[genre] || '🎵';
  };

  const getMoodIcon = (mood: string) => {
    const icons: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'energetic': '⚡',
      'calm': '😌',
      'romantic': '💝',
      'melancholic': '🌙'
    };
    return icons[mood] || '💫';
  };

  const getEraIcon = (era: string) => {
    const icons: { [key: string]: string } = {
      '1970s': '🕰️',
      '1980s': '🎸',
      '1990s': '',
      '2000s': '📀',
      '2010s': '🎧',
      'modern': '✨'
    };
    return icons[era] || '📅';
  };

  // Update the lyrics idea change handler
  const handleLyricsChange = (text: string) => {
    if (text.length <= MAX_LYRICS_CHARS) {
      const { cleaned, wasFiltered } = profanityFilter.cleanText(text);
      setLyricsIdea(cleaned);
      
      if (wasFiltered && !hasFilteredContent) {
        setHasFilteredContent(true);
        setNotification({
          type: 'warning',
          message: 'Please keep the content family-friendly. Inappropriate words have been removed.',
          duration: 5000
        });
      }
    }
  };

  // Update the prompt change handler
  const handlePromptChange = (text: string) => {
    const { cleaned, wasFiltered } = profanityFilter.cleanText(text);
    setPrompt(cleaned);
    
    if (wasFiltered && !hasFilteredContent) {
      setHasFilteredContent(true);
      setNotification({
        type: 'warning',
        message: 'Please keep the content family-friendly. Inappropriate words have been removed.',
        duration: 5000
      });
    }
  };

  // Add updateHistoryItem function
  const updateHistoryItem = (id: string, updates: Partial<GenerationHistoryItem>) => {
    setHistory(prevHistory => {
      return prevHistory.map(item => {
        if (item.id === id) {
          // Ensure we preserve the songs array when updating
          return {
            ...item,
            ...updates,
            songs: updates.songs || item.songs // Keep existing songs if not being updated
          };
        }
        return item;
      });
    });
  };

  // Update the audio management effect
  useEffect(() => {
    const handleAudioStateChange = (e: CustomEvent<{ isPlaying: boolean; url: string }>) => {
      const { isPlaying: newIsPlaying, url } = e.detail;
      
      // If the event is for the current song, update its playing state
      if (url === currentSong?.url) {
        setIsPlaying(newIsPlaying);
      }
      // If a different song is playing, ensure this one is marked as not playing
      else if (newIsPlaying) {
        setIsPlaying(false);
      }
    };

    window.addEventListener('audioStateChange', handleAudioStateChange as EventListener);
    return () => {
      window.removeEventListener('audioStateChange', handleAudioStateChange as EventListener);
    };
  }, [currentSong, setIsPlaying]);

  // Update the completion handler
  const handleSongCompletion = (song: any) => {
    playSuccessSound();
    setCurrentSong({
      url: song.url,
      title: song.title || 'Valentine\'s Song'
    });
    setIsPlaying(true);
  };

  // Update the checkTaskStatus function
  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await fetchTaskDetails(taskId);
      const status = response?.data?.status;
      const songs = response?.data?.output?.songs;

      if (status === 'completed' && songs?.length > 0) {
        const newProcessingTasks = new Set(processingTasks);
        newProcessingTasks.delete(taskId);
        setProcessingTasks(newProcessingTasks);

        // Only set isGenerating to false when all tasks are complete
        if (newProcessingTasks.size === 0) {
          setIsGenerating(false);
        }

        const updatedHistory = history.map(item => 
          item.id === taskId 
            ? { 
                ...item, 
                status: 'completed',
                completedAt: Date.now(),
                songs: songs,
                notificationSent: false
              }
            : item
        );
        
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        setHistory(updatedHistory);

        // Send only email notification if we have contact details
        if (notificationDetails) {
          try {
            const songTitle = songs[0]?.title || 'Love Song';
            const songUrl = getSongUrl(songs[0]?.song_path || '');

            await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
              {
                to_email: notificationDetails.email,
                user_name: "Music Lover",
                message: "Your Valentine's song is ready!",
                title: songTitle,
                status: 'completed',
                url: songUrl
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

          setNotification({
            type: 'success',
              message: 'Song completed! Check your email and phone for the link.',
              duration: 5000
          });

            playSuccessSound();
        } catch (error) {
            console.error('Failed to send email notification:', error);
          setNotification({
              type: 'warning',
              message: 'Song ready but email notification failed. Please check history.',
              duration: 5000
            });
          }
        }
      } else if (status === 'failed') {
        const newProcessingTasks = new Set(processingTasks);
        newProcessingTasks.delete(taskId);
        setProcessingTasks(newProcessingTasks);
          setIsGenerating(false);
        
        setNotification({
          type: 'error',
          message: 'Failed to generate song. Please try again.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error checking task status:', error);
      setNotification({
        type: 'error',
        message: 'Error checking task status',
        duration: 3000
      });
      setIsGenerating(false);
    }
  };

  // Update the polling effect to remove console logs
  useEffect(() => {
    if (processingTasks.size > 0) {
      const interval = setInterval(() => {
        processingTasks.forEach(taskId => {
          checkTaskStatus(taskId);
        });
      }, 5000); // Check every 5 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [processingTasks]);

  // Add this effect to handle page leave warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are any pending generations
      const hasPendingGenerations = history.some(item => item.status === 'pending');
      
      if (hasPendingGenerations) {
        // Show warning message
        const message = "You have pending song generations in progress. If you leave now, you'll still receive notifications when they're ready. Are you sure you want to leave?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [history]);

  // Update the playSuccessSound function to handle notification
  const playSuccessSound = async () => {
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);

      // Send email notification when success sound plays
      const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
      if (storedEmail && currentSongDetails) {
        try {
          console.log('Sending completion notification on success sound');
          const emailResult = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
            {
              to_email: storedEmail,
              user_name: "Music Lover",
              message: "Here's your Valentine's song!",
              title: currentSongDetails.title,
              status: 'completed',
              url: currentSongDetails.url
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );

          console.log('✅ Completion notification sent on success:', emailResult);

          // Update history to mark notification as sent
          const updatedHistory = history.map(item => 
            item.id === taskId 
              ? { ...item, notificationSent: true }
              : item
          );
          updateHistory(updatedHistory);
        } catch (error) {
          console.error('Failed to send completion notification:', error);
        }
      }
    }
  };

  // Add the notification checking useEffect inside the component
  useEffect(() => {
    const checkAndSendNotifications = async () => {
      // Get current history from localStorage
      const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);

      if (!storedEmail) return;

      // Find completed songs that haven't been notified
      const pendingNotifications = currentHistory.filter((item: GenerationHistoryItem) => 
        item.status === 'completed' && 
        item.songs?.length > 0 && 
        !item.notificationSent
      );

      // Send notifications for each pending item
      for (const item of pendingNotifications) {
        try {
          console.log('Sending notification for song:', item.id);
          
          const emailData = {
            to_email: storedEmail
          };

          const emailResult = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
            emailData,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );

          if (emailResult.status === 200) {
            // Update history to mark notification as sent
            const updatedHistory = currentHistory.map((historyItem: GenerationHistoryItem) => 
              historyItem.id === item.id 
                ? { ...historyItem, notificationSent: true }
                : historyItem
            );

            // Save to localStorage and update state
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
            setHistory(updatedHistory);

            console.log('✅ Notification sent for song:', item.id);
            
            setNotification({
              type: 'success',
              message: 'Song notification sent! 📧',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Failed to send notification for song:', item.id, error);
        }
      }
    };

    // Set up interval to check for notifications
    const interval = setInterval(() => {
      checkAndSendNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount

  // Update the retry logic
  const handleRetry = async (item: GenerationHistoryItem) => {
    try {
      // Update current item to pending status
      updateHistoryItem(item.id, { 
        status: 'pending',
        error: undefined,
        error_response: undefined,
        timestamp: Date.now()
      });

      // Remove from processing tasks if present
      setProcessingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });

      // Add to processing tasks
      setProcessingTasks(prev => new Set(prev).add(item.id));

      // Get voice type from tags or use default male
      const isFemaleSinger = item.tags?.includes('female_vocals') ?? false;
      const voiceTags = isFemaleSinger 
        ? 'female_vocals,female_voice,female_singer'
        : 'male_vocals,male_voice,male_singer';
      const negativeTags = isFemaleSinger 
        ? 'male_vocals,male_voice,male_singer'
        : 'female_vocals,female_voice,female_singer';

      // Call API with same parameters but correct voice tags
      const response = await axios.post(
        'https://api.piapi.ai/api/v1/task',
        {
          model: 'music-u',
          task_type: 'generate_music',
          input: {
            prompt: item.prompt,
            lyrics_type: 'user',
            make_instrumental: false,
            tags: voiceTags,
            negative_tags: negativeTags
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'X-API-Key': API_KEY,
            'Accept': 'application/json'
          }
        }
      );

      // ... rest of the retry logic ...
    } catch (error) {
      // ... error handling ...
    }
  };

  // Update the captcha success handler
  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    setShowHearts(true);
    setShowInfoModal(true); // Show info modal after captcha
    setTimeout(() => setShowHearts(false), 8000); // Hide hearts after 8 seconds
  };

  const sendManualSMS = (song: Song) => {
    setShareableSong({
      title: song.title,
      url: getSongUrl(song.song_path)
    });
    setShowSMSShare(true);
  };

  const handleSMSShare = (song: { title: string; url: string }) => {
    setSelectedSong(song);
    setShowSMSShare(true);
  };

  // Function to toggle expanded state
  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Add this function to handle notification details submission
  const handleNotificationDetailsSubmit = (details: NotificationDetails) => {
    setNotificationDetails(details);
    localStorage.setItem(EMAIL_STORAGE_KEY, details.email);
    localStorage.setItem(PHONE_STORAGE_KEY, details.phone);
  };

  // Add this effect to check and send notifications
  useEffect(() => {
    const checkAndSendNotifications = async () => {
      // Get current history from localStorage
      const currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      
      // Find completed songs that haven't been notified
      const pendingNotifications = currentHistory.filter((item) => 
        item.status === 'completed' && 
        item.songs?.length > 0 && 
        !item.notificationSent
      );

      // Send notifications for each pending item
      for (const item of pendingNotifications) {
        try {
          const storedPhone = localStorage.getItem(PHONE_STORAGE_KEY);
          if (!storedPhone) continue;

          console.log('Sending SMS notification for song:', item.id);
          
          // Send SMS notification
          await sendSMS(
            storedPhone,
            `Your Valentine's song is ready! Visit ${window.location.origin} to send it to your loved one. (Honor Valentine's gift)`
          );

          // Update history to mark notification as sent
          const updatedHistory = currentHistory.map((historyItem) => 
            historyItem.id === item.id 
              ? { ...historyItem, notificationSent: true }
              : historyItem
          );

          // Save to localStorage and update state
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
          setHistory(updatedHistory);

          console.log('✅ SMS notification sent for song:', item.id);
        } catch (error) {
          console.error('Failed to send SMS notification for song:', item.id, error);
        }
      }
    };

    // Set up interval to check for notifications
    const interval = setInterval(checkAndSendNotifications, 5000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <ProcessingStatus processingCount={processingTasks.size} />
      
      {!APP_ENABLED ? (
        <MaintenanceMessage />
      ) : (
        <>
          <BackgroundHearts />
          <FloatingHearts show={showHearts} />
          <ValentineCaptcha
            isOpen={showCaptcha}
            onSuccess={handleCaptchaSuccess}
          />
          
          {!showCaptcha && (
            <div className="min-h-screen py-4 px-2 md:py-8 md:px-4 relative">
              <NotificationComponent 
                notification={notification} 
                onClose={() => setNotification(null)} 
              />
              
              <div className="max-w-2xl mx-auto w-full">
                {/* Welcome Banner */}
                <div className="w-full mb-8 -mt-4">
                  <img 
                    src={WelcomeBanner} 
                    alt="Welcome Banner" 
                    className="w-full object-cover animate-fade-in rounded-xl"
                  />
                      </div>

                <SongGenerationFunction
                  selectedOptions={selectedOptions}
                  handleSelectChange={handleSelectChange}
                  showLyricsInput={showLyricsInput}
                  setShowLyricsInput={setShowLyricsInput}
                  lyricsIdea={lyricsIdea}
                  setLyricsIdea={setLyricsIdea}
                  promptType={promptType}
                  setPromptType={setPromptType}
                  isGeneratingLyrics={isGeneratingLyrics}
                  generateLyrics={generateLyrics}
                  prompt={prompt}
                  handlePromptChange={handlePromptChange}
                  isGenerating={isGenerating}
                  generateMusic={generateMusic}
                  history={history}
                  handlePreviewClick={handlePreviewClick}
                  MIN_LYRICS_CHARS={MIN_LYRICS_CHARS}
                  MAX_LYRICS_CHARS={MAX_LYRICS_CHARS}
                  MAX_SONGS_LIMIT={MAX_SONGS_LIMIT}
                  GENRE_OPTIONS={GENRE_OPTIONS}
                  MOOD_OPTIONS={MOOD_OPTIONS}
                  ERA_OPTIONS={ERA_OPTIONS}
                  PROMPT_TYPES={PROMPT_TYPES}
                  getGenreIcon={getGenreIcon}
                  getMoodIcon={getMoodIcon}
                  getEraIcon={getEraIcon}
                />
                

          {/* History Section */}
          {history.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <HeartIcon className="w-6 h-6 text-pink-500" />
                          Completed Songs
                        </h3>
                        <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm">
                          {history.length}/{MAX_HISTORY_ITEMS}
                    </span>
                  </div>
                      {history.length > 1 && (
                <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to clear all history?')) {
                              clearHistory();
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                      )}
              </div>
                    <div className="space-y-4">
                {history.map((item: HistoryItem, index) => (
                  <div
                    key={item.id}
                          className="relative bg-white rounded-xl shadow-md border border-pink-100 overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                        >
                          {/* Valentine's themed status bar */}
                          <div className={`absolute top-0 left-0 right-0 h-1 valentine-gradient heart-pattern ${
                            item.status === 'completed' 
                              ? 'bg-pink-500'
                              : item.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`} />
                          
                          {/* Song number badge */}
                          <div className="absolute -left-2 top-3">
                            <div className="relative">
                              <div className="absolute inset-0 transform rotate-45 bg-pink-500" />
                              <span className="relative z-10 px-3 py-1 text-white font-bold">
                                #{history.length - index}
                              </span>
                            </div>
                    </div>

                          <div className="p-4 pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 ml-8">
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    item.status === 'completed' 
                                      ? 'bg-pink-100 text-pink-800'
                                      : item.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {item.status === 'completed' ? '💝 Complete' : 
                                     item.status === 'failed' ? '❌ Failed' : 
                                     '✨ Creating Magic...'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.timestamp).toLocaleString()}
                                  </span>
                                  {item.status === 'completed' && item.timestamp && item.completedAt && (
                              <GenerationTime 
                                startTime={item.timestamp}
                                endTime={item.completedAt}
                              />
                            )}
                          </div>

                          {item.songs && item.songs.length > 0 && (
                            <div className="space-y-3 mt-3 py-4">
                              {item.songs.map((song) => (
                                <SongDisplay key={song.id} song={song} />
                              ))}
                            </div>
                          )}

                          {/* Update the prompt display */}
                          <div className="relative">
                            <p className={`text-sm text-gray-600 whitespace-pre-wrap transition-all duration-500 ease-in-out ${expandedItems.has(item.id) ? 'max-h-full' : 'max-h-12 overflow-hidden'}`}>
                              {item.prompt}
                            </p>
                            {!expandedItems.has(item.id) && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-6 pointer-events-none"></div>
                            )}
                            <button 
                              onClick={() => toggleExpanded(item.id)} 
                              className="text-pink-600 hover:text-pink-800 font-medium mt-2 transition-colors text-xs"
                            >
                              {expandedItems.has(item.id) ? 'Show Less' : 'Show More'}
                            </button>
                          </div>
                        </div>
                        
                        <button
                                onClick={() => removeFromHistory(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Remove from history"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    </div>







                    

                    {item.status === 'pending' && !item.songs?.length && (
                      <div className="mt-3 flex items-center justify-center p-4 bg-pink-50/50 rounded-lg border border-pink-100">
                        <LoadingWave />
                        <span className="ml-2 text-sm text-pink-600">
                        Your love song is being created...
                        </span>
                      </div>
                    )}

                    {item.status === 'failed' && item.error && (
                      <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-red-700">{item.error}</p>
                                    <button
                                      onClick={() => {
                                              // Debug logs
                                              console.log('Full item:', item);
                                              console.log('Error response:', item.error_response);
                                              
                                              // Get error details from the complete response
                                              const errorSong = item.error_response?.data?.output?.songs?.[0];
                                              const apiError = item.error_response?.data?.error;
                                              
                                              console.log('Error Song:', errorSong); // Debug log
                                              
                                              setErrorModalDetails({
                                                isOpen: true,
                                                details: {
                                                  error_type: errorSong?.error_type || 'Unknown Error',
                                                  error_code: errorSong?.error_code,
                                                  error_detail: errorSong?.error_detail,
                                                  message: item.error,
                                                  raw_message: JSON.stringify({
                                                    song_error: errorSong || null,
                                                    api_error: apiError || null
                                                  }, null, 2)
                                                }
                                              });
                                            }}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                                            title="View Error Details"
                                      >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </button>
                                  </div>
                                        <button
                                          onClick={async () => {
                                            try {
                                              // Update current item to pending status
                                              updateHistoryItem(item.id, { 
                                                status: 'pending',
                                                error: undefined,
                                                timestamp: Date.now()
                                              });

                                              // Remove from processing tasks if present
                                              setProcessingTasks(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(item.id);
                                                return newSet;
                                              });

                                              // Add to processing tasks
                                              setProcessingTasks(prev => new Set(prev).add(item.id));

                                              // Get voice type from tags or use default male
                                              const isFemaleSinger = item.tags?.includes('female_vocals') ?? false;
                                              const voiceTags = isFemaleSinger 
                                                ? 'female_vocals,female_voice,female_singer'
                                                : 'male_vocals,male_voice,male_singer';
                                              const negativeTags = isFemaleSinger 
                                                ? 'male_vocals,male_voice,male_singer'
                                                : 'female_vocals,female_voice,female_singer';

                                              // Call API with same parameters but correct voice tags
                                              const response = await axios.post(
                                                'https://api.piapi.ai/api/v1/task',
                                                {
                                                  model: 'music-u',
                                                  task_type: 'generate_music',
                                                  input: {
                                                    prompt: item.prompt,
                                                    lyrics_type: 'user',
                                                    make_instrumental: false,
                                                    tags: voiceTags,
                                                    negative_tags: negativeTags
                                                  }
                                                },
                                                {
                                                  headers: {
                                                    'Authorization': `Bearer ${API_KEY}`,
                                                    'X-API-Key': API_KEY,
                                                    'Accept': 'application/json'
                                                  }
                                                }
                                              );

                                              // Update task ID
                                              const taskId = response.data.task_id;
                                              updateHistoryItem(item.id, { taskId });

                                            } catch (error) {
                                              // If API call fails, update status back to failed
                                              updateHistoryItem(item.id, {
                                                status: 'failed',
                                                error: getErrorMessage(error),
                                                timestamp: Date.now()
                                              });
                                              setProcessingTasks(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(item.id);
                                                return newSet;
                                              });
                                            }
                                          }}
                                          className="ml-3 flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 
                                            text-red-700 rounded-lg transition-colors"
                                          title="Retry generation"
                                          >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                          </svg>
                                          <span className="text-sm font-medium">Retry</span>
                                        </button>
                                      </div>
                              {item.error.includes('credit') && (
                                <a 
                                  href="https://piapi.ai/account"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                          className="text-sm text-red-600 hover:text-red-800 underline mt-2 inline-block"
                                >
                                  Check Account Balance →
                                </a>
                                        )}
                              </div>
                            )}
                          </div>
                      </div>
                    ))}
              </div>
            </div>
          )}
        </div>
        
        <PreviewModal
          isOpen={previewData.isOpen}
          onClose={() => setPreviewData({ isOpen: false })}
          request={previewData.request}
          response={previewData.response}
        />
              <InfoModal 
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
              />
              <ErrorDetailsModal
                isOpen={errorModalDetails.isOpen}
                onClose={() => setErrorModalDetails({ isOpen: false, details: null })}
                errorDetails={errorModalDetails.details || {}}
        />
              <WhatsAppShareModal 
                isOpen={showWhatsAppShare}
                onClose={() => setShowWhatsAppShare(false)}
                songTitle={shareableSong?.title || ''}
                songUrl={shareableSong?.url || ''}
              />
              <SMSShareModal 
                isOpen={showSMSShare}
                onClose={() => setShowSMSShare(false)}
                songTitle={shareableSong?.title || ''}
                songUrl={shareableSong?.url || ''}
              />
              <GenerationLoadingModal 
                isOpen={processingTasks.size > 0} 
                onEmailSubmit={(email) => {
                  localStorage.setItem(EMAIL_STORAGE_KEY, email);
                  setNotification({
                    type: 'success',
                    message: 'Contact details saved! 📧',
                    duration: 3000
                  });
                }}
                defaultEmail={localStorage.getItem(EMAIL_STORAGE_KEY) || ''}
                isGenerating={isGenerating}
                onNotificationDetailsSubmit={handleNotificationDetailsSubmit}
              />
              <FacebookShareModal 
                isOpen={showFacebookShare}
                onClose={() => setShowFacebookShare(false)}
                songTitle={shareableSong?.title || ''}
                songUrl={shareableSong?.url || ''}
              />
      </div>
          )}
        </>
      )}
      
      <StickyPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
        onClose={() => setCurrentSong(null)}
      />
      {showEmailShare && shareableSong && (
        <ShareSongEmail
          songTitle={shareableSong.title}
          songUrl={shareableSong.url}
          onClose={() => setShowEmailShare(false)}
        />
      )}

      {/* Copyright Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-r from-pink-50/90 to-red-50/90 backdrop-blur-sm border-t border-pink-100 z-40">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <span>Made with</span>
            <HeartIcon className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>by</span>
            <a 
              href="https://www.enfection.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-pink-600 hover:text-pink-700 transition-colors"
            >
              Enfection
            </a>
            <span>© {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
      
      {/* Add SMS Share Modal */}
      {showSMSShare && selectedSong && (
        <SMSShareModal
          isOpen={showSMSShare}
          onClose={() => setShowSMSShare(false)}
          songTitle={selectedSong.title}
          songUrl={getSongUrl(selectedSong.url)}
        />
      )}
    </>
  );
} 