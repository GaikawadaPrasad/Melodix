import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export default function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const display = isMuted ? 0 : volume;
  const pct = Math.round(display * 100);

  const Icon = isMuted || volume === 0 ? VolumeX : volume < 0.33 ? Volume : volume < 0.66 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <button id="volume-toggle" onClick={toggleMute} className="text-muted hover:text-text-primary transition-colors p-1" title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
        <Icon size={16} />
      </button>
      <input
        id="volume-slider"
        type="range"
        min="0"
        max="100"
        value={pct}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        className="w-20 h-1"
        style={{ background: `linear-gradient(to right, #7c3aed ${pct}%, #2a2a40 ${pct}%)` }}
        title={`Volume: ${pct}%`}
      />
    </div>
  );
}
