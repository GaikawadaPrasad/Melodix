import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleSongs } from '../data/sampleSongs';
import { evaluateSmartPlaylist } from '../utils/smartPlaylists';

const DEFAULT_PLAYLISTS = [
  { id: 'liked-songs', name: 'Liked Songs', description: 'Your favorite tracks', coverArt: null, trackIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isSmartPlaylist: true, smartRules: [{ field: 'liked', operator: 'eq', value: true }], icon: 'heart' },
  { id: 'recently-played', name: 'Recently Played', description: 'Tracks you listened to recently', coverArt: null, trackIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isSmartPlaylist: true, smartRules: [{ field: 'recentlyPlayed', operator: 'eq', value: true }], icon: 'clock' },
  { id: 'most-played', name: 'Most Played', description: 'Your top tracks by play count', coverArt: null, trackIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isSmartPlaylist: true, smartRules: [{ field: 'playCount', operator: 'gt', value: 0 }], icon: 'trending-up' },
];

export const usePlaylistStore = create(
  persist(
    (set, get) => ({
      library: sampleSongs,
      playlists: DEFAULT_PLAYLISTS,

      // Library ops
      toggleLike: (trackId) =>
        set((s) => ({ library: s.library.map((t) => (t.id === trackId ? { ...t, liked: !t.liked } : t)) })),
      incrementPlayCount: (trackId) =>
        set((s) => ({ library: s.library.map((t) => (t.id === trackId ? { ...t, playCount: t.playCount + 1 } : t)) })),

      // Upload songs from local files
      addSongsToLibrary: (songs) =>
        set((s) => ({
          library: [
            ...songs, // uploaded songs go to the top
            ...s.library.filter((t) => !songs.some((ns) => ns.id === t.id)),
          ],
        })),
      removeSongFromLibrary: (trackId) =>
        set((s) => ({ library: s.library.filter((t) => t.id !== trackId) })),

      getTrackById: (id) => get().library.find((t) => t.id === id),

      getPlaylistTracks: (playlistId, recentlyPlayed = []) => {
        const { library, playlists } = get();
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return [];
        if (playlist.isSmartPlaylist) return evaluateSmartPlaylist(playlist.smartRules, library, recentlyPlayed);
        return playlist.trackIds.map((id) => library.find((t) => t.id === id)).filter(Boolean);
      },

      getPlaylistCover: (playlistId) => {
        const { library, playlists } = get();
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return null;
        if (playlist.coverArt) return playlist.coverArt;
        const firstId = playlist.trackIds[0];
        if (firstId) return library.find((t) => t.id === firstId)?.coverArt || null;
        return null;
      },

      // Playlist CRUD
      createPlaylist: (name, description = '') => {
        const id = `playlist-${Date.now()}`;
        set((s) => ({
          playlists: [...s.playlists, { id, name, description, coverArt: null, trackIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isSmartPlaylist: false }],
        }));
        return id;
      },
      updatePlaylist: (id, updates) =>
        set((s) => ({ playlists: s.playlists.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)) })),
      deletePlaylist: (id) => set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),

      // Track management
      addTrackToPlaylist: (playlistId, trackId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.isSmartPlaylist && !p.trackIds.includes(trackId)
              ? { ...p, trackIds: [...p.trackIds, trackId], updatedAt: new Date().toISOString() }
              : p
          ),
        })),
      removeTrackFromPlaylist: (playlistId, trackId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId), updatedAt: new Date().toISOString() } : p
          ),
        })),
      reorderTracks: (playlistId, newTrackIds) =>
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === playlistId ? { ...p, trackIds: newTrackIds, updatedAt: new Date().toISOString() } : p)),
        })),
    }),
    { 
      name: 'melodix-playlists',
      // Don't persist uploaded songs (blob URLs die on refresh) — only persist static library + playlists
      partialize: (s) => ({
        library: s.library.filter((t) => !t.isUploaded),
        playlists: s.playlists,
      })
    }
  )
);
