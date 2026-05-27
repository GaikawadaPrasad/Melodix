import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { useToast } from './Toast';
import {
  X, Copy, Download, Share2, CheckCircle, Music2,
  FileJson, ListMusic,
} from 'lucide-react';
import { formatTime } from '../lib/utils';

/**
 * Generates a plain-text tracklist for the playlist.
 */
function buildTracklist(playlist, songs) {
  const lines = [
    `🎵 Playlist: ${playlist.name}`,
    `${playlist.songIds.length} songs`,
    `─────────────────────────`,
  ];
  playlist.songIds.forEach((id, i) => {
    const s = songs.find((x) => x.id === id);
    if (s) {
      lines.push(`${i + 1}. ${s.title} — ${s.artist}${s.duration ? '  [' + formatTime(s.duration) + ']' : ''}`);
    }
  });
  lines.push('', 'Shared via Melodix');
  return lines.join('\n');
}

/**
 * Generates a JSON export blob for the playlist (metadata only, no audio).
 */
function buildJsonExport(playlist, songs) {
  const tracks = playlist.songIds
    .map((id) => songs.find((x) => x.id === id))
    .filter(Boolean)
    .map((s) => ({ title: s.title, artist: s.artist, album: s.album, duration: s.duration }));

  return JSON.stringify({
    _melodix: true,
    version: 1,
    playlist: {
      name: playlist.name,
      coverColor: playlist.coverColor,
      exportedAt: new Date().toISOString(),
      tracks,
    },
  }, null, 2);
}

export default function SharePlaylistModal({ playlistId, onClose }) {
  const { playlists, songs } = useMusicStore();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return null;

  const playlistSongs = playlist.songIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean);

  // ── Copy tracklist as text ──────────────────────────────────────────────────
  const handleCopyText = async () => {
    const text = buildTracklist(playlist, songs);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast('Tracklist copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast('Could not copy — try the Export option', 'error');
    }
  };

  // ── Export as .json file ────────────────────────────────────────────────────
  const handleExportJson = () => {
    const json = buildJsonExport(playlist, songs);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name.replace(/[^a-zA-Z0-9]/g, '_')}_melodix.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Playlist exported as JSON!', 'success');
  };

  // ── Export tracklist as .txt file ───────────────────────────────────────────
  const handleExportTxt = () => {
    const text = buildTracklist(playlist, songs);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name.replace(/[^a-zA-Z0-9]/g, '_')}_tracklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Tracklist exported!', 'success');
  };

  // ── Web Share API (mobile/supported browsers) ───────────────────────────────
  const canWebShare = !!navigator.share;
  const handleWebShare = async () => {
    const text = buildTracklist(playlist, songs);
    try {
      await navigator.share({ title: `🎵 ${playlist.name}`, text });
      toast('Shared!', 'success');
    } catch (e) {
      if (e.name !== 'AbortError') toast('Could not share', 'error');
    }
  };

  const totalDuration = playlistSongs.reduce((s, x) => s + (x.duration || 0), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: playlist.coverColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ListMusic size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ marginBottom: 1 }}>Share Playlist</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{playlist.name}</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Playlist preview */}
        <div style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Music2 size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{playlist.name}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px',
              borderRadius: 99, background: 'rgba(99,102,241,0.15)', color: 'var(--accent)',
            }}>
              {playlistSongs.length} songs
            </span>
          </div>
          {/* Track preview list */}
          <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {playlistSongs.slice(0, 8).map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.artist}</span>
              </div>
            ))}
            {playlistSongs.length > 8 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                +{playlistSongs.length - 8} more songs
              </p>
            )}
          </div>
          {totalDuration > 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              Total duration: {formatTime(totalDuration)}
            </p>
          )}
        </div>

        {/* Share options */}
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 10 }}>
          Share Options
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Copy text */}
          <ShareOption
            icon={copied ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
            title="Copy Tracklist"
            desc="Copy song list as plain text to paste anywhere"
            onClick={handleCopyText}
            active={copied}
            actionLabel={copied ? 'Copied!' : 'Copy'}
          />

          {/* Web Share */}
          {canWebShare && (
            <ShareOption
              icon={<Share2 size={18} />}
              title="Share via Apps"
              desc="Share through messaging, social, or other apps"
              onClick={handleWebShare}
              actionLabel="Share"
            />
          )}

          {/* Export JSON */}
          <ShareOption
            icon={<FileJson size={18} />}
            title="Export as JSON"
            desc="Download a .json file — others can import this playlist into Melodix"
            onClick={handleExportJson}
            actionLabel="Export"
          />

          {/* Export TXT */}
          <ShareOption
            icon={<Download size={18} />}
            title="Download Tracklist"
            desc="Save the tracklist as a .txt file"
            onClick={handleExportTxt}
            actionLabel="Download"
          />
        </div>

        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          💡 <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> Audio files aren't shared (they're stored locally).
          Share the tracklist so others can find and import the same songs.
        </div>
      </div>
    </div>
  );
}

function ShareOption({ icon, title, desc, onClick, actionLabel, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        border: `1px solid ${active ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        background: active ? 'rgba(34,197,94,0.07)' : 'var(--bg-deep)',
        cursor: 'pointer',
        transition: 'all 0.16s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = active ? 'rgba(34,197,94,0.07)' : 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = active ? 'rgba(34,197,94,0.4)' : 'var(--border)'; e.currentTarget.style.background = active ? 'rgba(34,197,94,0.07)' : 'var(--bg-deep)'; }}
    >
      <div style={{ color: active ? 'var(--success)' : 'var(--accent)', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, padding: '4px 12px',
        borderRadius: 99, border: '1px solid var(--border)',
        color: active ? 'var(--success)' : 'var(--text-secondary)',
        flexShrink: 0,
      }}>{actionLabel}</span>
    </div>
  );
}
