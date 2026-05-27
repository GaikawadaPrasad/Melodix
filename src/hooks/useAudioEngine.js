import { useRef, useEffect, useCallback } from 'react';
import { useMusicStore } from '../store/musicStore';

export function useAudioEngine() {
  const audioRef = useRef(new Audio());
  const blobUrlRef = useRef(null);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    setIsPlaying,
    setProgress,
    setDuration,
    playNext,
  } = useMusicStore();

  // Load song when it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) return;

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // currentSong.data is an ArrayBuffer from IndexedDB
    const blob = new Blob([currentSong.data], { type: currentSong.type || 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    audio.src = url;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    return () => {
      // Cleanup handled above on next load
    };
  }, [currentSong?.id]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Progress & duration listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  return { audioRef, seek };
}
