
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import { EyeIcon, EyeSlashIcon, GoogleIcon } from '../icons';
import Footer from '../layout/Footer';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [schoolName, setSchoolName] = useState('CEIE - Sistema de Gestión');
  const [schoolLogo, setSchoolLogo] = useState<string>('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHBsMGdhaWJpamQ0OGxuYm85N2pyZ2F3YWdycjR2Ymtza2s2dzJhYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7t3XLkAB0fX7WEFs0/giphy.gif');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingrese el correo electrónico y la contraseña.');
      return;
    }
    setError('');
    
    try {
        await login(email, password, role);
    } catch (err: any) {
        setError(err.message || 'Credenciales incorrectas o usuario no encontrado.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
              <div className="bg-white p-3 rounded-2xl shadow-lg inline-block mb-4 dark:bg-slate-800">
                <img 
                    src={schoolLogo} 
                    alt="Logo" 
                    className="w-20 h-20 object-contain" 
                />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-indigo-400 pb-1">{schoolName}</h1>
              <p className="text-text-secondary text-sm mt-2 dark:text-slate-400 font-medium">Acceso al Sistema en la Nube</p>
          </div>
          <Card className="shadow-2xl border-none">
            <form onSubmit={handleLogin}>
              {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100 flex items-center gap-2">
                      <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {error}
                  </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider dark:text-slate-300" htmlFor="email">
                  Correo Institucional
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-gray-400"
                  placeholder="ejemplo@superior.edu.co"
                  required
                />
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider dark:text-slate-300" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-gray-400 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider dark:text-slate-300" htmlFor="role">
                  Perfil de Acceso
                </label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-pointer"
                >
                    {Object.values(UserRole).map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
              </div>
              <button
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none shadow-lg hover:from-blue-700 hover:to-primary transition-all duration-300 text-sm"
                type="submit"
              >
                Ingresar al Portal
              </button>
            </form>

            <div className="my-5 flex items-center before:flex-1 before:border-t before:border-gray-200 before:mt-0.5 after:flex-1 after:border-t after:border-gray-200 after:mt-0.5 dark:before:border-slate-700 dark:after:border-slate-700">
                <p className="text-center font-medium mx-4 mb-0 text-xs text-gray-400 dark:text-slate-500 uppercase">O</p>
            </div>

            <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 dark:bg-slate-700 dark:text-white transition-all"
            >
                <GoogleIcon className="w-5 h-5 mr-3" />
                Sincronizar con Google
            </button>
          </Card>
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">© {new Date().getFullYear()} Sistema CEIE - Educación Superior</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
