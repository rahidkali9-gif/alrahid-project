import { Loader as Loader2 } from 'lucide-react';

export default function Loading({ label = 'Loading…', className = '', inline = false }) {
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 text-slate-400 ${className}`}>
        <Loader2 size={16} className="animate-spin text-primary-500" />
        {label}
      </span>
    );
  }
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-slate-400 ${className}`}>
      <Loader2 size={28} className="animate-spin text-primary-500" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
