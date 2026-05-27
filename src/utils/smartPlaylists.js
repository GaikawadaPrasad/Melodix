/**
 * Evaluate smart playlist rules against the library.
 * @param {Array} rules - SmartRule[]
 * @param {Array} library - Track[]
 * @param {Array} recentlyPlayed - string[] (track IDs)
 */
export const evaluateSmartPlaylist = (rules, library, recentlyPlayed = []) => {
  let tracks = [...library];

  for (const rule of rules) {
    tracks = tracks.filter((track) => {
      if (rule.field === 'liked') return track.liked === rule.value;
      if (rule.field === 'recentlyPlayed') return recentlyPlayed.includes(track.id);
      if (rule.field === 'playCount') {
        if (rule.operator === 'gt') return track.playCount > rule.value;
        if (rule.operator === 'lt') return track.playCount < rule.value;
        if (rule.operator === 'eq') return track.playCount === rule.value;
      }
      if (rule.field === 'genre') return track.genre?.some(g => g.toLowerCase().includes(rule.value.toLowerCase()));
      if (rule.field === 'year') {
        if (rule.operator === 'gt') return track.year > rule.value;
        if (rule.operator === 'lt') return track.year < rule.value;
        if (rule.operator === 'eq') return track.year === rule.value;
      }
      return true;
    });
  }

  // Special sort for smart playlists
  const hasRecentlyPlayedRule = rules.some(r => r.field === 'recentlyPlayed');
  const hasPlayCountRule = rules.some(r => r.field === 'playCount');

  if (hasRecentlyPlayedRule) {
    tracks.sort((a, b) => recentlyPlayed.indexOf(a.id) - recentlyPlayed.indexOf(b.id));
  } else if (hasPlayCountRule) {
    tracks.sort((a, b) => b.playCount - a.playCount);
  }

  return tracks;
};
