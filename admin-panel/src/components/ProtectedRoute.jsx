import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Loading from './Loading.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized, loading } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading label="Authenticating…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
