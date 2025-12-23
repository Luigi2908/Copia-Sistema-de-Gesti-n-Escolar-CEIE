
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
        if (error.message.includes("recursion")) {
          setDbError("Error crítico de configuración en la base de datos (Recursión en RLS). Por favor, ejecute el script de reparación SQL.");
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
          // Si hay sesión pero no hay perfil o hay error de DB, no forzamos logout inmediato
          // permitimos que el estado de carga termine para mostrar el error si existe
          if (!dbError) {
             await supabase.auth.signOut();
             setUser(null);
          }
        }
      } else {
        setUser(null);
      }
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
        throw new Error("El correo electrónico no ha sido confirmado en Supabase.");
      }
      throw error;
    }

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) {
        if (dbError) throw new Error(dbError);
        await supabase.auth.signOut();
        throw new Error("Acceso denegado: El usuario no tiene un perfil configurado en la base de datos.");
      }
      
      setUser(profile as User);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDbError(null);
  };
  
  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, sendPasswordReset, refreshSession }}>
      {(!loading && !dbError) ? children : (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 max-w-md">
            {dbError ? (
              <div className="animate-fade-in">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Error de Base de Datos</h2>
                <p className="text-slate-600 mb-6">{dbError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Iniciando sistema...</p>
              </>
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
