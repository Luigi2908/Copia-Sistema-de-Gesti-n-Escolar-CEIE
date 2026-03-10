
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DashboardIcon, StudentsIcon, SettingsIcon, LogoutIcon, BuildingOfficeIcon, MegaphoneIcon, CalendarIcon, AcademicCapIcon, ShieldCheckIcon, IdentificationIcon, ExamsIcon, LibraryIcon, TransportIcon, DocumentTextIcon, ClipboardDocumentListIcon } from '../icons';
import { Action, hasPermission } from '../../utils/permissions';

// New Ranking Icon component
const RankingIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.457c0-.621-.504-1.125-1.125-1.125h-.872M9.502 14.25V9.457c0-.621.504-1.125 1.125-1.125h.872m5.007 0V6.187c0-.621-.504-1.125-1.125-1.125h-.872M11.498 8.332V6.187c0-.621.504-1.125 1.125-1.125h.872M10 5.25a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1.75Z" />
  </svg>
);

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
}

const NavLink: React.FC<{ icon: React.ReactElement<{ className?: string }>; label: string; pageName: string; currentPage: string; setCurrentPage: (page: string) => void; }> = ({ icon, label, pageName, currentPage, setCurrentPage }) => {
  const isActive = currentPage === pageName;
  return (
    <li
      onClick={() => setCurrentPage(pageName)}
      className={`group flex items-center px-4 py-3.5 mx-4 cursor-pointer rounded-2xl mb-2 transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-primary/10 to-blue-500/5 text-primary font-black dark:from-primary/20 dark:to-blue-500/10 dark:text-sky-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]' 
          : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200 font-bold'
      }`}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 mr-4 transition-all duration-300 ${isActive ? 'text-primary dark:text-sky-400 scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 group-hover:scale-110'}` })}
      <span className="text-sm tracking-wide">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary dark:bg-sky-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    if (!user) return [];

    const allPossibleItems = [
      // Common
      { page: 'dashboard', permission: Action.VIEW_DASHBOARD, icon: <DashboardIcon />, label: 'Panel Principal' },

      // Super Admin & Campus Admin (ordered by importance)
      { page: 'admins', permission: Action.MANAGE_ADMINS, icon: <ShieldCheckIcon />, label: 'Administradores' },
      { page: 'campuses', permission: Action.MANAGE_CAMPUSES, icon: <BuildingOfficeIcon />, label: 'Sedes' },
      { page: 'students', permission: Action.MANAGE_STUDENTS, icon: <AcademicCapIcon />, label: 'Grados y Estudiantes' },

      // Campus Admin Specific & Teacher (Shared area)
      { page: 'teachers', permission: Action.MANAGE_TEACHERS, icon: <IdentificationIcon />, label: 'Profesores' },
      { page: 'class-annotations', permission: Action.MANAGE_CLASS_LOG, icon: <ClipboardDocumentListIcon />, label: 'Gestión de Notas' },
      { page: 'exams', permission: Action.MANAGE_EXAMS, icon: <ExamsIcon />, label: 'Exámenes' },
      { page: 'ranking', permission: Action.VIEW_RANKING, icon: <RankingIcon />, label: 'Ranking' },
      
      { page: 'reports', permission: Action.VIEW_REPORTS, icon: <DocumentTextIcon />, label: 'Informes' },
      { page: 'communications', permission: Action.MANAGE_COMMUNICATIONS, icon: <MegaphoneIcon />, label: 'Comunicaciones' },
      { page: 'campus-settings', permission: Action.VIEW_CAMPUS_SETTINGS, icon: <SettingsIcon />, label: 'Configuración Sede' },
      
      // Teacher specific
      { page: 'teacher-exams', permission: Action.VIEW_TEACHER_EXAMS, icon: <ExamsIcon />, label: 'Exámenes' },
      { page: 'grades', permission: Action.MANAGE_GRADES, icon: <ExamsIcon />, label: 'Calificaciones' },
      { page: 'schedule', permission: Action.VIEW_SCHEDULE, icon: <CalendarIcon />, label: 'Mi Horario' },

      // Student
      { page: 'student-grades', permission: Action.VIEW_OWN_GRADES, icon: <AcademicCapIcon />, label: 'Mis Calificaciones' },
      { page: 'student-schedule', permission: Action.VIEW_OWN_SCHEDULE, icon: <CalendarIcon />, label: 'Mi Horario' },
      { page: 'student-profile', permission: Action.VIEW_OWN_PROFILE, icon: <StudentsIcon />, label: 'Mi Perfil' },
      
      // Parent
      { page: 'parent-grades', permission: Action.VIEW_CHILD_GRADES, icon: <AcademicCapIcon />, label: 'Calificaciones' },
      { page: 'parent-schedule', permission: Action.VIEW_CHILD_SCHEDULE, icon: <CalendarIcon />, label: 'Horario' },
      { page: 'parent-profile', permission: Action.VIEW_CHILD_PROFILE, icon: <StudentsIcon />, label: 'Perfil' },

      // Placeholders
      { page: 'library', permission: Action.MANAGE_LIBRARY, icon: <LibraryIcon />, label: 'Biblioteca' },
      { page: 'transport', permission: Action.MANAGE_TRANSPORT, icon: <TransportIcon />, label: 'Transporte' },
      
      // Super Admin - moved to end
      { page: 'settings', permission: Action.VIEW_GLOBAL_SETTINGS, icon: <SettingsIcon />, label: 'Configuración Global' },
    ];
    
    return allPossibleItems.filter(item => hasPermission(user.role, item.permission));
  };
  
  const navItems = getNavItems();

  return (
    <aside className="bg-white/80 backdrop-blur-2xl h-full flex flex-col overflow-hidden dark:bg-slate-900/80 border-r border-slate-100/50 dark:border-slate-800/50 pt-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="px-8 mb-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Menú Principal</h3>
            <ul className="space-y-1">
              {navItems.map(item => (
                <NavLink 
                  key={item.page}
                  icon={item.icon}
                  label={item.label}
                  pageName={item.page}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              ))}
            </ul>
        </div>
        <div className="p-5 border-t border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-md">
          <li
            onClick={logout}
            className="flex items-center px-4 py-3.5 cursor-pointer rounded-2xl text-slate-500 hover:bg-rose-50/80 hover:text-rose-600 transition-all duration-300 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 group font-bold"
          >
            <LogoutIcon className="w-5 h-5 mr-4 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-all group-hover:-translate-x-1" />
            <span className="text-sm tracking-wide">Cerrar Sesión</span>
          </li>
        </div>
    </aside>
  );
};

export default Sidebar;
