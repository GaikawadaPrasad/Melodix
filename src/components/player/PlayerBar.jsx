import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, Maximize2, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';
import SeekBar from './SeekBar';
import VolumeControl from './VolumeControl';
import clsx from 'clsx';

export default function PlayerBar({ seek }) {
  const { currentTrack, isPlaying, shuffle, repeat, setIsPlaying, nextTrack, prevTrack, currentTime, toggleShuffle, toggleRepeat } = usePlayerStore();
  const { toggleLike } = usePlaylistStore();
  const { toggleFullscreen, navigate } = useUIStore();

  if (!currentTrack) {
    return (
      <div className="h-[72px] glass-dark border-t border-surface-border flex items-center justify-center">
        <p className="text-muted text-sm">Select a song to start playing</p>
      </div>
    );
  }

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div className="glass-dark border-t border-surface-border px-4 py-3 flex items-center gap-4 h-[80px]">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3 w-64 flex-shrink-0 min-w-0">
        <div
          className="w-12 h-12 rounded-lg overflow-hidden bg-surface-hover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={toggleFullscreen}
          title="Full screen player"
        >
          {currentTrack.coverArt
            ? <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Music size={20} className="text-muted" /></div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate leading-5">{currentTrack.title}</p>
          <p className="text-xs text-muted truncate">{currentTrack.artist}</p>
        </div>
        <button
          id="playerbar-like"
          onClick={() => toggleLike(currentTrack.id)}
          className={clsx('p-1.5 rounded-full flex-shrink-0 transition-all', currentTrack.liked ? 'text-accent-light' : 'text-muted hover:text-text-primary')}
          title="Like (L)"
        >
          <Heart size={16} className={currentTrack.liked ? 'fill-accent-light' : ''} />
        </button>
      </div>

      {/* Center: Controls + Seek */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {/* Shuffle */}
          <button id="shuffle-btn" onClick={toggleShuffle} title="Shuffle (S)"
            className={clsx('p-2 rounded-full transition-all hover:text-text-primary', shuffle ? 'text-accent-light' : 'text-muted')}>
            <Shuffle size={16} />
          </button>
          {/* Prev */}
          <button id="prev-btn" onClick={() => prevTrack(currentTime)} title="Previous (←)"
            className="p-2 rounded-full text-muted hover:text-text-primary transition-all hover:scale-110">
            <SkipBack size={20} />
          </button>
          {/* Play/Pause */}
          <motion.button
            id="play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-text-primary rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
            whileTap={{ scale: 0.9 }}
            title="Play/Pause (Space)"
          >
            <AnimatePresence mode="wait">
              {isPlaying
                ? <motion.div key="pause" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.1 }}>
                    <Pause size={18} className="fill-[#0a0a0f] text-[#0a0a0f]" />
                  </motion.div>
                : <motion.div key="play" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.1 }}>
                    <Play size={18} className="fill-[#0a0a0f] text-[#0a0a0f] ml-0.5" />
                  </motion.div>
              }
            </AnimatePresence>
          </motion.button>
          {/* Next */}
          <button id="next-btn" onClick={nextTrack} title="Next (→)"
            className="p-2 rounded-full text-muted hover:text-text-primary transition-all hover:scale-110">
            <SkipForward size={20} />
          </button>
          {/* Repeat */}
          <button id="repeat-btn" onClick={toggleRepeat} title="Repeat (R)"
            className={clsx('p-2 rounded-full transition-all hover:text-text-primary', repeat !== 'none' ? 'text-accent-light' : 'text-muted')}>
            <RepeatIcon size={16} />
          </button>
        </div>
        <SeekBar seek={seek} />
      </div>

      {/* Right: Volume + Fullscreen */}
      <div className="w-64 flex-shrink-0 flex items-center justify-end gap-3">
        <VolumeControl />
        <button id="fullscreen-btn" onClick={toggleFullscreen} title="Full screen (F)"
          className="p-2 text-muted hover:text-text-primary transition-colors rounded-full hover:bg-surface-hover">
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
