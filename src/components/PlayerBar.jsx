import { useMusicStore } from '../store/musicStore';
import { formatTime } from '../lib/utils';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, VolumeX,
  Music,
} from 'lucide-react';
import { useAudioEngine } from '../hooks/useAudioEngine';

function RepeatIcon({ mode }) {
  if (mode === 'one') return <Repeat1 size={16} />;
  return <Repeat size={16} />;
}

function SongArtMini({ song }) {
  const hue = [...(song.title || 'A')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="player-art"
      style={{ background: `linear-gradient(135deg, hsl(${hue},60%,25%), hsl(${(hue + 60) % 360},60%,18%))` }}
    >
      {song.coverArt
        ? <img src={song.coverArt} alt={song.title} />
        : <span style={{ fontSize: 11, fontWeight: 700, color: `hsl(${hue},80%,80%)` }}>{(song.title || '?')[0].toUpperCase()}</span>
      }
    </div>
  );
}

export default function PlayerBar() {
  const {
    currentSong, isPlaying, progress, duration,
    volume, isMuted, repeatMode, isShuffle,
    setIsPlaying, setVolume, toggleMute,
    toggleShuffle, cycleRepeat, playNext, playPrev,
  } = useMusicStore();

  const { seek } = useAudioEngine();

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const Controls = ({ size = 16, playSize = 20 }) => (
    <div className="player-btns">
      <button className={`ctrl-btn ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle} title="Shuffle">
        <Shuffle size={size} />
      </button>
      <button className="ctrl-btn" onClick={playPrev} title="Previous">
        <SkipBack size={size + 2} />
      </button>
      <button className="ctrl-btn-play" onClick={() => setIsPlaying(!isPlaying)} disabled={!currentSong}>
        {isPlaying ? <Pause size={playSize} /> : <Play size={playSize} />}
      </button>
      <button className="ctrl-btn" onClick={playNext} title="Next">
        <SkipForward size={size + 2} />
      </button>
      <button className={`ctrl-btn ${repeatMode !== 'none' ? 'active' : ''}`} onClick={cycleRepeat} title="Repeat">
        <RepeatIcon mode={repeatMode} />
      </button>
    </div>
  );

  return (
    <div className="player-bar">
      {/* ── DESKTOP LAYOUT ── */}
      <div className="player-inner player-desktop">
        <div className="player-song-info">
          {currentSong ? (
            <>
              <SongArtMini song={currentSong} />
              <div className="player-meta">
                <div className="player-title">{currentSong.title}</div>
                <div className="player-artist">{currentSong.artist}</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <Music size={20} />
              <span style={{ fontSize: 13 }}>No song playing</span>
            </div>
          )}
        </div>

        <div className="player-controls">
          <Controls size={16} playSize={20} />
          <div className="player-progress">
            <span className="time-label">{formatTime(progress)}</span>
            <div className="progress-track" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="time-label right">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-right">
          <div className="volume-row">
            <button className="ctrl-btn" onClick={toggleMute} title="Mute">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              className="volume-slider"
              min={0} max={1} step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="player-inner player-mobile">
        {/* Row 1: Art + Song info */}
        <div className="pm-row pm-info-row">
          {currentSong ? (
            <>
              <SongArtMini song={currentSong} />
              <div className="player-meta" style={{ flex: 1, minWidth: 0 }}>
                <div className="player-title">{currentSong.title}</div>
                <div className="player-artist">{currentSong.artist}</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Music size={18} />
              <span style={{ fontSize: 12 }}>No song playing</span>
            </div>
          )}
        </div>

        {/* Row 2: Progress */}
        <div className="pm-row">
          <div className="player-progress">
            <span className="time-label">{formatTime(progress)}</span>
            <div className="progress-track" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="time-label right">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Row 3: Controls */}
        <div className="pm-row pm-controls-row">
          <Controls size={15} playSize={18} />
        </div>
      </div>
    </div>
  );
}
