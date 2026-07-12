import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints.js';
import { getToken, setToken, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

const USER_KEY = 'alrahid_admin_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const persistUser = useCallback((u) => {
    setUser(u);
    if (u) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const logout = useCallback(async (silent = false) => {
    try {
      if (!silent) await authApi.logout().catch(() => {});
    } finally {
      setToken(null);
      setTokenState(null);
      persistUser(null);
    }
  }, [persistUser]);

  // Register a 401 handler so the client can force logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setTokenState(null);
      persistUser(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  }, [persistUser]);

  // On mount: if a token exists, validate by fetching /auth/me
  useEffect(() => {
    let mounted = true;
    const t = getToken();
    if (!t) {
      setInitialized(true);
      return;
    }
    setLoading(true);
    authApi
      .me()
      .then((res) => {
        if (mounted && res?.data?.user) persistUser(res.data.user);
      })
      .catch(() => {
        if (mounted) logout(true);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [persistUser, logout]);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      const { user: u, accessToken } = res.data || {};
      if (!accessToken) throw { message: 'No access token returned' };
      setToken(accessToken);
      setTokenState(accessToken);
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  const value = {
    user,
    token,
    loading,
    initialized,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    setUser: persistUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
