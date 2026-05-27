import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useUIStore } from '../store/uiStore';

export function useKeyboard(seek) {
  const { isPlaying, setIsPlaying, volume, setVolume, toggleMute, toggleShuffle, toggleRepeat, nextTrack, prevTrack, currentTime } = usePlayerStore();
  const { toggleLike, currentTrack: track } = usePlayerStore();
  const { toggleLike: tl } = usePlaylistStore();
  const { toggleFullscreen, navigate } = useUIStore();

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.code) {
        case 'Space': e.preventDefault(); setIsPlaying(!isPlaying); break;
        case 'ArrowRight': if (!e.shiftKey) { e.preventDefault(); nextTrack(); } break;
        case 'ArrowLeft': if (!e.shiftKey) { e.preventDefault(); prevTrack(currentTime); } break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(1, volume + 0.05)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, volume - 0.05)); break;
        case 'KeyM': toggleMute(); break;
        case 'KeyS': toggleShuffle(); break;
        case 'KeyR': toggleRepeat(); break;
        case 'KeyF': toggleFullscreen(); break;
        case 'KeyL': {
          const ct = usePlayerStore.getState().currentTrack;
          if (ct) tl(ct.id);
          break;
        }
        case 'KeyH': navigate('home'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, volume, currentTime, setIsPlaying, setVolume, toggleMute, toggleShuffle, toggleRepeat, nextTrack, prevTrack, toggleFullscreen, navigate, tl]);
}
