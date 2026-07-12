import { useEffect, useState, useCallback } from 'react';
import { Image, Plus, Trash2, Save, Pencil, ExternalLink } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { bannersApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate, truncate } from '../utils/format.js';

const POSITIONS = ['home_top', 'home_mid', 'sidebar', 'dashboard_top', 'in_app'];

const emptyForm = {
  title: '',
  image_url: '',
  target_url: '',
  position: 'home_top',
  is_active: true,
  start_date: '',
  end_date: '',
};

export default function Banners() {
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    bannersApi
      .list()
      .then((res) => setBanners(res?.data?.banners || []))
      .catch((err) => toast.error(err?.message || 'Failed to load banners'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (b = null) => {
    if (b) {
      setForm({
        title: b.title || '',
        image_url: b.image_url || '',
        target_url: b.target_url || '',
        position: b.position || 'home_top',
        is_active: b.is_active !== false,
        start_date: b.start_date ? b.start_date.slice(0, 10) : '',
        end_date: b.end_date ? b.end_date.slice(0, 10) : '',
      });
      setEditId(b.id);
    } else {
      setForm(emptyForm);
      setEditId(null);
    }
    setModalOpen(true);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    if (!form.title) {
      toast.warning('Title is required');
      return;
    }
    setWorking(true);
    try {
      const payload = {
        title: form.title,
        image_url: form.image_url || null,
        target_url: form.target_url || null,
        position: form.position,
        is_active: form.is_active,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editId) {
        await bannersApi.update(editId, payload);
        toast.success('Banner updated');
      } else {
        await bannersApi.create(payload);
        toast.success('Banner created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save banner');
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      await bannersApi.remove(confirmDelete.id);
      toast.success('Banner deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete banner');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading label="Loading banners…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Image size={20} className="text-primary-400" /> Banners
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage promotional banners</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-500">
          <Image size={32} className="mb-3 opacity-60" />
          <p className="text-sm">No banners configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="aspect-video bg-slate-900 flex items-center justify-center overflow-hidden relative">
                {b.image_url ? (
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Image size={32} className="text-slate-600" />
                )}
                <span
                  className={`absolute top-2 left-2 badge ${
                    b.is_active
                      ? 'bg-accent-500/90 text-white'
                      : 'bg-slate-700/90 text-slate-300'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100 truncate" title={b.title}>
                    {b.title}
                  </h3>
                  <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 capitalize shrink-0">
                    {b.position?.replace('_', ' ')}
                  </span>
                </div>
                {(b.start_date || b.end_date) && (
                  <p className="text-xs text-slate-500 mt-2">
                    {b.start_date ? formatDate(b.start_date) : '∞'} → {b.end_date ? formatDate(b.end_date) : '∞'}
                  </p>
                )}
                {b.target_url && (
                  <a
                    href={b.target_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300 mt-2 inline-flex items-center gap-1 truncate max-w-full"
                  >
                    <ExternalLink size={12} /> {truncate(b.target_url, 40)}
                  </a>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <button className="btn-ghost px-2 py-1.5" onClick={() => openModal(b)} title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn-ghost px-2 py-1.5 text-red-400 hover:text-red-300"
                    onClick={() => setConfirmDelete(b)}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit banner' : 'Add banner'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={working}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={working}>
              <Save size={16} /> {working ? 'Saving…' : 'Save banner'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              placeholder="Banner title"
              disabled={working}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="input"
                placeholder="https://… or /banners/hero.png"
                disabled={working}
              />
            </div>
            <div>
              <label className="label">Target URL</label>
              <input
                value={form.target_url}
                onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
                className="input"
                placeholder="https://example.com/promo"
                disabled={working}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Position</label>
              <select
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className="input capitalize"
                disabled={working}
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="input"
                disabled={working}
              />
            </div>
            <div>
              <label className="label">End date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="input"
                disabled={working}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
              disabled={working}
            />
            <span className="text-sm text-slate-300">Active</span>
          </label>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        loading={working}
        title="Delete banner"
        message={`Delete banner "${confirmDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
