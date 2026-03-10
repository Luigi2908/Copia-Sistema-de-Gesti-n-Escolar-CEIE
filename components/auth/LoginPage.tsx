
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import { EyeIcon, EyeSlashIcon, GoogleIcon, ShieldCheckIcon } from '../icons';
import Footer from '../layout/Footer';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CAMPUS_ADMIN);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const schoolName = 'Sistema de Gestión CEIE';
  const schoolLogo = 'https://i.ibb.co/3ym3z0g/Captura-de-pantalla-2025-03-09-174823.png';

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
        setIsLoading(false);
        if (err.message?.includes('Invalid login credentials') || err.code === 'invalid_credentials') {
          setError('Correo o contraseña incorrectos.');
        } else {
          setError('No pudimos conectar con el servidor. Revise su internet.');
        }
        console.error("Login Error:", err);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans selection:bg-accent/20 selection:text-accent">
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] animate-fade-in-up">
          <div className="text-center mb-10">
              <div className="bg-white p-5 rounded-[2rem] shadow-soft inline-block mb-6 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105 duration-300">
                <img src={schoolLogo} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <h1 className="text-[2rem] leading-tight font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                {schoolName}
              </h1>
              <p className="text-slate-500 text-base dark:text-slate-400 font-medium">
                Ingresa a tu cuenta institucional
              </p>
          </div>

          <Card className="shadow-floating border border-slate-100/50 dark:border-slate-800/50 p-8 sm:p-10 rounded-3xl bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                  <div className="bg-rose-50/80 backdrop-blur-sm text-rose-600 p-4 rounded-2xl text-sm font-medium border border-rose-100/50 flex items-start gap-3 animate-shake">
                      <span className="text-lg">⚠️</span>
                      <span className="leading-relaxed">{error}</span>
                  </div>
              )}

              <div className="space-y-2">
                <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 text-base focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all outline-none dark:bg-slate-800/50 dark:border-slate-700/80 dark:text-white dark:focus:bg-slate-800 placeholder:text-slate-400"
                  placeholder="usuario@ejemplo.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2 relative">
                <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 text-base focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all outline-none dark:bg-slate-800/50 dark:border-slate-700/80 dark:text-white dark:focus:bg-slate-800 pr-12 placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1" htmlFor="role">
                  Perfil de Acceso
                </label>
                <div className="relative group">
                  <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 text-base font-medium text-slate-700 focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all outline-none dark:bg-slate-800/50 dark:border-slate-700/80 dark:text-white dark:focus:bg-slate-800 appearance-none cursor-pointer"
                  >
                      {Object.values(UserRole).map((r) => (
                          <option key={r} value={r}>{r}</option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform group-hover:translate-y-[-40%]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <button
                disabled={isLoading}
                className="w-full bg-accent text-white font-bold py-4 rounded-2xl shadow-lg shadow-accent/25 hover:bg-sky-600 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-accent/25 text-sm uppercase tracking-widest mt-4"
                type="submit"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Conectando...
                  </span>
                ) : 'Entrar al Sistema'}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
                <div className="h-px bg-slate-200/60 dark:bg-slate-800 flex-1"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">O</span>
                <div className="h-px bg-slate-200/60 dark:bg-slate-800 flex-1"></div>
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-3 p-4 border border-slate-200/80 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-semibold text-slate-700 dark:bg-slate-800/50 dark:border-slate-700/80 dark:text-white dark:hover:bg-slate-700 shadow-sm">
                <GoogleIcon className="w-5 h-5" />
                Continuar con Google
            </button>
          </Card>
          
          <div className="mt-10 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ShieldCheckIcon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Conexión Segura CEIE</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
