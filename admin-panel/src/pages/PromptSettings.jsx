import { useEffect, useState, useCallback } from 'react';
import { MessageSquareText, Plus, Trash2, Save, Pencil } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { promptsApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate, titleCase } from '../utils/format.js';

const PROMPT_TYPES = ['chat', 'image', 'video', 'voice', 'music', 'logo', 'resume', 'presentation', 'code', 'website', 'app', 'email', 'document', 'pdf-summary'];

const emptyForm = { name: '', type: 'chat', system_prompt: '', user_template: '', is_active: true };

export default function PromptSettings() {
  const toast = useToast();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    promptsApi
      .list()
      .then((res) => setPrompts(res?.data?.prompts || []))
      .catch((err) => toast.error(err?.message || 'Failed to load prompts'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (p = null) => {
    if (p) {
      setForm({
        name: p.name || '',
        type: p.type || 'chat',
        system_prompt: p.system_prompt || '',
        user_template: p.user_template || '',
        is_active: p.is_active !== false,
      });
      setEditId(p.id);
    } else {
      setForm(emptyForm);
      setEditId(null);
    }
    setModalOpen(true);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    if (!form.name || !form.type) {
      toast.warning('Name and type are required');
      return;
    }
    setWorking(true);
    try {
      if (editId) {
        await promptsApi.update(editId, form);
        toast.success('Prompt updated');
      } else {
        await promptsApi.create(form);
        toast.success('Prompt created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save prompt');
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      await promptsApi.remove(confirmDelete.id);
      toast.success('Prompt deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete prompt');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading label="Loading prompts…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <MessageSquareText size={20} className="text-primary-400" /> Prompt Settings
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage AI prompt templates</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add prompt
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-500">
          <MessageSquareText size={32} className="mb-3 opacity-60" />
          <p className="text-sm">No prompts configured</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>System prompt</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th align="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-slate-100">{p.name}</td>
                    <td>
                      <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 capitalize">
                        {titleCase(p.type)}
                      </span>
                    </td>
                    <td className="max-w-xs">
                      <p className="text-slate-400 text-xs truncate" title={p.system_prompt}>
                        {p.system_prompt || '—'}
                      </p>
                    </td>
                    <td>
                      {p.is_active ? (
                        <span className="badge bg-accent-500/15 text-accent-300 border border-accent-500/30">Active</span>
                      ) : (
                        <span className="badge bg-slate-700/40 text-slate-400 border border-slate-600">Inactive</span>
                      )}
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(p.updated_at || p.created_at)}</td>
                    <td align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="btn-ghost px-2 py-1.5" onClick={() => openModal(p)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn-ghost px-2 py-1.5 text-red-400 hover:text-red-300"
                          onClick={() => setConfirmDelete(p)}
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
        title={editId ? 'Edit prompt' : 'Add prompt'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={working}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={working}>
              <Save size={16} /> {working ? 'Saving…' : 'Save prompt'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
                placeholder="e.g. Default Chat Prompt"
                disabled={working}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="input capitalize"
                disabled={working}
              >
                {PROMPT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {titleCase(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">System prompt</label>
            <textarea
              value={form.system_prompt}
              onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
              rows={5}
              className="input resize-y font-mono text-xs"
              placeholder="You are a helpful assistant…"
              disabled={working}
            />
          </div>
          <div>
            <label className="label">User template</label>
            <textarea
              value={form.user_template}
              onChange={(e) => setForm((f) => ({ ...f, user_template: e.target.value }))}
              rows={4}
              className="input resize-y font-mono text-xs"
              placeholder="{{user_input}} with context {{context}}"
              disabled={working}
            />
            <p className="text-xs text-slate-500 mt-1.5">Use {'{variable}'} placeholders for dynamic substitution.</p>
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
        title="Delete prompt"
        message={`Delete prompt "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
