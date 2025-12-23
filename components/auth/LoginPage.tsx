
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import { EyeIcon, EyeSlashIcon, GoogleIcon, ShieldCheckIcon } from '../icons';
import Footer from '../layout/Footer';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CAMPUS_ADMIN); // Cambiado a Campus Admin por defecto
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const schoolName = 'Sistema de Gestión CEIE';
  const schoolLogo = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHBsMGdhaWJpamQ0OGxuYm85N2pyZ2F3YWdycjR2Ymtza2s2dzJhYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7t3XLkAB0fX7WEFs0/giphy.gif';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
        await login(email.trim(), password, role);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
              <div className="bg-white p-4 rounded-3xl shadow-xl inline-block mb-4 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <img src={schoolLogo} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{schoolName}</h1>
              <p className="text-slate-500 text-sm mt-2 dark:text-slate-400 font-medium">Ingresa a tu cuenta institucional</p>
          </div>

          <Card className="shadow-2xl border-none p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 flex items-start gap-3 animate-shake">
                      <span className="text-lg">⚠️</span>
                      <span className="leading-tight">{error}</span>
                  </div>
              )}

              <div>
                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder="admin@ejemplo.com"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" htmlFor="role">
                  Perfil de Acceso
                </label>
                <div className="relative group">
                  <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white appearance-none cursor-pointer"
                  >
                      {Object.values(UserRole).map((r) => (
                          <option key={r} value={r}>{r}</option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <button
                disabled={isLoading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-700 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 text-sm uppercase tracking-widest mt-2"
                type="submit"
              >
                {isLoading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-3 p-3.5 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700/50">
                <GoogleIcon className="w-5 h-5" />
                Continuar con Google
            </button>
          </Card>
          
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheckIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Conexión Segura CEIE</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic text-center">
                Asegúrate de seleccionar el rol correcto asignado a tu perfil para evitar errores de acceso.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
