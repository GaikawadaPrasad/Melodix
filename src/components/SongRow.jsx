import { useState, useCallback } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Play, Trash2, MoreVertical, Plus } from 'lucide-react';
import { formatTime } from '../lib/utils';

function PlayingBars() {
  return (
    <div className="playing-bars">
      <span /><span /><span />
    </div>
  );
}

function CoverArt({ song, size = 40 }) {
  const initials = (song.title || '?')[0].toUpperCase();
  const hue = [...(song.title || 'A')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  if (song.coverArt) {
    return <img src={song.coverArt} alt={song.title} style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8 }} />;
  }
  return (
    <div
      className="song-art"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, hsl(${hue},60%,30%), hsl(${(hue + 60) % 360},60%,20%))`,
        fontSize: size * 0.3,
        color: `hsl(${hue},80%,80%)`,
        borderRadius: 8,
      }}
    >
      {initials}
    </div>
  );
}

export { CoverArt };

export default function SongRow({ song, index, songList, showPlaylist = false, playlistId, onAddToPlaylist }) {
  const { currentSong, isPlaying, playSong, deleteSong, removeSongFromPlaylist } = useMusicStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = currentSong?.id === song.id;

  const handlePlay = useCallback(() => {
    playSong(song, songList);
  }, [song, songList, playSong]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteSong(song.id);
    setMenuOpen(false);
  };

  const handleRemoveFromPlaylist = async (e) => {
    e.stopPropagation();
    await removeSongFromPlaylist(playlistId, song.id);
    setMenuOpen(false);
  };

  return (
    <div className={`song-row ${isActive ? 'playing' : ''}`} onClick={handlePlay}>
      <div className="song-idx">
        {isActive && isPlaying ? <PlayingBars /> : <span>{index + 1}</span>}
      </div>
      <CoverArt song={song} size={40} />
      <div className="song-info">
        <div className="song-title">{song.title}</div>
        <div className="song-artist">{song.artist}</div>
      </div>
      <div className="song-duration">{formatTime(song.duration)}</div>
      <div className="song-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn-icon" title="Play" onClick={handlePlay}>
          <Play size={15} />
        </button>
        {onAddToPlaylist && (
          <button className="btn-icon" title="Add to playlist" onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song); }}>
            <Plus size={15} />
          </button>
        )}
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => setMenuOpen((v) => !v)}>
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 50,
              background: 'var(--bg-card2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              {showPlaylist && playlistId && (
                <button
                  onClick={handleRemoveFromPlaylist}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}
                >
                  <Trash2 size={14} /> Remove from playlist
                </button>
              )}
              <button
                onClick={handleDelete}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', width: '100%', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}
              >
                <Trash2 size={14} /> Delete song
              </button>
            </div>
          )}
        </div>
      </div>
      <div />
    </div>
  );
}
