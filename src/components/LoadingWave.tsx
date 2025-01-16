interface LoadingWaveProps {
  className?: string;
}

export function LoadingWave({ className = '' }: LoadingWaveProps) {
  return (
    <div className={`flex justify-center gap-0.5 md:gap-1 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
} 