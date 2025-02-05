import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const API_KEY = import.meta.env.VITE_SUNO_API_KEY;
const CACHE_KEY = 'model_test_results';

interface TestResult {
  id: number;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: Date;
  taskId?: string;
  songUrl?: string;
  errorDetails?: string;
  startTime: number;
  duration?: string;
}

interface CachedResult {
  id: number;
  status: string;
  message: string;
  timestamp: string;
  taskId?: string;
  errorDetails?: string;
  songUrl?: string;
  startTime: number;
  duration?: string;
}

const isValidStatus = (status: string): status is TestResult['status'] => {
  return ['success', 'error', 'pending'].includes(status);
};

const formatDuration = (startTime: number): string => {
  const duration = Math.floor((Date.now() - startTime) / 1000); // duration in seconds
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ModelTestPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [numRequests, setNumRequests] = useState(10);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorSummary, setErrorSummary] = useState<Record<string, number>>({});

  // Load cached results on mount
  useEffect(() => {
    const cachedResults = localStorage.getItem(CACHE_KEY);
    if (cachedResults) {
      try {
        const parsed = JSON.parse(cachedResults) as CachedResult[];
        // Convert string timestamps back to Date objects and validate status
        const resultsWithDates = parsed.map(result => ({
          id: result.id,
          status: isValidStatus(result.status) ? result.status : 'error',
          message: result.message,
          timestamp: new Date(result.timestamp),
          taskId: result.taskId,
          errorDetails: result.errorDetails,
          songUrl: result.songUrl,
          startTime: result.startTime || Date.now(),
          duration: result.duration
        }));
        setResults(resultsWithDates);

        // Start checking status for pending tasks immediately after loading from cache
        const pendingTasks = resultsWithDates.filter(r => r.status === 'pending' && r.taskId);
        if (pendingTasks.length > 0) {
          updateTaskStatus();
        }
      } catch (error) {
        console.error('Failed to parse cached results:', error);
      }
    }
  }, []);

  // Save results to cache whenever they change
  useEffect(() => {
    if (results.length > 0) {
      const dataToCache = results.map(result => ({
        ...result,
        timestamp: result.timestamp.toISOString() // Convert Date to string for storage
      }));
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
    }
  }, [results]);

  // Update error summary whenever results change
  useEffect(() => {
    const summary: Record<string, number> = {};
    results.forEach(result => {
      if (result.status === 'error' && result.errorDetails) {
        summary[result.errorDetails] = (summary[result.errorDetails] || 0) + 1;
      }
    });
    setErrorSummary(summary);
  }, [results]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'password123') {
      setIsAuthenticated(true);
      toast.success('Authentication successful');
    } else {
      toast.error('Invalid password');
    }
  };

  const checkTaskStatus = async (taskId: string) => {
    try {
      console.log('Checking status for task:', taskId); // Debug log
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-API-Key': API_KEY,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error checking task status:', data); // Debug log
        return null;
      }
      
      console.log('Task status response:', data); // Debug log
      return {
        status: data.status,
        songUrl: data.output?.audio_url,
        error: data.error
      };
    } catch (error) {
      console.error('Failed to check task status:', error);
      return null;
    }
  };

  const updateTaskStatus = async () => {
    console.log('Updating task statuses...'); // Debug log
    const pendingResults = results.filter(r => r.status === 'pending' && r.taskId);
    
    if (pendingResults.length === 0) return;

    console.log('Pending tasks:', pendingResults.length); // Debug log

    const updatedResults = await Promise.all(
      results.map(async (result) => {
        if (result.status !== 'pending' || !result.taskId) return result;

        const statusData = await checkTaskStatus(result.taskId);
        if (!statusData) return result;

        const { status, songUrl, error } = statusData;
        console.log(`Task ${result.taskId} status:`, status); // Debug log

        if (status === 'completed' && songUrl) {
          return {
            ...result,
            status: 'success' as const,
            message: `Request ${result.id} completed successfully - Task ID: ${result.taskId}`,
            songUrl,
            duration: formatDuration(result.startTime)
          };
        } else if (status === 'failed' || error) {
          return {
            ...result,
            status: 'error' as const,
            message: `Request ${result.id} failed - Task ID: ${result.taskId}`,
            errorDetails: error || 'Unknown error',
            duration: formatDuration(result.startTime)
          };
        }

        return {
          ...result,
          message: `Request ${result.id} is ${status} - Task ID: ${result.taskId}`,
          duration: formatDuration(result.startTime)
        };
      })
    );

    // Only update if there are actual changes
    const hasChanges = JSON.stringify(updatedResults) !== JSON.stringify(results);
    if (hasChanges) {
      console.log('Updating results with changes'); // Debug log
      setResults(updatedResults as TestResult[]);
    }
  };

  // Check pending tasks status every 3 seconds instead of 10
  useEffect(() => {
    const interval = setInterval(updateTaskStatus, 3000);
    return () => clearInterval(interval);
  }, [results]);

  const sendRequest = async (id: number) => {
    if (!API_KEY) {
      return {
        id,
        status: 'error' as const,
        message: `Request ${id} failed: API key is missing`,
        timestamp: new Date(),
        startTime: Date.now(),
      };
    }

    try {
      const response = await fetch('https://api.piapi.ai/api/v1/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          model: 'music-u',
          task_type: 'generate_music',
          input: {
            prompt: lyrics,
            lyrics_type: 'user',
            gpt_description_prompt: 'male vocal, male singer, male voice',
            tags: 'male_vocals,male_voice,male_singer',
            negative_tags: 'female_vocals,female_voice,female_singer',
            make_instrumental: false,
            seed: Math.floor(Math.random() * 1000000) // Random seed for variety
          },
          config: {
            service_mode: 'public',
            webhook_config: {
              endpoint: '',
              secret: ''
            }
          }
        }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      // Ensure we have a task ID
      if (!data.task_id && !data.id) {
        throw new Error('No task ID received from API');
      }

      const taskId = data.task_id || data.id; // Some API responses use 'id' instead of 'task_id'

      const result: TestResult = {
        id,
        status: 'pending',
        message: `Request ${id} submitted - Task ID: ${taskId}`,
        timestamp: new Date(),
        taskId: taskId,
        startTime: Date.now()
      };

      // Update cache immediately for this new request
      const currentResults = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      const updatedResults = [...currentResults, { ...result, timestamp: result.timestamp.toISOString() }];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedResults));

      // Start checking status immediately for this task
      setTimeout(() => {
        updateTaskStatus();
      }, 1000);

      return result;
    } catch (error) {
      const errorResult: TestResult = {
        id,
        status: 'error',
        message: `Request ${id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        startTime: Date.now(),
      };

      // Update cache for the error case as well
      const currentResults = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      const updatedResults = [...currentResults, { ...errorResult, timestamp: errorResult.timestamp.toISOString() }];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedResults));

      return errorResult;
    }
  };

  const handleTest = async () => {
    if (!lyrics.trim()) {
      toast.error('Please enter lyrics');
      return;
    }

    setIsLoading(true);
    
    // Don't clear existing results, append to them instead
    const existingResults = [...results];
    const startId = existingResults.length > 0 ? Math.max(...existingResults.map(r => r.id)) + 1 : 1;
    
    const requests = Array.from({ length: numRequests }, (_, i) => sendRequest(startId + i));
    
    try {
      const newResults = await Promise.all(requests);
      const combinedResults = [...existingResults, ...newResults];
      setResults(combinedResults);
      
      const pendingCount = newResults.filter(r => r.status === 'pending').length;
      toast.success(`Test started: ${pendingCount} requests submitted`);
    } catch {
      toast.error('Test failed to start');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setResults([]);
    toast.success('Cache cleared successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Model Test Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Overall Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-green-600">Successful</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {results.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Model Load Testing</h1>
          <button
            onClick={clearCache}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear Cache
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sample Lyrics</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              placeholder="Enter sample lyrics for testing..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Concurrent Requests</label>
            <input
              type="number"
              value={numRequests}
              onChange={(e) => setNumRequests(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              min="1"
              max="1000"
            />
          </div>
          
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Running Test...' : 'Start Test'}
          </button>
        </div>

        {results.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
                <div className="flex gap-2">
                  <span className="text-green-600">Success: {results.filter(r => r.status === 'success').length}</span>
                  <span className="text-yellow-600">Pending: {results.filter(r => r.status === 'pending').length}</span>
                  <span className="text-red-600">Error: {results.filter(r => r.status === 'error').length}</span>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-md ${
                      result.status === 'success' ? 'bg-green-50 text-green-700' :
                      result.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}
                  >
                    <div className="font-medium">{result.message}</div>
                    <div className="text-sm mt-1 flex justify-between items-center">
                      <div>
                        <span>({new Date(result.timestamp).toLocaleTimeString()})</span>
                        {result.duration && (
                          <span className="ml-2">Duration: {result.duration}</span>
                        )}
                      </div>
                      {result.songUrl && (
                        <a
                          href={result.songUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 underline"
                        >
                          Download Song
                        </a>
                      )}
                    </div>
                    {result.errorDetails && (
                      <div className="text-sm mt-1 text-red-600">
                        Error: {result.errorDetails}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(errorSummary).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Error Summary</h2>
                <div className="space-y-2">
                  {Object.entries(errorSummary).map(([error, count]) => (
                    <div key={error} className="flex justify-between items-center p-2 bg-red-50 rounded-md">
                      <span className="text-red-700">{error}</span>
                      <span className="text-red-600 font-medium">{count} occurrences</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 