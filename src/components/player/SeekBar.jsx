import { usePlayerStore } from '../../store/playerStore';
import { formatTime } from '../../utils/formatTime';

export default function SeekBar({ seek }) {
  const { progress, currentTime, duration } = usePlayerStore();
  const pct = Math.round((progress || 0) * 100);

  const handleChange = (e) => {
    seek(Number(e.target.value) / 100);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-muted w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
      <div className="relative flex-1 seek-track" style={{ '--seek-pct': `${pct}%` }}>
        <input
          id="seek-bar"
          type="range"
          min="0"
          max="100"
          value={pct}
          onChange={handleChange}
          className="w-full h-1 accent-accent"
          style={{ background: `linear-gradient(to right, #7c3aed ${pct}%, #2a2a40 ${pct}%)` }}
        />
      </div>
      <span className="text-xs text-muted w-9 tabular-nums">{formatTime(duration)}</span>
    </div>
  );
}
