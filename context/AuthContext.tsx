
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const savedUser = localStorage.getItem('school_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    // Simulación de delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Lógica especial para Super Admin inicial
    if (email === 'luissalberto26@gmail.com' && password === 'password' && role === UserRole.SUPER_ADMIN) {
        const superUser: User = {
            id: 'super-admin-01',
            name: 'Luis Salberto',
            email: 'luissalberto26@gmail.com',
            role: UserRole.SUPER_ADMIN,
            avatar: 'https://ui-avatars.com/api/?name=Luis+Salberto&background=005A9C&color=fff'
        };
        setUser(superUser);
        localStorage.setItem('school_current_user', JSON.stringify(superUser));
        return;
    }

    // Buscar en datos locales según el rol
    let storageKey = '';
    switch (role) {
        case UserRole.CAMPUS_ADMIN: storageKey = 'school_admins'; break;
        case UserRole.TEACHER: storageKey = 'school_teachers'; break;
        case UserRole.STUDENT: storageKey = 'school_students'; break;
        case UserRole.PARENT: storageKey = 'school_parents'; break;
        default: throw new Error('Rol no válido');
    }

    const users = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
        throw new Error('Usuario no encontrado o credenciales incorrectas.');
    }

    // En un sistema real aquí se validaría el hash del password
    setUser(foundUser);
    localStorage.setItem('school_current_user', JSON.stringify(foundUser));
  };

  const logout = () => {
    localStorage.removeItem('school_current_user');
    setUser(null);
  };
  
  const sendPasswordReset = async (email: string) => {
    console.log(`Enviando enlace de recuperación a: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, sendPasswordReset, refreshSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
