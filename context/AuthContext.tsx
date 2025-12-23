
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error al obtener perfil:", error.message);
        return null;
      }

      if (!data) {
        console.warn(`No se encontró registro en 'profiles' para el ID: ${userId}`);
        return null;
      }
      
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
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) setUser(profile as User);
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
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    // 1. Autenticación técnica
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Credenciales inválidas. Verifique su correo y contraseña.");
      }
      throw error;
    }

    if (data.user) {
      // 2. Obtener el perfil
      const profile = await fetchUserProfile(data.user.id);
      
      if (!profile) {
        // Si no hay perfil, el usuario no existe en nuestra tabla lógica
        await supabase.auth.signOut();
        throw new Error("El usuario no tiene un perfil vinculado. Contacte al administrador.");
      }

      // 3. Validar Rol (Comparación robusta)
      // Normalizamos ambos strings para evitar errores de espacios o mayúsculas
      const dbRole = String(profile.role).trim().toLowerCase();
      const selectedRole = String(role).trim().toLowerCase();

      if (dbRole !== selectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado: Has seleccionado el perfil de '${role}', pero tu cuenta está registrada como '${profile.role}'.`);
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
