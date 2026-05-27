import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import { usePlaylistStore } from '../../store/playlistStore';

export default function AddToPlaylistModal() {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { playlists, addTrackToPlaylist } = usePlaylistStore();
  const isOpen = activeModal === 'add-to-playlist';
  const trackId = modalData?.trackId;

  const userPlaylists = playlists.filter((p) => !p.isSmartPlaylist);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Add to Playlist" size="sm">
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {userPlaylists.length === 0 && (
          <p className="text-text-secondary text-sm text-center py-4">No playlists yet. Create one first!</p>
        )}
        {userPlaylists.map((p) => (
          <button
            key={p.id}
            onClick={() => { addTrackToPlaylist(p.id, trackId); closeModal(); }}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-hover text-text-primary text-sm transition-colors flex items-center justify-between group"
          >
            <span className="font-medium">{p.name}</span>
            <span className="text-xs text-muted">{p.trackIds.length} songs</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
