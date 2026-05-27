import { motion } from 'framer-motion';
import { Play, Heart, MoreHorizontal, Clock, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';
import { formatTime } from '../../utils/formatTime';
import clsx from 'clsx';

export default function TrackRow({ track, index, queue, showIndex = true, playlistId = null, onRemove }) {
  const { currentTrack, isPlaying, playTrack, setIsPlaying } = usePlayerStore();
  const { toggleLike } = usePlaylistStore();
  const { openModal } = useUIStore();

  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) setIsPlaying(!isPlaying);
    else playTrack(track, queue || [track]);
  };

  return (
    <motion.div
      layout
      className={clsx('track-row relative', isActive && 'bg-accent/10 hover:bg-accent/15')}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {/* Index / Playing indicator */}
      {showIndex && (
        <div className="w-8 text-center flex-shrink-0">
          {isActive && isPlaying ? (
            <div className="wave-bars mx-auto w-fit">
              <span /><span /><span />
            </div>
          ) : (
            <span className="text-sm text-muted group-hover:hidden">{index + 1}</span>
          )}
          <button onClick={handlePlay} className="hidden group-hover:flex items-center justify-center w-full">
            {isActive && isPlaying
              ? <span className="w-4 h-4 bg-text-primary rounded-sm" />
              : <Play size={14} className="text-text-primary fill-text-primary" />
            }
          </button>
        </div>
      )}

      {/* Cover Art */}
      <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-surface-hover" onClick={handlePlay}>
        {track.coverArt ? (
          <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Music size={16} className="text-muted" /></div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Play size={14} className="text-white opacity-0 group-hover:opacity-100 fill-white transition-opacity" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handlePlay}>
        <p className={clsx('text-sm font-semibold truncate leading-5', isActive ? 'text-accent-light' : 'text-text-primary')}>
          {track.title}
        </p>
        <p className="text-xs text-muted truncate">{track.artist} · {track.album}</p>
      </div>

      {/* Duration + Actions */}
      <div className="flex items-center gap-1 ml-auto flex-shrink-0">
        {/* Like */}
        <button
          id={`like-${track.id}`}
          onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
          className={clsx('p-1.5 rounded-full transition-all', track.liked ? 'text-accent-light' : 'text-muted opacity-0 group-hover:opacity-100 hover:text-text-primary')}
          title={track.liked ? 'Unlike' : 'Like'}
        >
          <Heart size={14} className={track.liked ? 'fill-accent-light' : ''} />
        </button>

        {/* Duration */}
        <span className="text-xs text-muted w-10 text-right">{formatTime(track.duration)}</span>

        {/* More */}
        <button
          onClick={(e) => { e.stopPropagation(); openModal('add-to-playlist', { trackId: track.id }); }}
          className="p-1.5 rounded-full text-muted opacity-0 group-hover:opacity-100 hover:text-text-primary transition-all"
          title="More options"
        >
          <MoreHorizontal size={14} />
        </button>

        {/* Remove from playlist */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(track.id); }}
            className="p-1.5 rounded-full text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-xs"
            title="Remove from playlist"
          >✕</button>
        )}
      </div>
    </motion.div>
  );
}
