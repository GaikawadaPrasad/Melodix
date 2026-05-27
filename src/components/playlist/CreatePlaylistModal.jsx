import { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { usePlaylistStore } from '../../store/playlistStore';
import { useUIStore } from '../../store/uiStore';

export default function CreatePlaylistModal() {
  const { activeModal, modalData, closeModal, navigate } = useUIStore();
  const { createPlaylist, updatePlaylist } = usePlaylistStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const isEdit = activeModal === 'edit-playlist';

  // Pre-fill on edit
  const prevModal = useRef(null);
  if (activeModal !== prevModal.current) {
    prevModal.current = activeModal;
    if (activeModal === 'edit-playlist' && modalData) {
      setName(modalData.name || '');
      setDesc(modalData.description || '');
    } else if (activeModal === 'create-playlist') {
      setName(''); setDesc('');
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEdit && modalData?.id) {
      updatePlaylist(modalData.id, { name: name.trim(), description: desc.trim() });
    } else {
      const id = createPlaylist(name.trim(), desc.trim());
      navigate('playlist', id);
    }
    closeModal();
  };

  const isOpen = activeModal === 'create-playlist' || activeModal === 'edit-playlist';

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={isEdit ? 'Edit Playlist' : 'Create New Playlist'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-medium">Playlist Name *</label>
          <input
            id="playlist-name-input"
            autoFocus
            className="input-base"
            placeholder="My Awesome Playlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-medium">Description</label>
          <textarea
            id="playlist-desc-input"
            className="input-base resize-none h-20"
            placeholder="Add an optional description..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="flex gap-2 pt-1 justify-end">
          <Button variant="ghost" onClick={closeModal} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={!name.trim()}>
            {isEdit ? 'Save Changes' : 'Create Playlist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
