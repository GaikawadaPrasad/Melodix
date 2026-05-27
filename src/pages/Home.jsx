import { useRef } from 'react';
import { useMusicStore } from '../store/musicStore';
import SongRow from '../components/SongRow';
import ImportZone from '../components/ImportZone';
import { useToast } from '../components/Toast';
import { Music2, Headphones, ListMusic, Clock, FileJson } from 'lucide-react';
import { formatTime } from '../lib/utils';

export default function Home() {
  const { songs, playlists, importPlaylistFromJson, setView } = useMusicStore();
  const toast = useToast();
  const jsonInputRef = useRef();

  const recentSongs = [...songs].sort((a, b) => b.addedAt - a.addedAt).slice(0, 8);
  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);

  const handleImported = (imported) => {
    toast(`${imported.length} song${imported.length > 1 ? 's' : ''} imported!`, 'success');
  };

  // Handle importing a playlist JSON shared by someone else
  const handleJsonFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const pl = await importPlaylistFromJson(json);
      toast(`Playlist "${pl.name}" imported! Add songs to fill it.`, 'success');
      setView('playlist', pl.id);
    } catch (err) {
      toast(err.message || 'Invalid playlist file', 'error');
    }
    e.target.value = '';
  };

  return (
    <div className="page">
      {/* Stats Row */}
      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard icon={<Music2 size={20} />} label="Total Songs" value={songs.length} color="#6366f1" />
        <StatCard icon={<ListMusic size={20} />} label="Playlists" value={playlists.length} color="#8b5cf6" />
        <StatCard icon={<Clock size={20} />} label="Total Duration" value={formatTime(totalDuration)} color="#ec4899" />
      </div>

      {/* Import zone + playlist import row */}
      <div className="mb-6">
        <ImportZone onImported={handleImported} />

        {/* Import shared playlist JSON */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
          <input ref={jsonInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleJsonFile} />
          <button
            className="btn btn-ghost"
            onClick={() => jsonInputRef.current?.click()}
            style={{ gap: 8 }}
          >
            <FileJson size={16} style={{ color: 'var(--accent)' }} />
            Import Shared Playlist (.json)
          </button>
        </div>
      </div>

      {/* Recently Added */}
      {recentSongs.length > 0 && (
        <div>
          <div className="page-header">
            <h2>Recently Added</h2>
          </div>
          <div className="song-list card" style={{ padding: '8px 4px' }}>
            {recentSongs.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                songList={recentSongs}
              />
            ))}
          </div>
        </div>
      )}

      {songs.length === 0 && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <div className="empty-icon"><Headphones /></div>
          <h3>Your library is empty</h3>
          <p>Drag & drop audio files above to start listening</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card stat-card-compact" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
      <div className="stat-icon" style={{
        width: 42, height: 42,
        borderRadius: 10,
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
        <div className="stat-label" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}
