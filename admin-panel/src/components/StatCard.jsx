export default function StatCard({ icon: Icon, label, value, hint, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-500/15 text-primary-400',
    accent: 'bg-accent-500/15 text-accent-400',
    amber: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
    sky: 'bg-sky-500/15 text-sky-400',
  };

  return (
    <div className="card p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100 tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${colorMap[color] || colorMap.primary}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
