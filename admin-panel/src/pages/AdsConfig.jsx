import { useEffect, useState, useCallback } from 'react';
import { Megaphone, Plus, Trash2, Save, Pencil, ExternalLink, FlaskConical } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { adsApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate, truncate } from '../utils/format.js';

const PLACEMENTS = ['home_sidebar', 'feed_top', 'feed_inline', 'dashboard_widget', 'footer', 'interstitial'];

const emptyForm = {
  placement: 'home_sidebar',
  title: '',
  content: '',
  image_url: '',
  target_url: '',
  is_active: true,
  start_date: '',
  end_date: '',
};

export default function AdsConfig() {
  const toast = useToast();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adsApi
      .list()
      .then((res) => setAds(res?.data?.ads || []))
      .catch((err) => toast.error(err?.message || 'Failed to load ads'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (a = null) => {
    if (a) {
      setForm({
        placement: a.placement || 'home_sidebar',
        title: a.title || '',
        content: a.content || '',
        image_url: a.image_url || '',
        target_url: a.target_url || '',
        is_active: a.is_active !== false,
        start_date: a.start_date ? a.start_date.slice(0, 10) : '',
        end_date: a.end_date ? a.end_date.slice(0, 10) : '',
      });
      setEditId(a.id);
    } else {
      setForm(emptyForm);
      setEditId(null);
    }
    setModalOpen(true);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    if (!form.placement) {
      toast.warning('Placement is required');
      return;
    }
    setWorking(true);
    try {
      const payload = {
        placement: form.placement,
        title: form.title || null,
        content: form.content || null,
        image_url: form.image_url || null,
        target_url: form.target_url || null,
        is_active: form.is_active,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editId) {
        await adsApi.update(editId, payload);
        toast.success('Ad updated');
      } else {
        await adsApi.create(payload);
        toast.success('Ad created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save ad');
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      await adsApi.remove(confirmDelete.id);
      toast.success('Ad deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete ad');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading label="Loading ads…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Megaphone size={20} className="text-primary-400" /> Ads Config
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage ad placements</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add ad
        </button>
      </div>

      <div className="card p-4 flex items-start gap-3 text-sm text-slate-400 border-l-4 border-l-primary-500/40">
        <FlaskConical size={18} className="text-primary-400 mt-0.5 shrink-0" />
        <p>
          Ads configuration is prepared for the future advertising system. Placements defined here will be
          consumed by client apps once the ads delivery endpoint is enabled.
        </p>
      </div>

      {ads.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-500">
          <Megaphone size={32} className="mb-3 opacity-60" />
          <p className="text-sm">No ads configured yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base table-striped">
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Target</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th align="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 capitalize">
                        {a.placement?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-medium text-slate-100">{a.title || '—'}</td>
                    <td className="max-w-xs">
                      <p className="text-slate-400 text-xs truncate" title={a.content}>
                        {a.content || '—'}
                      </p>
                    </td>
                    <td>
                      {a.target_url ? (
                        <a
                          href={a.target_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> {truncate(a.target_url, 30)}
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-400 whitespace-nowrap">
                      {a.start_date ? formatDate(a.start_date) : '∞'} → {a.end_date ? formatDate(a.end_date) : '∞'}
                    </td>
                    <td>
                      {a.is_active ? (
                        <span className="badge bg-accent-500/15 text-accent-300 border border-accent-500/30">Active</span>
                      ) : (
                        <span className="badge bg-slate-700/40 text-slate-400 border border-slate-600">Inactive</span>
                      )}
                    </td>
                    <td align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="btn-ghost px-2 py-1.5" onClick={() => openModal(a)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn-ghost px-2 py-1.5 text-red-400 hover:text-red-300"
                          onClick={() => setConfirmDelete(a)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit ad' : 'Add ad'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={working}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={working}>
              <Save size={16} /> {working ? 'Saving…' : 'Save ad'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Placement</label>
            <select
              value={form.placement}
              onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
              className="input capitalize"
              disabled={working}
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              placeholder="Ad title"
              disabled={working}
            />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={3}
              className="input resize-y"
              placeholder="Ad body text / HTML"
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
                placeholder="https://…"
                disabled={working}
              />
            </div>
            <div>
              <label className="label">Target URL</label>
              <input
                value={form.target_url}
                onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
                className="input"
                placeholder="https://sponsor.example.com"
                disabled={working}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        title="Delete ad"
        message={`Delete ad "${confirmDelete?.title || confirmDelete?.placement}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
