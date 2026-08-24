import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthContext } from './AuthContextValue';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('burdenoff_token');
      const storedUser = localStorage.getItem('burdenoff_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('burdenoff_token');
      localStorage.removeItem('burdenoff_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('burdenoff_token', newToken);
    localStorage.setItem('burdenoff_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('burdenoff_token');
    localStorage.removeItem('burdenoff_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAgent: user?.role === 'AGENT',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
