import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; dateOfBirth: string; termsAccepted: boolean }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('prism_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    try {
      if (!localStorage.getItem('prism_access_token')) {
        setIsLoading(false);
        return;
      }
      const data = await api.get('/auth/me');
      if (data && data.user) {
        setUser(data.user);
        setProfile(data.profile || null);
      }
    } catch {
      localStorage.removeItem('prism_access_token');
      localStorage.removeItem('prism_refresh_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.accessToken) {
      localStorage.setItem('prism_access_token', data.accessToken);
      localStorage.setItem('prism_refresh_token', data.refreshToken);
      setToken(data.accessToken);
      setUser(data.user);
      setProfile(data.profile || null);
    }
  };

  const register = async (payload: { email: string; password: string; dateOfBirth: string; termsAccepted: boolean }) => {
    const data = await api.post('/auth/register', payload);
    if (data.accessToken) {
      localStorage.setItem('prism_access_token', data.accessToken);
      localStorage.setItem('prism_refresh_token', data.refreshToken);
      setToken(data.accessToken);
      setUser(data.user);
      setProfile(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('prism_access_token');
    localStorage.removeItem('prism_refresh_token');
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    await fetchMe();
  };

  const isAdmin = Boolean(user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role));
  const isModerator = Boolean(user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role));
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isModerator,
        login,
        register,
        logout,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
