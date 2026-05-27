import { openDB } from 'idb';

const DB_NAME = 'MusicPlayerDB';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Songs store
        if (!db.objectStoreNames.contains('songs')) {
          const songStore = db.createObjectStore('songs', { keyPath: 'id' });
          songStore.createIndex('title', 'title');
          songStore.createIndex('artist', 'artist');
          songStore.createIndex('addedAt', 'addedAt');
        }
        // Playlists store
        if (!db.objectStoreNames.contains('playlists')) {
          const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
          playlistStore.createIndex('name', 'name');
          playlistStore.createIndex('createdAt', 'createdAt');
        }
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Songs ───────────────────────────────────────────────────────────────────

export async function addSong(song) {
  const db = await getDB();
  await db.put('songs', song);
  return song;
}

export async function getAllSongs() {
  const db = await getDB();
  return db.getAll('songs');
}

export async function getSong(id) {
  const db = await getDB();
  return db.get('songs', id);
}

export async function deleteSong(id) {
  const db = await getDB();
  await db.delete('songs', id);
}

export async function updateSong(song) {
  const db = await getDB();
  await db.put('songs', song);
}

// ─── Playlists ────────────────────────────────────────────────────────────────

export async function addPlaylist(playlist) {
  const db = await getDB();
  await db.put('playlists', playlist);
  return playlist;
}

export async function getAllPlaylists() {
  const db = await getDB();
  return db.getAll('playlists');
}

export async function getPlaylist(id) {
  const db = await getDB();
  return db.get('playlists', id);
}

export async function updatePlaylist(playlist) {
  const db = await getDB();
  await db.put('playlists', playlist);
}

export async function deletePlaylist(id) {
  const db = await getDB();
  await db.delete('playlists', id);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key) {
  const db = await getDB();
  const record = await db.get('settings', key);
  return record ? record.value : null;
}

export async function setSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}
