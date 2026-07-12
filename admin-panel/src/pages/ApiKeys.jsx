import { useEffect, useState, useCallback } from 'react';
import { KeyRound, Ban } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Loading from '../components/Loading.jsx';
import { apiKeysApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDateTime } from '../utils/format.js';

export default function ApiKeys() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiKeysApi
      .list({ page, limit: 20 })
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { page, limit: 20, total: 0, totalPages: 0 });
      })
      .catch((err) => toast.error(err?.message || 'Failed to load API keys'))
      .finally(() => setLoading(false));
  }, [page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'key_id',
      header: 'Key ID',
      render: (r) => <span className="font-mono text-xs text-primary-300">{r.key_id || r.id}</span>,
    },
    {
      key: 'user_id',
      header: 'User',
      render: (r) => <span className="text-xs text-slate-400 font-mono">{r.user_id || '—'}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (r) => <span className="text-slate-200 text-sm">{r.name || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.is_revoked || r.revoked ? (
          <span className="badge bg-red-500/15 text-red-300 border border-red-500/30">Revoked</span>
        ) : (
          <span className="badge bg-accent-500/15 text-accent-300 border border-accent-500/30">Active</span>
        ),
    },
    {
      key: 'last_used_at',
      header: 'Last used',
      render: (r) => <span className="text-slate-400 text-xs">{formatDateTime(r.last_used_at)}</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (r) => <span className="text-slate-400 text-xs">{formatDateTime(r.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <KeyRound size={20} className="text-primary-400" /> API Keys
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">All API keys across users (read-only view)</p>
      </div>

      <div className="card p-4 flex items-start gap-3 text-sm text-slate-400">
        <Ban size={18} className="text-amber-400 mt-0.5 shrink-0" />
        <p>
          For security, keys are displayed with limited detail. To revoke a key, use the per-user management
          endpoints. This view provides an audit overview of all keys issued on the platform.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        pagination={meta}
        onPageChange={setPage}
        loading={loading}
        emptyLabel="No API keys found"
      />
    </div>
  );
}
