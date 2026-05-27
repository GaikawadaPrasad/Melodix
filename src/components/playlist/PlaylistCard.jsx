import { motion } from 'framer-motion';
import { Play, Music, Heart, Clock, TrendingUp } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';
import { formatDuration } from '../../utils/formatTime';
import clsx from 'clsx';

const SMART_ICONS = { heart: Heart, clock: Clock, 'trending-up': TrendingUp };

export default function PlaylistCard({ playlist }) {
  const { playTrack } = usePlayerStore();
  const { getPlaylistTracks, getPlaylistCover } = usePlaylistStore();
  const { recentlyPlayed } = usePlayerStore();
  const { navigate } = useUIStore();

  const tracks = getPlaylistTracks(playlist.id, recentlyPlayed);
  const cover = getPlaylistCover(playlist.id) || playlist.coverArt;
  const totalDuration = tracks.reduce((s, t) => s + (t.duration || 0), 0);
  const Icon = playlist.icon ? SMART_ICONS[playlist.icon] : null;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  };

  return (
    <motion.div
      className="card-hover cursor-pointer bg-surface rounded-xl p-4 group"
      onClick={() => navigate('playlist', playlist.id)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Cover */}
      <div className="relative mb-4 rounded-lg overflow-hidden aspect-square bg-surface-hover">
        {cover ? (
          <img src={cover} alt={playlist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {Icon ? <Icon size={40} className="text-muted" /> : <Music size={40} className="text-muted" />}
          </div>
        )}
        {/* Play overlay */}
        <motion.button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-11 h-11 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 opacity-0 group-hover:opacity-100"
          initial={{ scale: 0.8 }} whileHover={{ scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ opacity: 0 }}
          whileInView={{ opacity: 0 }}
        >
          <Play size={18} className="fill-white text-white ml-0.5" />
        </motion.button>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <motion.button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-11 h-11 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          <Play size={18} className="fill-white text-white ml-0.5" />
        </motion.button>
      </div>

      {/* Info */}
      <p className="font-bold text-text-primary text-sm truncate">{playlist.name}</p>
      <p className="text-xs text-muted mt-1 truncate">
        {tracks.length} songs · {formatDuration(totalDuration)}
      </p>
      {playlist.description && (
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{playlist.description}</p>
      )}
    </motion.div>
  );
}
