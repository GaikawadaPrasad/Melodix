import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../lib/db';

const REPEAT_MODES = ['none', 'one', 'all'];

export const useMusicStore = create((set, get) => ({
  // ─── Library ────────────────────────────────────────────────────────
  songs: [],
  playlists: [],
  isLibraryLoaded: false,

  loadLibrary: async () => {
    const [songs, playlists] = await Promise.all([
      db.getAllSongs(),
      db.getAllPlaylists(),
    ]);
    set({ songs, playlists, isLibraryLoaded: true });
  },

  // ─── Import Songs ────────────────────────────────────────────────────
  importSongs: async (files) => {
    const newSongs = [];
    for (const file of files) {
      const id = uuidv4();
      const arrayBuffer = await file.arrayBuffer();
      const song = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        size: file.size,
        type: file.type,
        data: arrayBuffer,
        coverArt: null,
        addedAt: Date.now(),
        source: 'import',
      };

      // Try extracting duration via AudioContext
      try {
        const blobUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: file.type }));
        const audio = new Audio(blobUrl);
        await new Promise((res) => {
          audio.addEventListener('loadedmetadata', () => {
            song.duration = audio.duration;
            URL.revokeObjectURL(blobUrl);
            res();
          });
          audio.addEventListener('error', res);
        });
      } catch (_) {}

      await db.addSong(song);
      newSongs.push(song);
    }
    set((s) => ({ songs: [...s.songs, ...newSongs] }));
    return newSongs;
  },

  // ─── Delete Song ─────────────────────────────────────────────────────
  deleteSong: async (songId) => {
    await db.deleteSong(songId);
    // Also remove from playlists
    const playlists = get().playlists.map((pl) => ({
      ...pl,
      songIds: pl.songIds.filter((id) => id !== songId),
    }));
    for (const pl of playlists) await db.updatePlaylist(pl);

    const { currentSong, queue } = get();
    set((s) => ({
      songs: s.songs.filter((s) => s.id !== songId),
      playlists,
      queue: queue.filter((id) => id !== songId),
      currentSong: currentSong?.id === songId ? null : currentSong,
    }));
  },

  updateSongMeta: async (songId, meta) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    const updated = { ...song, ...meta };
    await db.updateSong(updated);
    set((s) => ({ songs: s.songs.map((x) => (x.id === songId ? updated : x)) }));
  },

  // ─── Playlists ────────────────────────────────────────────────────────
  createPlaylist: async (name, coverColor) => {
    const playlist = {
      id: uuidv4(),
      name,
      coverColor: coverColor || '#6366f1',
      songIds: [],
      createdAt: Date.now(),
    };
    await db.addPlaylist(playlist);
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    return playlist;
  },

  // Import a playlist from a .json file exported by SharePlaylistModal.
  // Creates the playlist with the same name/color but empty songIds
  // (audio files must be re-imported separately).
  importPlaylistFromJson: async (json) => {
    if (!json?._melodix || json.version !== 1) throw new Error('Invalid Melodix playlist file');
    const { name, coverColor, tracks } = json.playlist;
    const playlist = {
      id: uuidv4(),
      name: name || 'Imported Playlist',
      coverColor: coverColor || '#6366f1',
      songIds: [],
      createdAt: Date.now(),
      importedTracks: tracks || [], // metadata only — for reference
    };
    await db.addPlaylist(playlist);
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    return playlist;
  },


  deletePlaylist: async (playlistId) => {
    await db.deletePlaylist(playlistId);
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== playlistId) }));
  },

  renamePlaylist: async (playlistId, name) => {
    const pl = get().playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updated = { ...pl, name };
    await db.updatePlaylist(updated);
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === playlistId ? updated : p)),
    }));
  },

  addSongToPlaylist: async (playlistId, songId) => {
    const pl = get().playlists.find((p) => p.id === playlistId);
    if (!pl || pl.songIds.includes(songId)) return;
    const updated = { ...pl, songIds: [...pl.songIds, songId] };
    await db.updatePlaylist(updated);
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === playlistId ? updated : p)),
    }));
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    const pl = get().playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updated = { ...pl, songIds: pl.songIds.filter((id) => id !== songId) };
    await db.updatePlaylist(updated);
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === playlistId ? updated : p)),
    }));
  },

  reorderPlaylistSongs: async (playlistId, songIds) => {
    const pl = get().playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updated = { ...pl, songIds };
    await db.updatePlaylist(updated);
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === playlistId ? updated : p)),
    }));
  },

  // ─── Player State ─────────────────────────────────────────────────────
  currentSong: null,
  queue: [],           // array of song IDs
  queueIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'none',  // 'none' | 'one' | 'all'
  isShuffle: false,
  progress: 0,
  duration: 0,
  currentView: 'home', // 'home' | 'library' | 'playlist' | 'search'
  activePlaylistId: null,

  setView: (view, playlistId = null) =>
    set({ currentView: view, activePlaylistId: playlistId }),

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setProgress: (v) => set({ progress: v }),
  setDuration: (v) => set({ duration: v }),
  setVolume: (v) => set({ volume: v }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

  cycleRepeat: () =>
    set((s) => ({
      repeatMode: REPEAT_MODES[(REPEAT_MODES.indexOf(s.repeatMode) + 1) % REPEAT_MODES.length],
    })),

  // Play a song from a specific queue context
  playSong: (song, songList = null) => {
    const list = songList || get().songs;
    const ids = list.map((s) => s.id);
    const idx = ids.indexOf(song.id);
    set({
      currentSong: song,
      queue: ids,
      queueIndex: idx,
      isPlaying: true,
    });
  },

  playNext: () => {
    const { queue, queueIndex, repeatMode, isShuffle, songs } = get();
    if (!queue.length) return;

    let nextIndex;
    if (repeatMode === 'one') {
      nextIndex = queueIndex;
    } else if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else { set({ isPlaying: false }); return; }
      }
    }

    const song = songs.find((s) => s.id === queue[nextIndex]);
    if (song) set({ currentSong: song, queueIndex: nextIndex, isPlaying: true });
  },

  playPrev: () => {
    const { queue, queueIndex, songs } = get();
    if (!queue.length) return;
    const prevIndex = Math.max(0, queueIndex - 1);
    const song = songs.find((s) => s.id === queue[prevIndex]);
    if (song) set({ currentSong: song, queueIndex: prevIndex, isPlaying: true });
  },

  // ─── Search ───────────────────────────────────────────────────────────
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
