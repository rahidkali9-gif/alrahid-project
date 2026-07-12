import { useEffect, useState, useCallback } from 'react';
import { Palette, Save, RefreshCw } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import { appSettingsApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';

const THEME_KEYS = ['app_name', 'primary_color', 'secondary_color', 'logo_url', 'theme'];

const PRESET_COLORS = ['#14b8a6', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ThemeSettings() {
  const toast = useToast();
  const [form, setForm] = useState({
    app_name: '',
    primary_color: '#14b8a6',
    secondary_color: '#10b981',
    logo_url: '',
    theme: 'dark',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    appSettingsApi
      .list()
      .then((res) => {
        const settings = res?.data?.settings || [];
        const map = {};
        settings.forEach((s) => {
          map[s.key] = s.value;
        });
        setForm({
          app_name: map.app_name || 'Al Rahid',
          primary_color: map.primary_color || '#14b8a6',
          secondary_color: map.secondary_color || '#10b981',
          logo_url: map.logo_url || '',
          theme: map.theme || 'dark',
        });
      })
      .catch((err) => toast.error(err?.message || 'Failed to load theme settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) =>
          appSettingsApi.upsert({ key, value, category: 'branding', isPublic: true })
        )
      );
      toast.success('Theme settings saved');
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading theme settings…" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Palette size={20} className="text-primary-400" /> Theme Settings
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Edit app branding stored in app settings</p>
      </div>

      <form onSubmit={save} className="card p-6 space-y-5 max-w-2xl">
        <div>
          <label className="label">App name</label>
          <input
            name="app_name"
            value={form.app_name}
            onChange={onChange}
            className="input"
            placeholder="Al Rahid"
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Primary color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="primary_color"
                value={form.primary_color}
                onChange={onChange}
                className="h-10 w-14 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
                disabled={saving}
              />
              <input
                name="primary_color"
                value={form.primary_color}
                onChange={onChange}
                className="input font-mono"
                disabled={saving}
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, primary_color: c }))}
                  className="h-6 w-6 rounded-md border border-slate-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Secondary color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="secondary_color"
                value={form.secondary_color}
                onChange={onChange}
                className="h-10 w-14 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
                disabled={saving}
              />
              <input
                name="secondary_color"
                value={form.secondary_color}
                onChange={onChange}
                className="input font-mono"
                disabled={saving}
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, secondary_color: c }))}
                  className="h-6 w-6 rounded-md border border-slate-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Logo URL</label>
          <input
            name="logo_url"
            value={form.logo_url}
            onChange={onChange}
            className="input"
            placeholder="https://… or /logo.png"
            disabled={saving}
          />
          {form.logo_url && (
            <div className="mt-3 rounded-lg bg-slate-900 border border-slate-700 p-3 inline-flex">
              <img
                src={form.logo_url}
                alt="Logo preview"
                className="h-10 max-w-[200px] object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="label">Theme mode</label>
          <select name="theme" value={form.theme} onChange={onChange} className="input sm:w-48" disabled={saving}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save theme'}
          </button>
          <button type="button" className="btn-secondary" onClick={load} disabled={saving}>
            Reset
          </button>
        </div>
      </form>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Live preview</h3>
        <div className="rounded-xl border border-slate-700 p-5 bg-slate-900">
          <div className="flex items-center gap-3">
            {form.logo_url ? (
              <img
                src={form.logo_url}
                alt="preview"
                className="h-8 w-8 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: form.primary_color }}
              >
                {(form.app_name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-lg font-bold text-slate-100">{form.app_name || 'Al Rahid'}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: form.primary_color, color: '#fff' }}
            >
              Primary
            </button>
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: form.secondary_color, color: '#fff' }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
