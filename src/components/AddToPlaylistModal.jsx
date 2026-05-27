import { useMusicStore } from '../store/musicStore';
import { useToast } from './Toast';
import { X, ListMusic } from 'lucide-react';
import { PLAYLIST_COLORS } from '../lib/utils';

export default function AddToPlaylistModal({ song, onClose }) {
  const { playlists, addSongToPlaylist, createPlaylist } = useMusicStore();
  const toast = useToast();

  const handleAdd = async (playlistId) => {
    await addSongToPlaylist(playlistId, song.id);
    const pl = playlists.find((p) => p.id === playlistId);
    toast(`Added to "${pl?.name}"`, 'success');
    onClose();
  };

  const handleNewPlaylist = async () => {
    const name = prompt('New playlist name:');
    if (!name?.trim()) return;
    const pl = await createPlaylist(name.trim(), PLAYLIST_COLORS[0]);
    await addSongToPlaylist(pl.id, song.id);
    toast(`Added to "${pl.name}"`, 'success');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add to Playlist</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Song: <strong style={{ color: 'var(--text-primary)' }}>{song.title}</strong>
        </p>

        {playlists.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>No playlists yet. Create one below.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto', marginBottom: 14 }}>
            {playlists.map((pl) => {
              const alreadyIn = pl.songIds.includes(song.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => !alreadyIn && handleAdd(pl.id)}
                  disabled={alreadyIn}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-deep)',
                    cursor: alreadyIn ? 'not-allowed' : 'pointer',
                    opacity: alreadyIn ? 0.5 : 1,
                    transition: 'all 0.15s',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: 13,
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: pl.coverColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ListMusic size={13} color="#fff" />
                  </div>
                  <span style={{ flex: 1, textAlign: 'left', fontWeight: 500 }}>{pl.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {alreadyIn ? '✓ Added' : `${pl.songIds.length} songs`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleNewPlaylist}>
          + New Playlist
        </button>
      </div>
    </div>
  );
}
