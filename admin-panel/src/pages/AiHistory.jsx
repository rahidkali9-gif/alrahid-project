import { useEffect, useState, useCallback } from 'react';
import DataTable from '../components/DataTable.jsx';
import Loading from '../components/Loading.jsx';
import { aiApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDateTime, formatCredits, truncate, titleCase } from '../utils/format.js';

const STATUS_BADGE = {
  completed: 'bg-accent-500/15 text-accent-300 border border-accent-500/30',
  success: 'bg-accent-500/15 text-accent-300 border border-accent-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  processing: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  failed: 'bg-red-500/15 text-red-300 border border-red-500/30',
  error: 'bg-red-500/15 text-red-300 border border-red-500/30',
};

export default function AiHistory() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    aiApi
      .history(params)
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { page, limit: 20, total: 0, totalPages: 0 });
      })
      .catch((err) => toast.error(err?.message || 'Failed to load AI history'))
      .finally(() => setLoading(false));
  }, [page, typeFilter, statusFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'created_at',
      header: 'Date',
      render: (r) => <span className="text-slate-400 whitespace-nowrap">{formatDateTime(r.created_at)}</span>,
    },
    {
      key: 'user_id',
      header: 'User',
      render: (r) => <span className="text-xs text-slate-400 font-mono">{r.user_id || '—'}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 capitalize">
          {titleCase(r.type)}
        </span>
      ),
    },
    {
      key: 'prompt',
      header: 'Prompt',
      render: (r) => (
        <span className="text-slate-300 text-sm" title={r.prompt}>
          {truncate(r.prompt, 60)}
        </span>
      ),
    },
    {
      key: 'model',
      header: 'Model',
      render: (r) => <span className="text-slate-400 text-xs">{r.model || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`badge capitalize ${STATUS_BADGE[r.status] || 'bg-slate-600/30 text-slate-300 border border-slate-600'}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'cost',
      header: 'Cost',
      align: 'right',
      render: (r) => <span className="text-slate-300 tabular-nums">{formatCredits(r.cost)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">AI History</h2>
        <p className="text-sm text-slate-400 mt-0.5">All AI generations across users</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="input sm:w-44"
        >
          <option value="">All types</option>
          <option value="chat">Chat</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="voice">Voice</option>
          <option value="music">Music</option>
          <option value="logo">Logo</option>
          <option value="resume">Resume</option>
          <option value="presentation">Presentation</option>
          <option value="code">Code</option>
          <option value="website">Website</option>
          <option value="app">App</option>
          <option value="email">Email</option>
          <option value="document">Document</option>
          <option value="pdf-summary">PDF Summary</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        pagination={meta}
        onPageChange={setPage}
        loading={loading}
        emptyLabel="No AI generations found"
      />
    </div>
  );
}
