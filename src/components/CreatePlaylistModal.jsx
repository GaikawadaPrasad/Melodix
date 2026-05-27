import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { X } from 'lucide-react';
import { PLAYLIST_COLORS } from '../lib/utils';
import { useToast } from './Toast';

export default function CreatePlaylistModal({ onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PLAYLIST_COLORS[0]);
  const createPlaylist = useMusicStore((s) => s.createPlaylist);
  const toast = useToast();

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createPlaylist(trimmed, color);
    toast(`Playlist "${trimmed}" created`, 'success');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Playlist</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label>Playlist Name</label>
          <input
            className="form-input"
            placeholder="My Playlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-swatch-row">
            {PLAYLIST_COLORS.map((c) => (
              <div
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim()}>
            Create Playlist
          </button>
        </div>
      </div>
    </div>
  );
}
