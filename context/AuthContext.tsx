
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
      // 1. Intento primario: Buscar por ID (UID de Auth)
      let { data, error }: any = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 2. Intento secundario (Fallback): Si no hay por ID, buscar por Email
      // Esto soluciona problemas de perfiles creados manualmente sin el ID de Auth correcto
      if (!data && email) {
        const { data: dataByEmail, error: errorEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (dataByEmail) {
          console.log("Perfil encontrado por email, sincronizando ID...");
          // Actualizamos el ID del perfil antiguo para que coincida con el nuevo UID de Auth
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ id: userId })
            .eq('email', email);
            
          if (!updateError) data = { ...dataByEmail, id: userId };
          else data = dataByEmail;
        }
      }

      if (error || !data) {
        console.error("No se encontró perfil para:", userId, email);
        return null;
      }
      
      // Normalización de datos para la aplicación
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
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        if (profile) {
            setUser(profile as User);
        } else {
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
        const profile = await fetchUserProfile(session.user.id, session.user.email);
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
      const profile = await fetchUserProfile(data.user.id, email);
      
      if (!profile) {
        // Si no hay perfil, cerramos la sesión de Auth inmediatamente para no quedar en limbo
        await supabase.auth.signOut();
        throw new Error("Su cuenta de usuario no tiene un perfil configurado en la base de datos (Tabla: profiles).");
      }
      
      // Verificación de Rol estricta (Case Sensitive check)
      if (profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado: Su perfil en la base de datos es '${profile.role}' y usted intentó ingresar como '${role}'.`);
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
            <p className="text-slate-400 font-medium animate-pulse text-sm">Validando perfil...</p>
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
