import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, History, Upload, Bell, Settings, KeyRound, Activity, ChartBar as BarChart3, Palette, Cpu, MessageSquareText, Image, Megaphone } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/ai-history', label: 'AI History', icon: History },
  { to: '/uploads', label: 'Uploads', icon: Upload },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/api-keys', label: 'API Keys', icon: KeyRound },
  { to: '/activity-logs', label: 'Activity Logs', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/theme-settings', label: 'Theme Settings', icon: Palette },
  { to: '/model-settings', label: 'Model Settings', icon: Cpu },
  { to: '/prompt-settings', label: 'Prompt Settings', icon: MessageSquareText },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/ads', label: 'Ads Config', icon: Megaphone },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800 shrink-0">
          <div className="rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 p-2">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-100">Al Rahid</p>
            <p className="text-[11px] text-primary-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-3 shrink-0">
          <p className="text-[11px] text-slate-500">v1.0.0 · © Al Rahid</p>
        </div>
      </aside>
    </>
  );
}
