import { Download, ExternalLink, AlertTriangle, Music, Globe } from 'lucide-react';

const DOWNLOAD_TOOLS = [
  {
    name: 'yt-dlp',
    desc: 'Most powerful CLI tool. Download from YouTube, SoundCloud, Spotify, and 1000+ sites.',
    url: 'https://github.com/yt-dlp/yt-dlp',
    commands: [
      { label: 'Install (Windows)', code: 'winget install yt-dlp' },
      { label: 'Download MP3 from YouTube', code: 'yt-dlp -x --audio-format mp3 "VIDEO_URL"' },
      { label: 'Download playlist as MP3', code: 'yt-dlp -x --audio-format mp3 "PLAYLIST_URL"' },
      { label: 'With metadata', code: 'yt-dlp -x --audio-format mp3 --add-metadata "URL"' },
    ],
    badge: 'Recommended',
    badgeColor: '#22c55e',
  },
  {
    name: 'spotDL',
    desc: 'Download Spotify playlists and songs with metadata and cover art.',
    url: 'https://github.com/spotDL/spotify-downloader',
    commands: [
      { label: 'Install', code: 'pip install spotdl' },
      { label: 'Download a song', code: 'spotdl "SPOTIFY_SONG_URL"' },
      { label: 'Download playlist', code: 'spotdl "SPOTIFY_PLAYLIST_URL"' },
    ],
    badge: 'Spotify',
    badgeColor: '#1db954',
  },
];

const ONLINE_TOOLS = [
  { name: 'cobalt.tools', url: 'https://cobalt.tools', desc: 'Privacy-focused. No ads. YouTube, SoundCloud, TikTok.' },
  { name: 'yt1s.io', url: 'https://yt1s.io', desc: 'Fast YouTube to MP3 converter.' },
  { name: 'soundcloudmp3.app', url: 'https://soundcloudmp3.app', desc: 'Download from SoundCloud.' },
];

export default function DownloadPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>Download Songs</h2>
        <p>Tools to download music and import it into your library</p>
      </div>

      {/* Warning */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 'var(--radius)',
        padding: 16,
        marginBottom: 24,
        fontSize: 13,
        color: 'var(--warning)',
        lineHeight: 1.6,
      }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          Only download music you have rights to. Downloading copyrighted content without permission may be illegal in your region.
          Use this for personal backups of music you own, or free/Creative Commons music.
        </span>
      </div>

      {/* How to use workflow */}
      <div className="card mb-6">
        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>How to use Melodix offline</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { step: '1', title: 'Download audio', desc: 'Use yt-dlp or an online tool to download MP3/FLAC files to your device' },
            { step: '2', title: 'Import into Melodix', desc: 'Go to Library → Import, or drag files onto the Home page import zone' },
            { step: '3', title: 'Play offline', desc: 'Songs are stored in your browser\'s IndexedDB and work fully offline' },
          ].map((s) => (
            <div key={s.step} style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, marginBottom: 8,
              }}>{s.step}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CLI Tools */}
      <div className="page-header" style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 18 }}>CLI Download Tools</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        {DOWNLOAD_TOOLS.map((tool) => (
          <div key={tool.name} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>{tool.name}</h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${tool.badgeColor}22`, color: tool.badgeColor }}>{tool.badge}</span>
              <a href={tool.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, textDecoration: 'none' }}>
                <ExternalLink size={13} /> GitHub
              </a>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>{tool.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tool.commands.map((cmd) => (
                <div key={cmd.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{cmd.label}</div>
                  <div style={{
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: 12.5,
                    color: '#a5f3fc',
                    cursor: 'pointer',
                  }}
                    onClick={() => navigator.clipboard?.writeText(cmd.code)}
                    title="Click to copy"
                  >
                    {cmd.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Online Tools */}
      <div className="page-header" style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 18 }}>Online Converters</h2>
      </div>
      <div className="grid-cards">
        {ONLINE_TOOLS.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div className="playlist-card" style={{ gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{tool.name}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{tool.desc}</p>
              <div style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Open <ExternalLink size={12} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
