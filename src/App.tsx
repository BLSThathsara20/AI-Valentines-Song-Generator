import MusicGenerator from './components/MusicGenerator'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalErrorHandler } from './components/GlobalErrorHandler'
import { ErrorLoggerProvider } from './components/ErrorLoggerProvider'
import './App.css'

function App() {
  return (
    <ErrorLoggerProvider>
      <GlobalErrorHandler />
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
          <div className="container mx-auto">
            <MusicGenerator />
          </div>
        </div>
      </ErrorBoundary>
    </ErrorLoggerProvider>
  )
}

export default App
