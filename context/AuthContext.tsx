
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

  // Mapeo centralizado de datos del perfil con soporte para campos opcionales definidos en la interfaz User
  const mapProfileData = (data: any): User => ({
    id: data.id,
    name: data.name || 'Usuario',
    email: data.email,
    role: (data.role as UserRole),
    campusId: data.campus_id,
    campusName: data.campus_name,
    avatar: data.avatar || `https://ui-avatars.com/api/?name=${(data.name || 'U').replace(' ', '+')}`,
    class: data.class,
    section: data.section,
    rollNumber: data.roll_number,
    documentNumber: data.document_number,
    phone: data.phone,
    financialStatus: data.financial_status,
    status: data.status
  });

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data && email) {
        // Fallback: Buscar por email si el ID no coincide (común en migraciones)
        const { data: dataByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (dataByEmail) {
          await supabase.from('profiles').update({ id: userId }).eq('email', email);
          return mapProfileData({ ...dataByEmail, id: userId });
        }
        return null;
      }

      return data ? mapProfileData(data) : null;
    } catch (e) {
      console.error("Error en fetchUserProfile:", e);
      return null;
    }
  };

  // Se extrae initializeAuth para ser accesible en el Provider
  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        setUser(profile);
      }
    } catch (e) {
      console.error("Error inicializando auth:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Control de carga global: Máximo 12 segundos para todo el proceso de Auth
    const globalAuthTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth Timeout: Forzando visualización de App");
        setLoading(false);
      }
    }, 12000);

    // Inicialización del estado de autenticación
    initializeAuth().then(() => {
        clearTimeout(globalAuthTimeout);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const profile = await fetchUserProfile(session.user.id, session.user.email);
          if (profile) {
            // Validación de rol estricta solo si hay un rol intencionado (Login manual)
            if (intendedRole && profile.role !== intendedRole) {
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setUser(profile);
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIntendedRole(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(globalAuthTimeout);
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
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Iniciando Ecosistema...</p>
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