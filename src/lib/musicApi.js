/**
 * iTunes Search API — free, no key, CORS-friendly
 * Returns up to 200 results with 30-sec preview URLs, artwork, metadata.
 */

const ITUNES_BASE = 'https://itunes.apple.com/search';

export async function searchITunes(query, { limit = 25, entity = 'song', country = 'US' } = {}) {
  if (!query?.trim()) return [];

  const url = new URL(ITUNES_BASE);
  url.searchParams.set('term', query.trim());
  url.searchParams.set('entity', entity);
  url.searchParams.set('limit', limit);
  url.searchParams.set('country', country);
  url.searchParams.set('media', 'music');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
  const data = await res.json();

  return (data.results || []).map((item) => ({
    itunesId: item.trackId,
    title: item.trackName || 'Unknown',
    artist: item.artistName || 'Unknown Artist',
    album: item.collectionName || 'Unknown Album',
    genre: item.primaryGenreName || '',
    duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 0,
    previewUrl: item.previewUrl || null,      // 30-sec M4A preview
    artworkUrl: (item.artworkUrl100 || '').replace('100x100', '300x300'),
    artworkThumb: item.artworkUrl100 || '',
    releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
    trackPrice: item.trackPrice,
    currency: item.currency,
    itunesUrl: item.trackViewUrl,
    country: item.country,
  }));
}

/**
 * Last.fm API — free tier, needs a free API key from last.fm
 * Used for enriching imported songs with tags, play counts, similar artists.
 * Set your key in localStorage key: 'lastfm_api_key'
 */
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';

export function getLastFmKey() {
  return localStorage.getItem('lastfm_api_key') || '';
}

export async function searchLastFm(query, limit = 20) {
  const apiKey = getLastFmKey();
  if (!apiKey || !query?.trim()) return [];

  const url = new URL(LASTFM_BASE);
  url.searchParams.set('method', 'track.search');
  url.searchParams.set('track', query.trim());
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', limit);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();

  const matches = data?.results?.trackmatches?.track || [];
  return matches.map((t) => ({
    title: t.name,
    artist: t.artist,
    listeners: t.listeners,
    lastfmUrl: t.url,
    image: t.image?.find((i) => i.size === 'large')?.['#text'] || '',
  }));
}
