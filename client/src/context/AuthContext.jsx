/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('admin_token') ||
      sessionStorage.getItem('b8-token') ||
      null
    );
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user') || localStorage.getItem('admin_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Helper untuk sinkronisasi token dan user di berbagai storage (kompatibel lintas modul)
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
      sessionStorage.setItem(
        'b8-auth-v1',
        JSON.stringify({ access_token: newToken, user: newUser })
      );
    }
  };

  const clearTokens = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('b8-token');
    sessionStorage.removeItem('b8-teacher-token');
    sessionStorage.removeItem('b8-auth-v1');
  };

  // Verifikasi sesi saat aplikasi dimuat
  useEffect(() => {
    const verifySession = async () => {
      const activeToken =
        localStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        sessionStorage.getItem('b8-token');

      if (!activeToken) {
        clearTokens();
        setLoading(false);
        return;
      }

      try {
        const freshUser = await apiFetch('/auth/me');
        const validRoles = ['admin', 'teacher', 'student', 'parent'];

        if (freshUser && validRoles.includes(freshUser.role)) {
          syncTokens(activeToken, freshUser);
        } else {
          throw new Error('Sesi tidak valid');
        }
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  /**
   * Login universal untuk semua role:
   * - admin
   * - teacher
   * - student
   * - parent (menggunakan NIS)
   */
  const login = async ({ identifier, email, password }) => {
    const loginIdentifier = identifier || email;

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: loginIdentifier,
        email,
        password,
      }),
    });

    if (!data?.token || !data?.user) {
      throw new Error('Respons login tidak valid dari server.');
    }

    syncTokens(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    clearTokens();
  };

  const updateProfile = async (profileData) => {
    const updated = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    syncTokens(token, updated);
    return updated;
  };

  const updatePassword = async (newPassword) => {
    return await apiFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user && user.role),
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent',
    loading,
    login,
    logout,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
