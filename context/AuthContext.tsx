
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processUser = (rawUser: any): User => {
    return {
      ...rawUser,
      role: rawUser.role || 'STUDENT',
      name: [rawUser.first_name, rawUser.last_name].filter(Boolean).join(' ') || 'User',
      firstName: rawUser.first_name || rawUser.firstName,
      lastName: rawUser.last_name || rawUser.lastName,
      subscribedBatchIds: rawUser.subscribedBatchIds || rawUser.subscribed_batches || []
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dc_token');
      if (token) {
        try {
          const userData = await api.auth.me();
          setUser(processUser(userData));
        } catch (e) {
          localStorage.removeItem('dc_token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(email, pass);
      if (response && response.token) {
        localStorage.setItem('dc_token', response.token);
        setUser(processUser(response.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed", e);
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dc_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
