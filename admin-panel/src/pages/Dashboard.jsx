import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  Sparkles,
  Wallet,
  UserCheck,
  CalendarPlus,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import Loading from '../components/Loading.jsx';
import { dashboardApi, analyticsApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { formatNumber, formatCredits, formatDate, titleCase } from '../utils/format.js';

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
};

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([dashboardApi.stats(), analyticsApi.get()])
      .then(([s, a]) => {
        if (!active) return;
        setStats(s?.data || null);
        setAnalytics(a?.data || null);
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load dashboard data');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) return <Loading label="Loading dashboard…" />;

  const regData = (analytics?.registrations || []).map((r) => ({
    date: formatDate(r.day, { month: 'short', day: 'numeric' }),
    users: r.count,
  }));

  const usageData = (analytics?.aiUsage || []).map((u) => ({
    type: titleCase(u.type),
    count: u.count,
    cost: Number(u.total_cost || 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={UsersIcon}
          label="Total Users"
          value={formatNumber(stats?.userCount)}
          hint={`${formatNumber(stats?.todaySignups)} joined today`}
          color="primary"
        />
        <StatCard
          icon={Sparkles}
          label="AI Generations"
          value={formatNumber(stats?.aiCount)}
          hint="All-time generations"
          color="accent"
        />
        <StatCard
          icon={Wallet}
          label="Total Credits"
          value={formatCredits(stats?.totalCredits)}
          hint="Wallet balance across users"
          color="amber"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={formatNumber(stats?.activeUsers)}
          hint={`${formatNumber(stats?.last7Signups)} new in 7 days`}
          color="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <CalendarPlus size={16} className="text-primary-400" /> Registrations over time
              </h3>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="url(#regGrad)"
                  name="New users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-accent-400" /> AI usage by type
            </h3>
            <p className="text-xs text-slate-500">Generations per AI type</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="type" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b55' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Generations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {analytics?.generationsByStatus?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Generations by status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {analytics.generationsByStatus.map((s) => (
              <div key={s.status} className="rounded-lg bg-slate-900/60 border border-slate-700 p-4">
                <p className="text-xs text-slate-400 capitalize">{s.status}</p>
                <p className="text-2xl font-semibold text-slate-100 mt-1">{formatNumber(s.count)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
