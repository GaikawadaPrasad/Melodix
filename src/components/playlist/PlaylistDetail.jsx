import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Play, Shuffle, Pencil, Trash2, Plus, Music, Heart, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';
import SortableTrackRow from './SortableTrackRow';
import TrackRow from './TrackRow';
import Button from '../ui/Button';
import { formatDuration } from '../../utils/formatTime';

const SMART_ICONS = { heart: Heart, clock: Clock, 'trending-up': TrendingUp };
const SMART_COLORS = { heart: 'from-pink-600 to-purple-700', clock: 'from-blue-600 to-cyan-600', 'trending-up': 'from-orange-500 to-red-600' };

export default function PlaylistDetail({ playlistId }) {
  const { recentlyPlayed, playTrack, toggleShuffle } = usePlayerStore();
  const { playlists, getPlaylistTracks, deletePlaylist, reorderTracks, removeTrackFromPlaylist } = usePlaylistStore();
  const { openModal, navigate } = useUIStore();
  const [search, setSearch] = useState('');

  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return <div className="p-8 text-muted">Playlist not found.</div>;

  const allTracks = getPlaylistTracks(playlistId, recentlyPlayed);
  const tracks = search ? allTracks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase())) : allTracks;
  const totalDuration = allTracks.reduce((s, t) => s + (t.duration || 0), 0);

  const Icon = playlist.icon ? SMART_ICONS[playlist.icon] : null;
  const gradientClass = playlist.icon ? SMART_COLORS[playlist.icon] : 'from-accent-dark to-purple-800';

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || playlist.isSmartPlaylist) return;
    const oldIdx = playlist.trackIds.indexOf(active.id);
    const newIdx = playlist.trackIds.indexOf(over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      reorderTracks(playlistId, arrayMove(playlist.trackIds, oldIdx, newIdx));
    }
  };

  const handlePlay = () => { if (tracks.length > 0) playTrack(tracks[0], tracks); };
  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  const firstCover = allTracks[0]?.coverArt;

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
      {/* Hero Header */}
      <div className={`relative flex-shrink-0 bg-gradient-to-b ${gradientClass} to-[#0a0a0f] px-6 pt-6 pb-8`}>
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-white/70 hover:text-white mb-5 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-end gap-6">
          {/* Cover */}
          <div className="w-44 h-44 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/50 bg-white/10">
            {firstCover ? (
              <img src={firstCover} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {Icon ? <Icon size={60} className="text-white/50" /> : <Music size={60} className="text-white/50" />}
              </div>
            )}
          </div>
          {/* Meta */}
          <div className="pb-2">
            <p className="text-xs text-white/70 uppercase font-semibold tracking-wider mb-2">
              {playlist.isSmartPlaylist ? 'Smart Playlist' : 'Playlist'}
            </p>
            <h1 className="text-3xl font-extrabold text-white mb-2">{playlist.name}</h1>
            {playlist.description && <p className="text-sm text-white/60 mb-3 max-w-md">{playlist.description}</p>}
            <p className="text-sm text-white/60">{allTracks.length} songs · {formatDuration(totalDuration)}</p>
          </div>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-3 mt-6">
          <button id={`play-playlist-${playlistId}`} onClick={handlePlay} disabled={tracks.length === 0}
            className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/40 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40">
            <Play size={22} className="fill-white text-white ml-1" />
          </button>
          <button onClick={handleShuffle} disabled={tracks.length === 0}
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-40">
            <Shuffle size={20} />
          </button>
          {!playlist.isSmartPlaylist && (
            <>
              <button onClick={() => openModal('edit-playlist', playlist)} className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <Pencil size={18} />
              </button>
              <button onClick={() => { deletePlaylist(playlistId); navigate('home'); }}
                className="p-3 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-full transition-all">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search within playlist */}
      {allTracks.length > 5 && (
        <div className="px-6 py-3 flex-shrink-0">
          <input className="input-base max-w-xs" placeholder="Search in playlist..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {/* Track List */}
      <div className="px-4 pb-8 flex-1">
        {tracks.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Music size={48} className="text-muted mb-4" />
            <p className="text-text-secondary text-lg font-semibold mb-1">No songs here</p>
            <p className="text-muted text-sm">
              {search ? 'No results match your search.' : playlist.isSmartPlaylist ? 'Songs will appear automatically.' : 'Add songs from your library.'}
            </p>
          </motion.div>
        ) : playlist.isSmartPlaylist ? (
          <div className="space-y-1">
            {tracks.map((track, i) => <TrackRow key={track.id} track={track} index={i} queue={tracks} />)}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={playlist.trackIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {tracks.map((track, i) => (
                  <SortableTrackRow
                    key={track.id} track={track} index={i} queue={tracks} playlistId={playlistId}
                    onRemove={(id) => removeTrackFromPlaylist(playlistId, id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
