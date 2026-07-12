import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-center px-4">
      <Compass size={40} className="text-primary-500 mb-4" />
      <h1 className="text-3xl font-bold text-slate-100">404</h1>
      <p className="mt-2 text-slate-400">The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
}
