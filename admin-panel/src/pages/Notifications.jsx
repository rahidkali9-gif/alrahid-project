import { useEffect, useState, useCallback } from 'react';
import { Send, Bell } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Loading from '../components/Loading.jsx';
import { notificationsApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDateTime } from '../utils/format.js';

export default function Notifications() {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', message: '', type: 'info', userId: '' });
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    notificationsApi
      .mine({ page, limit: 20 })
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { page, limit: 20, total: 0, totalPages: 0 });
      })
      .catch((err) => toast.error(err?.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const send = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.warning('Title and message are required');
      return;
    }
    setSending(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        ...(form.userId ? { userId: form.userId } : {}),
      };
      const res = await notificationsApi.broadcast(payload);
      const sent = res?.data?.sent ?? 0;
      toast.success(`Notification sent${form.userId ? '' : ` to ${sent} users`}`);
      setForm({ title: '', message: '', type: 'info', userId: '' });
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const columns = [
    {
      key: 'created_at',
      header: 'Sent',
      render: (r) => <span className="text-slate-400 whitespace-nowrap">{formatDateTime(r.created_at)}</span>,
    },
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-slate-100">{r.title}</span> },
    {
      key: 'message',
      header: 'Message',
      render: (r) => <span className="text-slate-400 text-sm">{r.message}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span className="badge capitalize bg-primary-500/15 text-primary-300 border border-primary-500/30">
          {r.type}
        </span>
      ),
    },
    {
      key: 'user_id',
      header: 'Recipient',
      render: (r) => (
        <span className="text-xs text-slate-400">{r.user_id ? `User ${r.user_id}` : 'All users'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Notifications</h2>
        <p className="text-sm text-slate-400 mt-0.5">Broadcast notifications to users</p>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Send size={16} className="text-primary-400" /> Compose notification
        </h3>
        <form onSubmit={send} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="input"
                placeholder="Notification title"
                disabled={sending}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select name="type" value={form.type} onChange={onChange} className="input" disabled={sending}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={3}
              className="input resize-y"
              placeholder="Write the notification message…"
              disabled={sending}
            />
          </div>
          <div>
            <label className="label">Recipient (optional)</label>
            <input
              name="userId"
              value={form.userId}
              onChange={onChange}
              className="input"
              placeholder="Leave empty to send to all active users"
              disabled={sending}
            />
            <p className="text-xs text-slate-500 mt-1.5">Enter a user ID to send to a specific user only.</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={sending}>
              <Send size={16} /> {sending ? 'Sending…' : 'Send notification'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Bell size={16} className="text-accent-400" /> Sent notifications
        </h3>
        <DataTable
          columns={columns}
          data={rows}
          pagination={meta}
          onPageChange={setPage}
          loading={loading}
          emptyLabel="No notifications sent yet"
        />
      </div>
    </div>
  );
}
