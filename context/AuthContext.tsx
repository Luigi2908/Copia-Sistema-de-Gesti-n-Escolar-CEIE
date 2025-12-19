
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole, AdminUser, Teacher, Student } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Cargar sesión persistente desde LocalStorage
  useEffect(() => {
    const localUserJson = localStorage.getItem('active_local_user');
    if (localUserJson) {
        setUser(JSON.parse(localUserJson));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    // Simular retardo de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Caso especial: Super Admin Mock (Hardcoded)
    if (role === UserRole.SUPER_ADMIN && email.toLowerCase() === 'luissalberto26@gmail.com' && password === 'password') {
        const mockSuperAdmin: User = {
            id: 'super-admin-mock-id',
            name: 'Luis Salberto',
            email: 'luissalberto26@gmail.com',
            role: UserRole.SUPER_ADMIN,
            avatar: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHBsMGdhaWJpamQ0OGxuYm85N2pyZ2F3YWdycjR2Ymtza2s2dzJhYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7t3XLkAB0fX7WEFs0/giphy.gif',
            isLocal: true
        };
        setUser(mockSuperAdmin);
        localStorage.setItem('active_local_user', JSON.stringify(mockSuperAdmin));
        return; 
    }

    // 2. Buscar en LocalStorage según el rol
    const localAdmins: AdminUser[] = JSON.parse(localStorage.getItem('school_admins') || '[]');
    const localTeachers: Teacher[] = JSON.parse(localStorage.getItem('school_teachers') || '[]');
    const localStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
    // Simulación de padres si existieran en una lista separada, o buscar en usuarios generales
    const localParents: User[] = JSON.parse(localStorage.getItem('school_parents') || '[]');

    let foundUser: any | undefined;

    switch (role) {
        case UserRole.CAMPUS_ADMIN:
            foundUser = localAdmins.find(u => u.email.toLowerCase() === email.toLowerCase());
            break;
        case UserRole.TEACHER:
            foundUser = localTeachers.find(u => u.email.toLowerCase() === email.toLowerCase());
            break;
        case UserRole.STUDENT:
            foundUser = localStudents.find(u => u.email.toLowerCase() === email.toLowerCase());
            break;
        case UserRole.PARENT:
            foundUser = localParents.find(u => u.email.toLowerCase() === email.toLowerCase());
            break;
        default:
            break;
    }

    // Validación de contraseña
    // 1. Contraseña Maestra (demo)
    // 2. Contraseña provisional asignada (tempPassword)
    if (foundUser) {
        const isValid = password === '123456' || password === 'password' || (foundUser.tempPassword && foundUser.tempPassword === password);

        if (isValid) {
            // Verificar estado si aplica
            if ('status' in foundUser && (foundUser as any).status === 'inactive') {
                throw new Error(`Esta cuenta de ${role} está inactiva. Contacte al administrador.`);
            }

            const userToSet = { ...foundUser, role: role, isLocal: true };
            setUser(userToSet);
            localStorage.setItem('active_local_user', JSON.stringify(userToSet));
            return;
        }
    }

    throw new Error('Credenciales incorrectas o usuario no encontrado.');
  };

  const logout = () => {
    localStorage.removeItem('active_local_user');
    setUser(null);
  };
  
  const sendPasswordReset = async (email: string) => {
    // Simulación local
    console.log(`[Local] Solicitud de restablecimiento de contraseña para: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    // No hacemos nada real, solo simulamos éxito
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
