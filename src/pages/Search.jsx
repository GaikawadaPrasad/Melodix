import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import SongRow from '../components/SongRow';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { Search, Music, X } from 'lucide-react';

export default function SearchPage() {
  const { songs } = useMusicStore();
  const [query, setQuery] = useState('');
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  const filtered = query.trim()
    ? songs.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase()) ||
        (s.album || '').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Search</h2>
        <p>Find songs in your imported library</p>
      </div>

      <div className="search-bar">
        <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          placeholder="Search songs, artists, albums…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {query.trim() ? (
        filtered.length > 0 ? (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>"{query}"</strong>
            </p>
            <div className="song-list card" style={{ padding: '8px 4px' }}>
              {filtered.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  songList={filtered}
                  onAddToPlaylist={setAddToPlaylistSong}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different keyword or import more songs</p>
          </div>
        )
      ) : (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <div className="empty-icon" style={{ opacity: 0.3 }}><Music size={48} /></div>
          <h3>Search your library</h3>
          <p>Type a song title, artist, or album name above</p>
        </div>
      )}

      {addToPlaylistSong && (
        <AddToPlaylistModal
          song={addToPlaylistSong}
          onClose={() => setAddToPlaylistSong(null)}
        />
      )}
    </div>
  );
}
