import { create } from 'zustand';

type PlayerState = {
  currentSong: {
    url: string;
    title: string;
  } | null;
  isPlaying: boolean;
  setCurrentSong: (song: { url: string; title: string } | null) => void;
  setIsPlaying: (playing: boolean) => void;
};

export const usePlayerStore = create<PlayerState>()((set) => ({
  currentSong: null,
  isPlaying: false,
  setCurrentSong: (song) => {
    // console.log('Setting current song:', song); // Debug log
    set({ currentSong: song });
  },
  setIsPlaying: (playing) => {
    // console.log('Setting isPlaying:', playing); // Debug log
    set({ isPlaying: playing });
  },
})); 