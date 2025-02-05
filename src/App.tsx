import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MusicGenerator from './components/MusicGenerator';
import { SongPlayerPage } from './components/SongPlayerPage';
import { ModelTestPage } from './components/ModelTestPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { ErrorLoggerProvider } from './components/ErrorLoggerProvider';
import './App.css';

function App() {
  return (
    <ErrorLoggerProvider>
      <GlobalErrorHandler />
      <Toaster position="top-center" />
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={
              <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
                <div className="container mx-auto">
                  <MusicGenerator />
                </div>
              </div>
            } />
            <Route path="/play/:songId" element={<SongPlayerPage />} />
            <Route path="/model-test" element={<ModelTestPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </ErrorLoggerProvider>
  );
}

export default App;
