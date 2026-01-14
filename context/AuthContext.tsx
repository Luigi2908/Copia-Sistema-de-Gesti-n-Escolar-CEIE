
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

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
  const [intendedRole, setIntendedRole] = useState<UserRole | null>(null);

  const mapProfileData = (data: any, sessionUser?: any): User => ({
    id: data?.id || sessionUser?.id || '',
    name: data?.name || sessionUser?.email?.split('@')[0] || 'Usuario',
    email: data?.email || sessionUser?.email || '',
    role: (data?.role as UserRole) || (intendedRole as UserRole) || UserRole.STUDENT,
    campusId: data?.campus_id,
    campusName: data?.campus_name,
    avatar: data?.avatar || `https://ui-avatars.com/api/?name=${(data?.name || 'U').replace(' ', '+')}`,
    class: data?.class,
    section: data?.section,
    rollNumber: data?.roll_number,
    documentNumber: data?.document_number,
    phone: data?.phone,
    financialStatus: data?.financial_status,
    status: data?.status || 'active'
  });

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) return null;
      if (data) return mapProfileData(data);

      if (email) {
        const { data: dataByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (dataByEmail) {
          // Intento de reparación de ID en segundo plano
          supabase.from('profiles').update({ id: userId }).eq('email', email).then();
          return mapProfileData(dataByEmail);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // PRIORIDAD: Mostrar la app rápido
        setLoading(false); 
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        // Si no hay perfil, creamos uno de emergencia con los datos de Supabase Auth
        setUser(profile || mapProfileData(null, session.user));
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  }, [intendedRole]);

  useEffect(() => {
    // Timeout de seguridad extremo (5s) para no dejar al usuario en la pantalla de carga
    const safetyTimer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setLoading(false); // Liberar UI inmediatamente
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        const finalUser = profile || mapProfileData(null, session.user);
        
        if (intendedRole && finalUser.role !== intendedRole && profile) {
          // Solo cerramos sesión si el perfil de DB confirma un rol diferente
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(finalUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [intendedRole, initializeAuth]);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIntendedRole(role);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setIntendedRole(null);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const sendPasswordReset = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email);
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
