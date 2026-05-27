import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import SongRow from '../components/SongRow';
import ImportZone from '../components/ImportZone';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { useToast } from '../components/Toast';
import { Music, Upload, SortAsc } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'addedAt-desc', label: 'Recently Added' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'artist-asc', label: 'Artist A-Z' },
  { value: 'duration-desc', label: 'Longest' },
];

export default function Library() {
  const { songs } = useMusicStore();
  const [sort, setSort] = useState('addedAt-desc');
  const [showImport, setShowImport] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);
  const toast = useToast();

  const sortedSongs = [...songs].sort((a, b) => {
    const [field, dir] = sort.split('-');
    const valA = a[field] ?? '';
    const valB = b[field] ?? '';
    const cmp = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
    return dir === 'asc' ? cmp : -cmp;
  });

  const handleImported = (imported) => {
    toast(`${imported.length} song${imported.length > 1 ? 's' : ''} added to library!`, 'success');
    setShowImport(false);
  };

  return (
    <div className="page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>Your Library</h2>
          <p>{songs.length} songs</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowImport((v) => !v)}>
            <Upload size={15} /> Import
          </button>
        </div>
      </div>

      {showImport && (
        <div className="mb-6">
          <ImportZone onImported={handleImported} />
        </div>
      )}

      {sortedSongs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Music /></div>
          <h3>Library is empty</h3>
          <p>Import audio files to start building your music library</p>
          <button className="btn btn-primary" onClick={() => setShowImport(true)}>
            <Upload size={15} /> Import Songs
          </button>
        </div>
      ) : (
        <div className="song-list card" style={{ padding: '8px 4px' }}>
          {sortedSongs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              songList={sortedSongs}
              onAddToPlaylist={setAddToPlaylistSong}
            />
          ))}
        </div>
      )}

      {addToPlaylistSong && (
        <AddToPlaylistModal
          song={addToPlaylistSong}
          onClose={() => setAddToPlaylistSong(null)}
        />
      )}
    </div>
  );
}
