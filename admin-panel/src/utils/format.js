/**
 * Formatting helpers for the Al Rahid admin panel.
 */

export function formatDate(value, opts = {}) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  const yr = Math.floor(mon / 12);
  return `${yr}y ago`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString();
}

export function formatCredits(value) {
  if (value === null || value === undefined || value === '') return '0';
  const n = Number(value);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString(undefined, { style: 'currency', currency });
}

export function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function titleCase(str) {
  if (!str) return '';
  return String(str)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export default {
  formatDate,
  formatDateTime,
  formatRelative,
  formatNumber,
  formatCredits,
  formatCurrency,
  truncate,
  titleCase,
};
