
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './components/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { DataProvider, useData } from './context/DataContext';
import { UserRole } from './types';
import { ExclamationTriangleIcon, LogoutIcon, CheckIcon } from './components/icons';

const MaintenanceView: React.FC<{ logout: () => void }> = ({ logout }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-rose-50/50 dark:ring-rose-900/10">
                <ExclamationTriangleIcon className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">Sistema en Pausa</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                Estamos realizando mejoras técnicas en la plataforma para brindarte una mejor experiencia. Por favor, intenta ingresar más tarde.
            </p>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</p>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-1">Mantenimiento Programado</p>
                </div>
                <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all shadow-lg text-sm dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                    <LogoutIcon className="w-5 h-5" />
                    Regresar al Inicio
                </button>
            </div>
        </div>
    </div>
);

const AppContent: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { isLoading, error } = useData();
    const [showForceButton, setShowForceButton] = useState(false);

    useEffect(() => {
        let timer: any;
        if (isLoading && isAuthenticated) {
            timer = setTimeout(() => setShowForceButton(true), 6000);
        } else {
            setShowForceButton(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated]);

    if (isLoading && isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="text-center p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full mx-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h2 className="mt-8 text-xl font-black text-slate-800 dark:text-white">Sincronizando Datos</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">Estamos preparando su entorno académico personalizado.</p>
                    
                    {showForceButton && (
                        <div className="mt-8 animate-fade-in">
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest mb-4">¿La conexión está lenta?</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full py-3.5 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg"
                            >
                                Reintentar Ahora
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (error && isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-rose-100 dark:border-rose-900/30 max-w-sm mx-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">Fallo de Comunicación</h2>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">No pudimos enlazar con los servidores centrales. Verifique su conexión.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 w-full py-3.5 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20"
                    >
                        Reintentar Enlace
                    </button>
                </div>
            </div>
        );
    }

    // Mantenimiento
    const globalSettingsRaw = localStorage.getItem('school_global_settings');
    const isMaintenance = globalSettingsRaw ? JSON.parse(globalSettingsRaw).maintenanceMode : false;
    const isRestrictedUser = user && ![UserRole.SUPER_ADMIN, UserRole.CAMPUS_ADMIN].includes(user.role);

    if (isAuthenticated && isMaintenance && isRestrictedUser) {
        return <MaintenanceView logout={logout} />;
    }
    
    return (
        <>
            {isAuthenticated ? <DashboardLayout /> : <LoginPage />}
        </>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
