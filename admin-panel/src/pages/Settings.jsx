import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, Power, Settings as SettingsIcon, ToggleLeft } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { appSettingsApi, featureTogglesApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate } from '../utils/format.js';

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState([]);
  const [toggles, setToggles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ key: '', value: '', category: 'general', isPublic: false });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([appSettingsApi.list(), featureTogglesApi.list()])
      .then(([s, t]) => {
        setSettings(s?.data?.settings || []);
        setToggles(t?.data?.toggles || []);
      })
      .catch((err) => toast.error(err?.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (setting = null) => {
    if (setting) {
      setForm({ key: setting.key, value: setting.value ?? '', category: setting.category || 'general', isPublic: !!setting.is_public });
    } else {
      setForm({ key: '', value: '', category: 'general', isPublic: false });
    }
    setModalOpen(true);
  };

  const saveSetting = async (e) => {
    e?.preventDefault?.();
    if (!form.key) {
      toast.warning('Setting key is required');
      return;
    }
    setWorking(true);
    try {
      await appSettingsApi.upsert({
        key: form.key,
        value: form.value,
        category: form.category,
        isPublic: form.isPublic,
      });
      toast.success('Setting saved');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save setting');
    } finally {
      setWorking(false);
    }
  };

  const deleteSetting = async () => {
    setWorking(true);
    try {
      await appSettingsApi.remove(confirmDelete.key);
      toast.success('Setting deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete setting');
    } finally {
      setWorking(false);
    }
  };

  const toggleFeature = async (t) => {
    setWorking(true);
    try {
      await featureTogglesApi.upsert({
        featureKey: t.feature_key,
        isEnabled: !t.is_enabled,
        description: t.description,
      });
      toast.success(`Feature ${!t.is_enabled ? 'enabled' : 'disabled'}`);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle feature');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading label="Loading settings…" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">App settings and feature toggles</p>
      </div>

      {/* App settings */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <SettingsIcon size={16} className="text-primary-400" /> App settings
          </h3>
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={16} /> Add setting
          </button>
        </div>
        {settings.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No settings configured</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Category</th>
                  <th>Public</th>
                  <th>Updated</th>
                  <th align="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.key}>
                    <td className="font-mono text-primary-300 text-sm">{s.key}</td>
                    <td className="text-slate-200 text-sm max-w-xs truncate" title={s.value}>
                      {String(s.value ?? '—')}
                    </td>
                    <td>
                      <span className="badge bg-slate-700/40 text-slate-300 border border-slate-600 capitalize">
                        {s.category || 'general'}
                      </span>
                    </td>
                    <td>
                      {s.is_public ? (
                        <span className="badge bg-accent-500/15 text-accent-300 border border-accent-500/30">Public</span>
                      ) : (
                        <span className="badge bg-slate-700/40 text-slate-400 border border-slate-600">Private</span>
                      )}
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(s.updated_at || s.created_at)}</td>
                    <td align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="btn-ghost px-2 py-1.5" onClick={() => openModal(s)} title="Edit">
                          <Save size={15} />
                        </button>
                        <button
                          className="btn-ghost px-2 py-1.5 text-red-400 hover:text-red-300"
                          onClick={() => setConfirmDelete(s)}
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
        )}
      </div>

      {/* Feature toggles */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ToggleLeft size={16} className="text-accent-400" /> Feature toggles
          </h3>
        </div>
        {toggles.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No feature toggles configured</div>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {toggles.map((t) => (
              <div key={t.feature_key} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 font-mono">{t.feature_key}</p>
                  {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                </div>
                <button
                  onClick={() => toggleFeature(t)}
                  disabled={working}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    t.is_enabled ? 'bg-accent-600' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={t.is_enabled}
                  title={t.is_enabled ? 'Click to disable' : 'Click to enable'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      t.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.key && settings.find((s) => s.key === form.key) ? 'Edit setting' : 'Add setting'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={working}>
              Cancel
            </button>
            <button className="btn-primary" onClick={saveSetting} disabled={working}>
              <Save size={16} /> {working ? 'Saving…' : 'Save setting'}
            </button>
          </>
        }
      >
        <form onSubmit={saveSetting} className="space-y-4">
          <div>
            <label className="label">Key</label>
            <input
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              className="input font-mono"
              placeholder="e.g. max_upload_size"
              disabled={working}
            />
          </div>
          <div>
            <label className="label">Value</label>
            <input
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              className="input"
              placeholder="Setting value"
              disabled={working}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input"
                disabled={working}
              >
                <option value="general">general</option>
                <option value="branding">branding</option>
                <option value="limits">limits</option>
                <option value="features">features</option>
                <option value="ai">ai</option>
                <option value="payment">payment</option>
              </select>
            </div>
            <div>
              <label className="label">Visibility</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
                  disabled={working}
                />
                <span className="text-sm text-slate-300">Public (exposed to clients)</span>
              </label>
            </div>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={deleteSetting}
        loading={working}
        title="Delete setting"
        message={`Delete setting "${confirmDelete?.key}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
