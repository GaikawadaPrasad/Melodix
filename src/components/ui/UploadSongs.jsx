import { useState, useRef, useCallback } from 'react';
import { Upload, Music, X, CheckCircle, Loader, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaylistStore } from '../../store/playlistStore';

/* ─── Helpers ─────────────────────────────────────────────────── */

/** Parse "Artist - Title" from filename, or just use filename as title */
const parseFileName = (filename) => {
  const base = filename.replace(/\.[^/.]+$/, '');
  const parts = base.split(' - ');
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  return { artist: 'Unknown Artist', title: base };
};

/** Get audio duration from a blob URL */
const getAudioDuration = (src) =>
  new Promise((resolve) => {
    const audio = new Audio(src);
    audio.addEventListener('loadedmetadata', () => resolve(audio.duration), { once: true });
    audio.addEventListener('error', () => resolve(0), { once: true });
    audio.load();
  });

/** Generate a unique gradient cover art as data URL based on track title */
const generateCover = (title) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    const grad = ctx.createLinearGradient(0, 0, 200, 200);
    grad.addColorStop(0, `hsl(${hue}, 65%, 30%)`);
    grad.addColorStop(1, `hsl(${(hue + 75) % 360}, 55%, 20%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', 100, 105);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
};

/** Accepted MIME types */
const ACCEPTED = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/x-m4a', 'audio/mp4'];
const ACCEPTED_EXT = '.mp3,.wav,.flac,.ogg,.aac,.m4a';

/* ─── Component ───────────────────────────────────────────────── */

export default function UploadSongs({ onClose }) {
  const { addSongsToLibrary } = usePlaylistStore();
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'done'
  const [progress, setProgress] = useState({ current: 0, total: 0, name: '' });
  const [added, setAdded] = useState([]);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const processFiles = useCallback(async (files) => {
    const audioFiles = Array.from(files).filter(
      (f) => ACCEPTED.some((t) => f.type === t) || ACCEPTED_EXT.split(',').some((e) => f.name.toLowerCase().endsWith(e.replace('.', '')))
    );
    if (audioFiles.length === 0) return;

    setStatus('processing');
    setProgress({ current: 0, total: audioFiles.length, name: '' });
    setAdded([]);
    setErrors([]);

    const newSongs = [];
    const errs = [];

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setProgress({ current: i + 1, total: audioFiles.length, name: file.name });
      try {
        const src = URL.createObjectURL(file);
        const duration = await getAudioDuration(src);
        const { artist, title } = parseFileName(file.name);
        const cover = generateCover(title);
        newSongs.push({
          id: `upload-${Date.now()}-${i}`,
          title,
          artist,
          album: 'Uploaded',
          duration,
          src,           // blob URL – valid for this browser session
          coverArt: cover,
          genre: [],
          year: new Date().getFullYear(),
          playCount: 0,
          liked: false,
          addedAt: new Date().toISOString(),
          isUploaded: true,
        });
      } catch (e) {
        errs.push(file.name);
      }
    }

    if (newSongs.length > 0) addSongsToLibrary(newSongs);
    setAdded(newSongs);
    setErrors(errs);
    setStatus('done');
  }, [addSongsToLibrary]);

  /* Drag handlers */
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const onFileChange = (e) => processFiles(e.target.files);

  return (
    <div className="flex flex-col gap-5">
      {/* Drop Zone */}
      <motion.div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => status !== 'processing' && inputRef.current?.click()}
        animate={{ borderColor: isDragging ? '#7c3aed' : '#2a2a40', background: isDragging ? 'rgba(124,58,237,0.08)' : 'rgba(26,26,39,0.5)' }}
        className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors text-center select-none"
        style={{ borderColor: '#2a2a40' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          multiple
          className="hidden"
          onChange={onFileChange}
          id="song-file-input"
        />

        {status === 'idle' && (
          <>
            <motion.div
              animate={{ y: isDragging ? -6 : 0 }}
              className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center"
            >
              <Upload size={28} className="text-accent-light" />
            </motion.div>
            <div>
              <p className="text-text-primary font-bold text-base">Drop songs here</p>
              <p className="text-muted text-sm mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-muted bg-surface-hover px-3 py-1 rounded-full">
              MP3 · WAV · FLAC · OGG · AAC · M4A
            </p>
          </>
        )}

        {status === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <Loader size={32} className="text-accent-light animate-spin" />
            <p className="text-text-primary font-semibold">
              Processing {progress.current} / {progress.total}
            </p>
            <p className="text-muted text-xs truncate max-w-[240px]">{progress.name}</p>
            <div className="w-48 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={32} className="text-green-400" />
            <p className="text-text-primary font-bold">
              {added.length} song{added.length !== 1 ? 's' : ''} added!
            </p>
            {errors.length > 0 && (
              <p className="text-red-400 text-xs">{errors.length} file(s) failed</p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setStatus('idle'); setAdded([]); setErrors([]); }}
              className="text-accent-light text-xs hover:underline mt-1"
            >
              Upload more files
            </button>
          </div>
        )}
      </motion.div>

      {/* Added tracks preview */}
      <AnimatePresence>
        {added.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 max-h-48 overflow-y-auto pr-1"
          >
            {added.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-hover">
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-surface">
                  {t.coverArt
                    ? <img src={t.coverArt} alt="" className="w-full h-full object-cover" />
                    : <Music size={14} className="text-muted m-auto mt-1.5" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary text-xs font-semibold truncate">{t.title}</p>
                  <p className="text-muted text-xs truncate">{t.artist}</p>
                </div>
                <CheckCircle size={14} className="text-green-400 flex-shrink-0 ml-auto" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session note */}
      <p className="text-xs text-muted text-center leading-relaxed">
        ⚠️ Uploaded songs are available <strong className="text-text-secondary">this session only</strong>.<br />
        They will be cleared when you refresh the page.
      </p>

      {/* Browse button */}
      <button
        id="browse-files-btn"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'processing'}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold transition-all disabled:opacity-50"
      >
        <FolderOpen size={16} />
        Browse Files
      </button>
    </div>
  );
}
