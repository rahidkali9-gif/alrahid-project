import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Loading from '../components/Loading.jsx';
import { analyticsApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate, formatNumber, formatCredits, titleCase } from '../utils/format.js';

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
};

const AXIS = { stroke: '#64748b', fontSize: 11, tickLine: false, axisLine: false };

export default function Analytics() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    analyticsApi
      .get()
      .then((res) => active && setData(res?.data || null))
      .catch((err) => toast.error(err?.message || 'Failed to load analytics'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) return <Loading label="Loading analytics…" />;

  const regData = (data?.registrations || []).map((r) => ({
    date: formatDate(r.day, { month: 'short', day: 'numeric' }),
    users: r.count,
  }));

  const usageData = (data?.aiUsage || []).map((u) => ({
    type: titleCase(u.type),
    count: u.count,
    cost: Number(u.total_cost || 0),
  }));

  const walletData = (data?.walletFlow || []).map((w) => ({
    type: titleCase(w.type),
    amount: Number(w.total || 0),
    count: w.count,
  }));

  const statusData = (data?.generationsByStatus || []).map((s) => ({
    status: titleCase(s.status),
    count: s.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">Platform trends and usage insights</p>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Daily registrations</h3>
        <p className="text-xs text-slate-500 mb-4">User signups over the last 30 days</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={regData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" {...AXIS} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#14b8a6' }}
                name="New users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">AI usage by type</h3>
          <p className="text-xs text-slate-500 mb-4">Generation count per AI category</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="type" {...AXIS} />
                <YAxis {...AXIS} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b55' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Generations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Wallet flow</h3>
          <p className="text-xs text-slate-500 mb-4">Transaction volume by type</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={walletData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="type" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="url(#walletGrad)"
                  name="Amount"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Active users (registrations trend)</h3>
        <p className="text-xs text-slate-500 mb-4">Cumulative signup momentum</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={regData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" {...AXIS} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="New users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {statusData.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Generation status breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusData.map((s) => (
              <div key={s.status} className="rounded-lg bg-slate-900/60 border border-slate-700 p-4">
                <p className="text-xs text-slate-400">{s.status}</p>
                <p className="text-2xl font-semibold text-slate-100 mt-1">{formatNumber(s.count)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
