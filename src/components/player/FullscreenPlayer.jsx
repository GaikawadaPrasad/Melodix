import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, Minimize2, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';
import AudioVisualizer from './AudioVisualizer';
import SeekBar from './SeekBar';
import VolumeControl from './VolumeControl';
import clsx from 'clsx';

export default function FullscreenPlayer({ audioRef, seek }) {
  const { currentTrack, isPlaying, shuffle, repeat, currentTime, setIsPlaying, nextTrack, prevTrack, toggleShuffle, toggleRepeat } = usePlayerStore();
  const { toggleLike } = usePlaylistStore();
  const { showFullscreen, toggleFullscreen } = useUIStore();

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <AnimatePresence>
      {showFullscreen && currentTrack && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Blurred background */}
          <div className="absolute inset-0 overflow-hidden">
            {currentTrack.coverArt && (
              <img src={currentTrack.coverArt} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-30" />
            )}
            <div className="absolute inset-0 bg-[#0a0a0f]/80" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5">
              <button onClick={toggleFullscreen} className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10">
                <Minimize2 size={20} />
              </button>
              <p className="text-sm text-white/60 font-medium">Now Playing</p>
              <div className="w-9" />
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4 gap-6">
              {/* Album art */}
              <motion.div
                className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                animate={{ scale: isPlaying ? 1 : 0.92 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                {currentTrack.coverArt
                  ? <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-surface-hover flex items-center justify-center"><Music size={60} className="text-muted" /></div>
                }
              </motion.div>

              {/* Track info + like */}
              <div className="text-center w-full max-w-sm">
                <div className="flex items-center justify-center gap-3">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
                    <p className="text-white/60 truncate">{currentTrack.artist} · {currentTrack.album}</p>
                  </div>
                  <button onClick={() => toggleLike(currentTrack.id)}
                    className={clsx('p-2 flex-shrink-0 transition-all', currentTrack.liked ? 'text-accent-light' : 'text-white/40 hover:text-white')}>
                    <Heart size={20} className={currentTrack.liked ? 'fill-accent-light' : ''} />
                  </button>
                </div>
              </div>

              {/* Visualizer */}
              <div className="w-full max-w-sm h-14">
                <AudioVisualizer audioRef={audioRef} height={56} />
              </div>

              {/* Seek + time */}
              <div className="w-full max-w-sm">
                <SeekBar seek={seek} />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-5">
                <button onClick={toggleShuffle} className={clsx('p-2 transition-all', shuffle ? 'text-accent-light' : 'text-white/50 hover:text-white')}>
                  <Shuffle size={20} />
                </button>
                <button onClick={() => prevTrack(currentTime)} className="p-2 text-white/80 hover:text-white transition-all hover:scale-110">
                  <SkipBack size={28} />
                </button>
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"
                  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                >
                  {isPlaying
                    ? <Pause size={26} className="fill-[#0a0a0f] text-[#0a0a0f]" />
                    : <Play size={26} className="fill-[#0a0a0f] text-[#0a0a0f] ml-1" />
                  }
                </motion.button>
                <button onClick={nextTrack} className="p-2 text-white/80 hover:text-white transition-all hover:scale-110">
                  <SkipForward size={28} />
                </button>
                <button onClick={toggleRepeat} className={clsx('p-2 transition-all', repeat !== 'none' ? 'text-accent-light' : 'text-white/50 hover:text-white')}>
                  <RepeatIcon size={20} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <VolumeControl />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
