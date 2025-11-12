import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

  // Restore token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthed(!!token);
  }, []);

  // Try real login first (email/password), then fallback to demo password endpoint
  const login = useCallback(async (password, email = 'admin@example.com') => {
    try {
      // primary: real login
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (resp.ok) {
        const data = await resp.json().catch(() => ({}));
        if (data?.token) localStorage.setItem('token', data.token);
        setIsAuthed(true);
        setError(null);
        return true;
      }
      // fallback: demo endpoint
      const demoResp = await fetch(`${API_BASE}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const demoData = await demoResp.json().catch(() => ({}));
      if (!demoResp.ok) {
        setError(demoData?.message || 'Invalid credentials');
        setIsAuthed(false);
        return false;
      }
      if (demoData?.token) localStorage.setItem('token', demoData.token);
      setIsAuthed(true);
      setError(null);
      return true;
    } catch (e) {
      setError('Network error');
      setIsAuthed(false);
      return false;
    }
  }, [API_BASE]);

  const logout = useCallback(() => {
    setIsAuthed(false);
    setError(null);
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
