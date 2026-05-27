import { motion } from 'framer-motion';
import { Home, Search, Library, Plus, Heart, Clock, TrendingUp, ChevronLeft, Music2, Upload } from 'lucide-react';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', view: 'home', id: 'nav-home' },
  { icon: Search, label: 'Search', view: 'search', id: 'nav-search' },
  { icon: Library, label: 'Library', view: 'library', id: 'nav-library' },
];

const SMART_ICONS = { heart: Heart, clock: Clock, 'trending-up': TrendingUp };

export default function Sidebar() {
  const { playlists } = usePlaylistStore();
  const { activeView, activePlaylistId, sidebarCollapsed, toggleSidebar, navigate, openModal } = useUIStore();

  const smartPlaylists = playlists.filter((p) => p.isSmartPlaylist);
  const userPlaylists = playlists.filter((p) => !p.isSmartPlaylist);

  return (
    <motion.aside
      className="flex flex-col h-full glass-dark border-r border-surface-border overflow-hidden"
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center px-4 py-5 gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
          <Music2 size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-extrabold text-lg gradient-text">
            Melodix
          </motion.span>
        )}
        <button onClick={toggleSidebar} className="ml-auto p-1 text-muted hover:text-text-primary transition-colors rounded">
          <ChevronLeft size={16} className={clsx('transition-transform', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Upload button */}
      <div className="px-2 flex-shrink-0 mb-1">
        <button
          id="upload-songs-btn"
          onClick={() => openModal('upload-songs')}
          title="Upload Songs"
          className={clsx(
            'sidebar-item w-full bg-accent/10 hover:bg-accent/20 text-accent-light border border-accent/20',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <Upload size={16} className="flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-semibold">Upload Songs</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 px-2 pb-4">
        {/* Navigation */}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, view, id }) => (
            <button
              key={view}
              id={id}
              onClick={() => navigate(view)}
              className={clsx('sidebar-item w-full', activeView === view && !activePlaylistId && 'active')}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </div>

        <div className="border-t border-surface-border my-2" />

        {/* Smart Playlists */}
        {!sidebarCollapsed && <p className="text-xs text-muted uppercase tracking-wider px-3 py-1 font-semibold">Smart</p>}
        {smartPlaylists.map((p) => {
          const Icon = SMART_ICONS[p.icon] || Music2;
          return (
            <button
              key={p.id}
              id={`nav-${p.id}`}
              onClick={() => navigate('playlist', p.id)}
              className={clsx('sidebar-item w-full', activePlaylistId === p.id && 'active')}
              title={sidebarCollapsed ? p.name : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{p.name}</span>}
            </button>
          );
        })}

        <div className="border-t border-surface-border my-2" />

        {/* User Playlists */}
        <div className="flex items-center justify-between px-3 py-1">
          {!sidebarCollapsed && <p className="text-xs text-muted uppercase tracking-wider font-semibold">Playlists</p>}
          <button
            id="create-playlist-btn"
            onClick={() => openModal('create-playlist')}
            className="p-1.5 text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors ml-auto"
            title="Create Playlist"
          >
            <Plus size={14} />
          </button>
        </div>
        {userPlaylists.map((p) => (
          <button
            key={p.id}
            id={`nav-playlist-${p.id}`}
            onClick={() => navigate('playlist', p.id)}
            className={clsx('sidebar-item w-full', activePlaylistId === p.id && 'active')}
            title={sidebarCollapsed ? p.name : undefined}
          >
            <div className="w-4 h-4 rounded bg-accent/30 flex-shrink-0 flex items-center justify-center">
              <Music2 size={8} className="text-accent-light" />
            </div>
            {!sidebarCollapsed && <span className="truncate text-xs">{p.name}</span>}
          </button>
        ))}
        {userPlaylists.length === 0 && !sidebarCollapsed && (
          <p className="text-xs text-muted px-3 py-2">No playlists yet. Create one!</p>
        )}
      </div>
    </motion.aside>
  );
}
