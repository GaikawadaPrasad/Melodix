import { useMusicStore } from '../store/musicStore';
import { Home, Music2, ListMusic, Search, Plus } from 'lucide-react';
import { PLAYLIST_COLORS } from '../lib/utils';

export default function Sidebar({ onCreatePlaylist }) {
  const { playlists, currentView, activePlaylistId, setView } = useMusicStore();

  const navItems = [
    { id: 'home',    label: 'Home',    icon: <Home size={17} /> },
    { id: 'library', label: 'Library', icon: <Music2 size={17} /> },
    { id: 'search',  label: 'Search',  icon: <Search size={17} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎵</div>
        <h1>Melodix</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="divider" style={{ margin: '4px 12px' }} />

      <div className="sidebar-playlists">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px' }}>
          <span className="nav-section-label" style={{ padding: 0 }}>Playlists</span>
          <button
            className="btn-icon"
            style={{ width: 24, height: 24, color: 'var(--text-muted)' }}
            onClick={onCreatePlaylist}
            title="New playlist"
          >
            <Plus size={15} />
          </button>
        </div>

        {playlists.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 8px' }}>No playlists yet</p>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl.id}
              className={`playlist-item ${activePlaylistId === pl.id && currentView === 'playlist' ? 'active' : ''}`}
              onClick={() => setView('playlist', pl.id)}
            >
              <div className="playlist-dot" style={{ background: pl.coverColor || PLAYLIST_COLORS[0] }}>
                <ListMusic size={12} color="#fff" />
              </div>
              <span className="playlist-name">{pl.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pl.songIds.length}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
