/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext(null);

function readSavedUser() {
  const saved = localStorage.getItem('user') || localStorage.getItem('admin_user');
  try {
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function readSavedToken() {
  return localStorage.getItem('token')
    || localStorage.getItem('admin_token')
    || sessionStorage.getItem('b8-token')
    || sessionStorage.getItem('b8-teacher-token')
    || null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readSavedToken);
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(true);

  const syncTokens = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('admin_token', newToken);
      sessionStorage.setItem('b8-token', newToken);
      sessionStorage.setItem('b8-teacher-token', newToken);
    }

    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('admin_user', JSON.stringify(newUser));
      sessionStorage.setItem('b8-auth-v1', JSON.stringify({ access_token: newToken, user: newUser }));
    }
  };

  const clearTokens = () => {
    setToken(null);
    setUser(null);
    ['token', 'admin_token', 'user', 'admin_user'].forEach((key) => localStorage.removeItem(key));
    ['b8-token', 'b8-teacher-token', 'b8-auth-v1'].forEach((key) => sessionStorage.removeItem(key));
  };

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const activeToken = readSavedToken();
      if (!activeToken) {
        if (mounted) {
          clearTokens();
          setLoading(false);
        }
        return;
      }

      try {
        const freshUser = await apiFetch('/auth/me');
        const validRoles = ['admin', 'teacher', 'student', 'parent'];
        if (!freshUser || !validRoles.includes(freshUser.role)) throw new Error('Sesi tidak valid');
        if (mounted) syncTokens(activeToken, freshUser);
      } catch {
        if (mounted) clearTokens();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    verifySession();
    return () => { mounted = false; };
  }, []);

  const login = async ({ identifier, email, password }) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: identifier || email, email, password }),
    });
    if (!data?.token || !data?.user) throw new Error('Respons login tidak valid dari server.');
    syncTokens(data.token, data.user);
    return data.user;
  };

  const updateProfile = async (profileData) => {
    const updated = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    syncTokens(token, updated);
    return updated;
  };

  const updatePassword = async (newPassword) => apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  });

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user?.role),
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent',
    loading,
    login,
    logout: clearTokens,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
