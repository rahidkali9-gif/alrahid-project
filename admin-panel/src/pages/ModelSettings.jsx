import { useEffect, useState, useCallback } from 'react';
import { Cpu, Plus, Trash2, Save, Power, KeyRound } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { aiProvidersApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate } from '../utils/format.js';

const PROVIDERS = ['openai', 'anthropic', 'gemini', 'mistral', 'groq', 'cohere', 'together', 'custom'];

const emptyForm = {
  provider: 'openai',
  apiBaseUrl: '',
  apiKey: '',
  defaultModel: '',
  isActive: true,
};

export default function ModelSettings() {
  const toast = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editKey, setEditKey] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    aiProvidersApi
      .list()
      .then((res) => setProviders(res?.data?.providers || []))
      .catch((err) => toast.error(err?.message || 'Failed to load AI providers'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (p = null) => {
    if (p) {
      setForm({
        provider: p.provider,
        apiBaseUrl: p.api_base_url || '',
        apiKey: p.api_key || '',
        defaultModel: p.default_model || '',
        isActive: p.is_active !== false,
      });
      setEditKey(p.provider);
    } else {
      setForm(emptyForm);
      setEditKey(null);
    }
    setModalOpen(true);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    if (!form.provider || !form.apiBaseUrl) {
      toast.warning('Provider and API base URL are required');
      return;
    }
    setWorking(true);
    try {
      await aiProvidersApi.upsert({
        provider: form.provider,
        apiBaseUrl: form.apiBaseUrl,
        apiKey: form.apiKey || undefined,
        defaultModel: form.defaultModel || undefined,
        isActive: form.isActive,
      });
      toast.success('AI provider saved');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save AI provider');
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      await aiProvidersApi.remove(confirmDelete.provider);
      toast.success('AI provider deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete AI provider');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading label="Loading AI providers…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Cpu size={20} className="text-primary-400" /> Model Settings
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">AI provider configuration and model selection</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add provider
        </button>
      </div>

      {providers.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-500">
          <Cpu size={32} className="mb-3 opacity-60" />
          <p className="text-sm">No AI providers configured</p>
          <button className="btn-primary mt-4" onClick={() => openModal()}>
            <Plus size={16} /> Add your first provider
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => (
            <div key={p.id || p.provider} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-500/15 p-2 text-primary-400">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100 capitalize">{p.provider}</p>
                    <p className="text-xs text-slate-500">{p.default_model || 'No default model'}</p>
                  </div>
                </div>
                <span
                  className={`badge ${
                    p.is_active
                      ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
                      : 'bg-slate-700/40 text-slate-400 border border-slate-600'
                  }`}
                >
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base URL</span>
                  <span className="text-slate-300 font-mono truncate ml-2 max-w-[200px]">{p.api_base_url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">API Key</span>
                  <span className="text-slate-300 font-mono">
                    {p.api_key ? '••••••••' + String(p.api_key).slice(-4) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Updated</span>
                  <span className="text-slate-400">{formatDate(p.updated_at || p.created_at)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => openModal(p)}>
                  <Save size={14} /> Edit
                </button>
                <button
                  className="btn-ghost px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
                  onClick={() => setConfirmDelete(p)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editKey ? 'Edit AI provider' : 'Add AI provider'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={working}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={working}>
              <Save size={16} /> {working ? 'Saving…' : 'Save provider'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                className="input capitalize"
                disabled={working || Boolean(editKey)}
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Default model</label>
              <input
                value={form.defaultModel}
                onChange={(e) => setForm((f) => ({ ...f, defaultModel: e.target.value }))}
                className="input"
                placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                disabled={working}
              />
            </div>
          </div>
          <div>
            <label className="label">API base URL</label>
            <input
              value={form.apiBaseUrl}
              onChange={(e) => setForm((f) => ({ ...f, apiBaseUrl: e.target.value }))}
              className="input font-mono"
              placeholder="https://api.openai.com/v1"
              disabled={working}
            />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <KeyRound size={14} className="text-slate-400" /> API key
            </label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              className="input font-mono"
              placeholder="sk-…"
              disabled={working}
            />
            <p className="text-xs text-slate-500 mt-1.5">Stored securely on the server. Leave blank to keep existing.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
              disabled={working}
            />
            <span className="text-sm text-slate-300 flex items-center gap-1.5">
              <Power size={14} /> Active
            </span>
          </label>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        loading={working}
        title="Delete AI provider"
        message={`Delete provider "${confirmDelete?.provider}"? Generations using this provider will fail.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
