import { useEffect, useState, useMemo, useCallback } from 'react';
import { Trash2, FileText, Image as ImageIcon, Film, Music, CloudUpload as UploadCloud } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loading from '../components/Loading.jsx';
import { mediaApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDateTime } from '../utils/format.js';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

function categoryOf(m) {
  const type = (m.mimetype || m.type || '').toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'document';
}

const CAT_ICON = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
};

const CAT_COLOR = {
  image: 'text-primary-400',
  video: 'text-accent-400',
  audio: 'text-amber-400',
  document: 'text-sky-400',
};

export default function Uploads() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    mediaApi
      .list({ page: 1, limit: 100 })
      .then((res) => setRows(res?.data || []))
      .catch((err) => toast.error(err?.message || 'Failed to load media'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!category) return rows;
    return rows.filter((m) => categoryOf(m) === category);
  }, [rows, category]);

  const remove = async () => {
    setWorking(true);
    try {
      await mediaApi.remove(confirmDelete.id);
      toast.success('Media deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete media');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Uploads</h2>
          <p className="text-sm text-slate-400 mt-0.5">Media manager — all uploaded files</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input sm:w-44">
            <option value="">All categories</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading media…" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-500">
          <UploadCloud size={32} className="mb-3 opacity-60" />
          <p className="text-sm">No media files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((m) => {
            const cat = categoryOf(m);
            const Icon = CAT_ICON[cat];
            return (
              <div key={m.id} className="card overflow-hidden group">
                <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden relative">
                  {cat === 'image' ? (
                    <img
                      src={mediaUrl(m.path || m.url)}
                      alt={m.original_name || m.filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Icon size={40} className={CAT_COLOR[cat]} />
                  )}
                  <button
                    onClick={() => setConfirmDelete(m)}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 text-red-400 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-200 truncate" title={m.original_name || m.filename}>
                    {m.original_name || m.filename || 'Unnamed'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{formatDateTime(m.created_at)}</p>
                  <span className="badge mt-2 capitalize bg-slate-700/40 text-slate-300 border border-slate-600">
                    <Icon size={11} className={`mr-1 ${CAT_COLOR[cat]}`} /> {cat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        loading={working}
        title="Delete media"
        message={`Delete "${confirmDelete?.original_name || confirmDelete?.filename || 'this file'}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
