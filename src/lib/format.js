export function formatCoins(value) {
  const amount = Number(value || 0);

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }

  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }

  return Math.floor(amount).toLocaleString('en-US');
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function percent(current, max) {
  if (!max) return 0;
  return clamp(Math.round((Number(current) / Number(max)) * 100), 0, 100);
}
