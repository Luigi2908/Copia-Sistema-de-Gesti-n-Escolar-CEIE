
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Auth init error:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setLoading(true);
    
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Accept any password for local dev, or hardcode '123456'
    if (password) {
      const mockUser: User = {
        id: 'mock-id-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: role,
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}`,
        status: 'active'
      };
      
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
    } else {
      setLoading(false);
      throw new Error('Invalid login credentials');
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('auth_user');
    setUser(null);
    setLoading(false);
  };

  const sendPasswordReset = async (email: string) => {
    console.log("Password reset sent to", email);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, sendPasswordReset, refreshSession: initializeAuth }}>
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Sincronizando Identidad</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
