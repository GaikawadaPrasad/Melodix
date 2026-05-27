import Modal from '../ui/Modal';
import UploadSongs from '../ui/UploadSongs';
import { useUIStore } from '../../store/uiStore';

export default function UploadModal() {
  const { activeModal, closeModal } = useUIStore();
  return (
    <Modal isOpen={activeModal === 'upload-songs'} onClose={closeModal} title="Upload Your Songs" size="md">
      <UploadSongs />
    </Modal>
  );
}
