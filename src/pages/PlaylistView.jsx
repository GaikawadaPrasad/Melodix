import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import SongRow from '../components/SongRow';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SharePlaylistModal from '../components/SharePlaylistModal';
import { useToast } from '../components/Toast';
import { Trash2, Play, ListMusic, Plus, Share2, Shuffle } from 'lucide-react';
import ImportZone from '../components/ImportZone';
import { formatTime } from '../lib/utils';

export default function PlaylistView() {
  const { playlists, songs, activePlaylistId, deletePlaylist, renamePlaylist, playSong, setView, toggleShuffle, isShuffle } = useMusicStore();
  const toast = useToast();
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const playlist = playlists.find((p) => p.id === activePlaylistId);
  if (!playlist) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon"><ListMusic /></div>
          <h3>Playlist not found</h3>
        </div>
      </div>
    );
  }

  const playlistSongs = playlist.songIds.map((id) => songs.find((s) => s.id === id)).filter(Boolean);
  const totalDuration = playlistSongs.reduce((s, x) => s + (x.duration || 0), 0);

  const handlePlayAll = () => {
    if (!playlistSongs.length) return;
    playSong(playlistSongs[0], playlistSongs);
  };

  const handleShuffle = () => {
    if (!playlistSongs.length) return;
    const idx = Math.floor(Math.random() * playlistSongs.length);
    playSong(playlistSongs[idx], playlistSongs);
    if (!isShuffle) toggleShuffle();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete playlist "${playlist.name}"?`)) return;
    await deletePlaylist(playlist.id);
    toast('Playlist deleted', 'info');
    setView('home');
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    await renamePlaylist(playlist.id, newName.trim());
    toast('Playlist renamed', 'success');
    setEditing(false);
  };

  const handleImported = (imported) => {
    toast(`${imported.length} song(s) added to library!`, 'success');
    setShowImport(false);
  };

  return (
    <div className="page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 28, alignItems: 'center' }}>
        {/* Cover */}
        <div
          style={{
            width: 130, height: 130, borderRadius: 18,
            background: `linear-gradient(135deg, ${playlist.coverColor}, ${playlist.coverColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 20px 50px ${playlist.coverColor}55`,
          }}
        >
          <ListMusic size={52} color="#fff" />
        </div>

        {/* Meta + buttons */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 4 }}>
            Playlist
          </p>

          {editing ? (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="form-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                style={{ fontSize: 20, fontWeight: 700 }}
              />
              <button className="btn btn-primary" onClick={handleRename}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <h2
              style={{ fontSize: 30, fontWeight: 800, cursor: 'pointer', marginBottom: 4, lineHeight: 1.2 }}
              onClick={() => { setNewName(playlist.name); setEditing(true); }}
              title="Click to rename"
            >
              {playlist.name}
            </h2>
          )}

          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {playlistSongs.length} song{playlistSongs.length !== 1 ? 's' : ''}
            {totalDuration > 0 && ` · ${formatTime(totalDuration)}`}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handlePlayAll} disabled={!playlistSongs.length}>
              <Play size={15} fill="#fff" /> Play All
            </button>
            <button className="btn btn-ghost" onClick={handleShuffle} disabled={!playlistSongs.length}>
              <Shuffle size={15} /> Shuffle
            </button>
            <button className="btn btn-ghost" onClick={() => setShowImport((v) => !v)}>
              <Plus size={15} /> Add Songs
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowShare(true)}
              style={{ borderColor: 'rgba(99,102,241,0.4)', color: 'var(--accent)' }}
            >
              <Share2 size={15} /> Share
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* ── Import toggle ───────────────────────────────────────────────────── */}
      {showImport && (
        <div className="mb-6">
          <ImportZone onImported={handleImported} />
        </div>
      )}

      {/* ── Song list ───────────────────────────────────────────────────────── */}
      {playlistSongs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <h3>No songs yet</h3>
          <p>Go to Library and add songs using the + button, or import new songs above</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 48px 1fr auto auto auto',
            gap: 12, padding: '4px 12px 8px',
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.7px',
            borderBottom: '1px solid var(--border)', marginBottom: 4,
          }}>
            <span style={{ textAlign: 'center' }}>#</span>
            <span />
            <span>Title</span>
            <span>Duration</span>
            <span />
            <span />
          </div>
          <div className="song-list">
            {playlistSongs.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                songList={playlistSongs}
                showPlaylist
                playlistId={playlist.id}
                onAddToPlaylist={setAddToPlaylistSong}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {addToPlaylistSong && (
        <AddToPlaylistModal
          song={addToPlaylistSong}
          onClose={() => setAddToPlaylistSong(null)}
        />
      )}

      {showShare && (
        <SharePlaylistModal
          playlistId={playlist.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
