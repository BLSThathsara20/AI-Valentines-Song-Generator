export function playSuccessSound() {
  const audio = new Audio('/success-chime.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Error playing success sound:', err));
} 