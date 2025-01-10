import { LoadingWave } from './LoadingWave';

interface ProcessingStatusProps {
  processingCount: number;
}

export function ProcessingStatus({ processingCount }: ProcessingStatusProps) {
  if (processingCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 z-50 animate-slide-down">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3">
        <LoadingWave />
        <span className="text-sm font-medium">
          Creating {processingCount} {processingCount === 1 ? 'song' : 'songs'}...
        </span>
      </div>
    </div>
  );
} 