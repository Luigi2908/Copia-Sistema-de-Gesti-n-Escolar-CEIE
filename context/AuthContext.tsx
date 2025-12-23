
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

  const fetchUserProfile = async (userId: string) => {
    try {
      // Timeout manual para la base de datos (4 segundos)
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de base de datos')), 4000)
      );

      const { data, error }: any = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        console.error("Error al obtener perfil:", error.message);
        return null;
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
          schoolPeriod: data.school_period,
          schoolYear: data.school_year,
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
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
            setUser(profile as User);
        } else {
            // Si el usuario está autenticado en Auth pero no tiene perfil,
            // permitimos el acceso limitado o forzamos logout si es necesario.
            setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
        console.error("Error en refreshSession:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) setUser(profile as User);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("El correo o la contraseña son incorrectos.");
      }
      throw error;
    }

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Su cuenta de usuario no tiene un perfil configurado en la base de datos.");
      }
      if (profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado: Su perfil es de '${profile.role}' y no de '${role}'.`);
      }
      setUser(profile as User);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
            <p className="text-slate-400 font-medium animate-pulse text-sm">Iniciando sistema...</p>
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
