
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      // Intento 1: Por ID de Supabase
      let { data, error }: any = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Intento 2: Fallback por Email (Crucial para nuevos registros)
      if (!data && email) {
        const { data: dataByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (dataByEmail) {
          // Sincronizar ID de forma transparente
          await supabase.from('profiles').update({ id: userId }).eq('email', email);
          data = { ...dataByEmail, id: userId };
        }
      }

      if (!data) return null;
      
      return {
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
          history: data.history
      };
    } catch (e) {
      console.error("Error crítico en fetchUserProfile:", e);
      return null;
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        setUser(profile ? (profile as User) : null);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Fallo al refrescar sesión:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Seguridad: Timeout de 8 segundos para evitar carga infinita
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Safety timeout activado: Forzando fin de carga.");
        setLoading(false);
      }
    }, 8000);

    refreshSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session) {
          const profile = await fetchUserProfile(session.user.id, session.user.email);
          setUser(profile ? (profile as User) : null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error en cambio de estado de Auth:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw new Error("Credenciales inválidas o error de conexión.");

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id, data.user.email);
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Su perfil no está registrado en la base de datos.");
      }
      if (profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado: Usted tiene el rol '${profile.role}'.`);
      }
      setUser(profile as User);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };
  
  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, sendPasswordReset, refreshSession }}>
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-black animate-pulse text-[10px] uppercase tracking-[0.2em] text-center px-4">
              Sincronizando Identidad Escolar...<br/>
              <span className="text-[8px] opacity-60">Por favor espere un momento</span>
            </p>
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
