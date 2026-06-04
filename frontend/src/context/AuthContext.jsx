import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('roopvibe_auth') === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('roopvibe_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('roopvibe_auth', isLoggedIn);
    if (user) {
      localStorage.setItem('roopvibe_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roopvibe_user');
    }
  }, [isLoggedIn, user]);

  const login = ({ token, user }) => {
    setIsLoggedIn(true);
    setUser(user || { name: 'User', email: 'user@example.com' });
    if (token) localStorage.setItem('roopvibe_token', token);
  };

  const fetchMe = async () => {
    const token = localStorage.getItem('roopvibe_token');
    if (!token) return;

    try {
      const mod = await import('../Api/Authapi');
      const data = await mod.fetchMe(token);
      if (data?.success && data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (e) {
      // token invalid -> logout
      localStorage.removeItem('roopvibe_token');
      setIsLoggedIn(false);
      setUser(null);
    }
  };


  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('roopvibe_auth');
    localStorage.removeItem('roopvibe_user');
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

