import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { notificationsApi } from '../api/endpoints.js';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    notificationsApi
      .unreadCount()
      .then((res) => active && setUnread(res?.data?.count || 0))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-300 hover:text-slate-100 rounded-lg p-1.5 hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-slate-200 hidden sm:block">Al Rahid Admin</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-slate-300 hover:text-slate-100 rounded-lg p-2 hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-slate-800"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
              {initial}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm text-slate-100 font-medium max-w-[140px] truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[11px] text-slate-400 capitalize">{user?.role || 'admin'}</p>
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 card p-1.5 z-20 shadow-xl">
                <div className="px-3 py-2.5 border-b border-slate-700 mb-1">
                  <p className="text-sm text-slate-100 font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700/60 hover:text-slate-100"
                >
                  <UserIcon size={16} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
