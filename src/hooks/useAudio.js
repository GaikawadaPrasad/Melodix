import { useRef, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';

export function useAudio() {
  const audioRef = useRef(null);
  const nextAudioRef = useRef(null);
  const crossfadeRef = useRef(null);
  const isInitialized = useRef(false);

  const { currentTrack, isPlaying, volume, isMuted, repeat, crossfadeDuration,
    setProgress, setCurrentTime, setDuration, setIsPlaying, nextTrack, addToRecentlyPlayed } = usePlayerStore();
  const { incrementPlayCount } = usePlaylistStore();

  // Init audio elements once
  if (!isInitialized.current) {
    audioRef.current = new Audio();
    nextAudioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    nextAudioRef.current.preload = 'auto';
    nextAudioRef.current.volume = 0;
    isInitialized.current = true;
  }

  // Track change
  useEffect(() => {
    if (!currentTrack) return;
    const audio = audioRef.current;
    if (audio.src !== currentTrack.src) {
      audio.src = currentTrack.src;
      audio.load();
    }
    if (isPlaying) audio.play().catch(() => {});
    addToRecentlyPlayed(currentTrack.id);
    incrementPlayCount(currentTrack.id);
  }, [currentTrack?.id]); // eslint-disable-line

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  // Volume/mute
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  // timeupdate / loadedmetadata / ended
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress(audio.currentTime / audio.duration);
      setCurrentTime(audio.currentTime);

      // Crossfade: start fading out and playing next track
      if (crossfadeDuration > 0 && audio.duration - audio.currentTime <= crossfadeDuration) {
        const { queue, queueIndex, repeat: rep } = usePlayerStore.getState();
        const nextIdx = queueIndex + 1;
        if (nextIdx < queue.length || rep === 'all') {
          const nextTrackObj = queue[nextIdx % queue.length];
          const nextAudio = nextAudioRef.current;
          if (nextAudio.src !== nextTrackObj?.src && nextTrackObj) {
            nextAudio.src = nextTrackObj.src;
            nextAudio.load();
            nextAudio.play().catch(() => {});
          }
          const pct = 1 - (audio.duration - audio.currentTime) / crossfadeDuration;
          audio.volume = (isMuted ? 0 : volume) * (1 - pct);
          nextAudio.volume = (isMuted ? 0 : volume) * pct;
        }
      }
    };

    const onLoaded = () => setDuration(audio.duration);

    const onEnded = () => {
      clearInterval(crossfadeRef.current);
      // Swap: next audio becomes current
      const nextAudio = nextAudioRef.current;
      if (nextAudio.src && nextAudio.currentTime > 0) {
        // Already playing via crossfade
        audioRef.current.volume = isMuted ? 0 : volume;
        nextAudio.volume = 0;
        nextAudio.src = '';
      }
      if (repeat === 'one') { audio.currentTime = 0; audio.play().catch(() => {}); }
      else nextTrack();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeat, volume, isMuted, crossfadeDuration]); // eslint-disable-line

  const seek = useCallback((ratio) => {
    const audio = audioRef.current;
    if (!audio.duration) return;
    audio.currentTime = ratio * audio.duration;
    setCurrentTime(audio.currentTime);
    setProgress(ratio);
  }, [setCurrentTime, setProgress]);

  return { audioRef, seek };
}
