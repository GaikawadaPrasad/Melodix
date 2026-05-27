import { useRef, useState, useCallback } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Upload } from 'lucide-react';

export default function ImportZone({ onImported }) {
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const importSongs = useMusicStore((s) => s.importSongs);

  const handleFiles = useCallback(async (files) => {
    const audioFiles = Array.from(files).filter((f) => f.type.startsWith('audio/') || f.name.match(/\.(mp3|flac|wav|ogg|aac|m4a|opus|webm)$/i));
    if (!audioFiles.length) return;

    setImporting(true);
    try {
      const imported = await importSongs(audioFiles);
      onImported?.(imported);
    } finally {
      setImporting(false);
    }
  }, [importSongs, onImported]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`import-zone ${dragging ? 'drag-over' : ''}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.ogg,.aac,.m4a"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="zone-icon">
        {importing ? '⏳' : <Upload size={40} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />}
      </div>
      <h3>{importing ? 'Importing...' : 'Import Songs'}</h3>
      <p>Drag & drop audio files here, or click to browse</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>MP3 · FLAC · WAV · OGG · AAC · M4A supported</p>
    </div>
  );
}
