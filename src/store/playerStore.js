import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      originalQueue: [],
      queueIndex: -1,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      shuffle: false,
      repeat: 'none', // 'none' | 'one' | 'all'
      crossfadeDuration: 3,
      recentlyPlayed: [], // track IDs, newest first

      setCurrentTrack: (track) => set({ currentTrack: track }),
      setProgress: (progress) => set({ progress }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      toggleShuffle: () => {
        const { shuffle, queue, queueIndex, originalQueue } = get();
        if (!shuffle) {
          const current = queue[queueIndex];
          const rest = queue.filter((_, i) => i !== queueIndex);
          const shuffled = [...rest].sort(() => Math.random() - 0.5);
          set({ shuffle: true, queue: [current, ...shuffled], queueIndex: 0 });
        } else {
          const current = queue[queueIndex];
          const newIdx = originalQueue.findIndex((t) => t.id === current?.id);
          set({ shuffle: false, queue: originalQueue, queueIndex: newIdx >= 0 ? newIdx : 0 });
        }
      },

      toggleRepeat: () =>
        set((s) => ({ repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none' })),

      playTrack: (track, queue = null) => {
        const q = queue || [track];
        const idx = q.findIndex((t) => t.id === track.id);
        set({ currentTrack: track, queue: q, originalQueue: q, queueIndex: idx >= 0 ? idx : 0, isPlaying: true, progress: 0, currentTime: 0 });
      },

      nextTrack: () => {
        const { queue, queueIndex, repeat } = get();
        if (repeat === 'one') return 'replay';
        let next = queueIndex + 1;
        if (next >= queue.length) {
          if (repeat === 'all') next = 0;
          else { set({ isPlaying: false }); return; }
        }
        set({ queueIndex: next, currentTrack: queue[next], progress: 0, currentTime: 0, isPlaying: true });
      },

      prevTrack: (currentAudioTime = 0) => {
        const { queue, queueIndex } = get();
        if (currentAudioTime > 3) { return 'restart'; }
        let prev = queueIndex - 1;
        if (prev < 0) prev = queue.length - 1;
        set({ queueIndex: prev, currentTrack: queue[prev], progress: 0, currentTime: 0, isPlaying: true });
      },

      addToRecentlyPlayed: (trackId) =>
        set((s) => ({ recentlyPlayed: [trackId, ...s.recentlyPlayed.filter((id) => id !== trackId)].slice(0, 50) })),

      addToQueue: (track) => set((s) => ({ queue: [...s.queue, track], originalQueue: [...s.originalQueue, track] })),
      removeFromQueue: (index) =>
        set((s) => ({
          queue: s.queue.filter((_, i) => i !== index),
          queueIndex: s.queueIndex > index ? s.queueIndex - 1 : s.queueIndex,
        })),
    }),
    {
      name: 'melodix-player',
      partialize: (s) => ({ volume: s.volume, isMuted: s.isMuted, shuffle: s.shuffle, repeat: s.repeat, recentlyPlayed: s.recentlyPlayed }),
    }
  )
);
