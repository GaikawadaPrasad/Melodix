import { useEffect, useState } from 'react';
import { useMusicStore } from './store/musicStore';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { ToastProvider } from './components/Toast';
import { Home as HomeIcon, Music2, Search, ListMusic, Plus } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Library from './pages/Library';
import SearchPage from './pages/Search';
import PlaylistView from './pages/PlaylistView';

function PageRouter() {
  const currentView = useMusicStore((s) => s.currentView);

  switch (currentView) {
    case 'home':     return <Home />;
    case 'library':  return <Library />;
    case 'search':   return <SearchPage />;
    case 'playlist': return <PlaylistView />;
    default:         return <Home />;
  }
}

function MobileNav({ onCreatePlaylist }) {
  const { currentView, setView } = useMusicStore();

  const navItems = [
    { id: 'home',    label: 'Home',    icon: <HomeIcon size={20} /> },
    { id: 'library', label: 'Library', icon: <Music2 size={20} /> },
    { id: 'search',  label: 'Search',  icon: <Search size={20} /> },
    { id: 'playlist', label: 'New', icon: <Plus size={20} />, action: onCreatePlaylist },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`mobile-nav-btn ${currentView === item.id && !item.action ? 'active' : ''}`}
          onClick={() => item.action ? item.action() : setView(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const loadLibrary = useMusicStore((s) => s.loadLibrary);
  const isLibraryLoaded = useMusicStore((s) => s.isLibraryLoaded);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, []);

  if (!isLibraryLoaded) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'var(--bg-deep)',
      }}>
        <div style={{ fontSize: 48 }}>🎵</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>Melodix</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading your library…</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar onCreatePlaylist={() => setShowCreatePlaylist(true)} />
        <main className="main-content">
          <PageRouter />
        </main>
        <PlayerBar />
      </div>
      <MobileNav onCreatePlaylist={() => setShowCreatePlaylist(true)} />

      {showCreatePlaylist && (
        <CreatePlaylistModal onClose={() => setShowCreatePlaylist(false)} />
      )}
    </ToastProvider>
  );
}
