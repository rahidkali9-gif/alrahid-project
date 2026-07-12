import { useEffect, useState, useCallback } from 'react';
import DataTable from '../components/DataTable.jsx';
import { activityApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDateTime, titleCase } from '../utils/format.js';

export default function ActivityLogs() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (userId) params.userId = userId;
    if (category) params.category = category;
    activityApi
      .list(params)
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { page, limit: 20, total: 0, totalPages: 0 });
      })
      .catch((err) => toast.error(err?.message || 'Failed to load activity logs'))
      .finally(() => setLoading(false));
  }, [page, userId, category, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'created_at',
      header: 'Timestamp',
      render: (r) => <span className="text-slate-400 whitespace-nowrap">{formatDateTime(r.created_at)}</span>,
    },
    {
      key: 'user_id',
      header: 'User',
      render: (r) => <span className="text-xs text-slate-400 font-mono">{r.user_id || '—'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (r) => (
        <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 capitalize">
          {titleCase(r.category)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => <span className="text-slate-200 text-sm font-medium">{titleCase(r.action)}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (r) => <span className="text-slate-400 text-sm">{r.description || r.details || '—'}</span>,
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.ip_address || r.ip || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Activity Logs</h2>
        <p className="text-sm text-slate-400 mt-0.5">Audit trail of user activity</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setPage(1);
          }}
          className="input sm:w-48"
          placeholder="Filter by user ID…"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="input sm:w-44"
        >
          <option value="">All categories</option>
          <option value="auth">Auth</option>
          <option value="ai">AI</option>
          <option value="wallet">Wallet</option>
          <option value="upload">Upload</option>
          <option value="settings">Settings</option>
          <option value="notification">Notification</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        pagination={meta}
        onPageChange={setPage}
        loading={loading}
        emptyLabel="No activity logs found"
      />
    </div>
  );
}
