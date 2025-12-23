
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
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error de base de datos al buscar perfil:", error.message);
        if (error.message.includes("recursion") || error.message.includes("infinite")) {
          setDbError("Error de recursión en RLS detectado. Por favor, ejecute el script de reparación SQL en Supabase.");
        }
        return null;
      }

      if (!data) {
        console.warn("No existe fila en la tabla 'profiles' para el ID:", userId);
        return null;
      }
      
      return {
          id: data.id,
          name: data.name || 'Usuario sin nombre',
          email: data.email,
          role: (data.role as UserRole) || UserRole.STUDENT,
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
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error obteniendo sesión:", error.message);
        setLoading(false);
        return;
      }

      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUser(profile as User);
        } else {
          // Si hay sesión de Auth pero no hay perfil en la tabla, cerramos sesión para evitar bucles
          console.warn("Sesión activa de Auth pero sin perfil. Forzando logout.");
          await supabase.auth.signOut();
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
        if (profile) {
          setUser(profile as User);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setDbError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setDbError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        throw new Error("El correo electrónico no ha sido confirmado.");
      }
      throw error;
    }

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Acceso denegado: No se encontró su perfil académico en la base de datos.");
      }
      setUser(profile as User);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
        await supabase.auth.signOut();
        setUser(null);
        setDbError(null);
    } finally {
        setLoading(false);
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, sendPasswordReset, refreshSession }}>
      {(!loading && !dbError) ? children : (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
          <div className="text-center p-8 max-w-md animate-fade-in">
            {dbError ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-900/30">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Error de Sincronización</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">{dbError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all"
                >
                  Reintentar Conexión
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    </div>
                </div>
                <div>
                    <p className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Portal CEIE</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Iniciando sistema seguro...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
