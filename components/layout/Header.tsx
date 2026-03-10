
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole, AdminUser, Teacher, Communication, Student, SchoolEvent } from '../../types';
import { BellIcon, LogoutIcon, DocumentTextIcon, PdfIcon, WordIcon, EditIcon, DownloadIcon, MenuIcon, CalendarIcon } from '../icons';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { useData } from '../../context/DataContext';

// Modal for user profile
const ProfileModal: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
    const { updateUserAvatar } = useData();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [imageSuccess, setImageSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'Las nuevas contraseñas no coinciden.', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
             setPasswordMessage({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', type: 'error' });
            return;
        }

        // Mock password change for local mode
        setPasswordMessage({ text: '¡Contraseña actualizada exitosamente!', type: 'success' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
            setPasswordMessage(null);
            onClose();
        }, 2000);
    };

    const handleImageClick = () => {
        const modifiableRoles = [UserRole.CAMPUS_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT];
        if (user && modifiableRoles.includes(user.role)) {
            fileInputRef.current?.click();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageError(null);
        setImageSuccess(null);

        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setImageError('Formato de archivo no válido. Use JPG o PNG.');
            setTimeout(() => setImageError(null), 3000);
            return;
        }

        const maxSizeInBytes = 2 * 1024 * 1024; 
        if (file.size > maxSizeInBytes) {
            setImageError('La imagen es demasiado grande. Máximo 2MB.');
            setTimeout(() => setImageError(null), 3000);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setAvatarPreview(base64String);
            if (user) {
                try {
                    await updateUserAvatar(user.id, user.role, base64String);
                    setImageSuccess('Foto de perfil actualizada exitosamente.');
                    setTimeout(() => setImageSuccess(null), 5000);
                } catch (error: any) {
                    console.error("Error updating avatar:", error);
                    setImageError(`Error al guardar la imagen: ${error.message}`);
                    setTimeout(() => setImageError(null), 3000);
                }
            }
        };
        reader.readAsDataURL(file);
    };


    const canChangeDetails = user && user.role !== UserRole.SUPER_ADMIN;

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-center items-center p-4 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 w-full max-w-md dark:bg-slate-900/90 dark:border dark:border-slate-800/60 relative overflow-hidden transform transition-all">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-indigo-500"></div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Mi Perfil</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none dark:hover:text-white transition-colors bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
                </div>
                
                <div className="flex items-center space-x-6 mb-8">
                    <div className="relative group">
                        <img className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg" src={avatarPreview || user?.avatar} alt="User avatar" />
                        {canChangeDetails && (
                            <div 
                                onClick={handleImageClick}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                            >
                                <EditIcon className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg"
                            hidden
                        />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{user?.name}</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full inline-block mt-3 dark:bg-primary/20 dark:text-sky-300 uppercase tracking-widest">{user?.role}</span>
                    </div>
                </div>
                
                {(imageError || imageSuccess) && (
                    <div className="text-center mb-6 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        {imageError && <p className="text-sm text-rose-500 font-bold">{imageError}</p>}
                        {imageSuccess && <p className="text-sm text-emerald-500 font-bold">{imageSuccess}</p>}
                    </div>
                )}

                <div className="border-t border-slate-100/50 pt-6 dark:border-slate-800/50">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-5">Seguridad</h3>
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        {passwordMessage && (
                            <p className={`text-sm font-bold text-center rounded-xl p-3 ${
                                passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                passwordMessage.type === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>{passwordMessage.text}</p>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 dark:text-slate-400">Nueva Contraseña</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border border-slate-200/60 rounded-xl bg-slate-50/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800/50 dark:text-white dark:border-slate-700/50 outline-none font-medium" required />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 dark:text-slate-400">Confirmar Contraseña</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border border-slate-200/60 rounded-xl bg-slate-50/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800/50 dark:text-white dark:border-slate-700/50 outline-none font-medium" required />
                        </div>
                        <div className="pt-4">
                             <button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all duration-300 text-sm">Actualizar Contraseña</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Modal for settings
const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
         <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-center items-center p-4 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 w-full max-w-md dark:bg-slate-900/90 dark:border dark:border-slate-800/60 relative">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Configuración Rápida</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none dark:hover:text-white transition-colors bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
                </div>

                <div className="space-y-8">
                    <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/30">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Tema de la interfaz</span>
                        <ThemeSwitcher />
                    </div>

                    <div className="border-t border-slate-100/50 pt-6 dark:border-slate-800/50">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Notificaciones</h3>
                        <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/30">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Recibir alertas por correo</span>
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                <div className="relative w-11 h-6 bg-slate-200/80 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-blue-800/30 dark:bg-slate-700/80 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-slate-100 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                            </label>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-end space-x-3 mt-10 pt-6 border-t border-slate-100/50 dark:border-slate-800/50">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100/80 rounded-xl transition-colors dark:text-slate-400 dark:hover:bg-slate-800/80">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

interface HeaderProps {
    toggleSidebar: () => void;
}

const fileTypeToIcon = (type: string) => {
    const className = "w-6 h-6";
    if (type.includes('pdf')) return <PdfIcon className={`${className} text-rose-500`} />;
    if (type.includes('word')) return <WordIcon className={`${className} text-blue-500`} />;
    return <DocumentTextIcon className={`${className} text-slate-500`} />;
};

type NotificationItem = {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'communication' | 'event';
    meta: any;
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { communications: allComms, events: allEvents } = useData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [schoolName, setSchoolName] = useState('Sistema de Gestión CEIE');
  const [schoolLogo, setSchoolLogo] = useState<string>('https://i.ibb.co/3ym3z0g/Captura-de-pantalla-2025-03-09-174823.png');

  useEffect(() => {
        const loadBranding = () => {
            const globalSettings = localStorage.getItem('school_global_settings');
            let settings: any = {};
            
            if (globalSettings) {
                settings = JSON.parse(globalSettings);
            }

            if (user?.campusId) {
                const campusSettings = localStorage.getItem(`school_settings_${user.campusId}`);
                if (campusSettings) {
                    const parsed = JSON.parse(campusSettings);
                    if (parsed.schoolName) settings.schoolName = parsed.schoolName;
                    if (parsed.schoolLogo) settings.schoolLogo = parsed.schoolLogo;
                }
            }

            if (settings.schoolName) setSchoolName(settings.schoolName);
            if (settings.schoolLogo) setSchoolLogo(settings.schoolLogo);
        };
        loadBranding();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Filter Communications
    const filteredComms = allComms.filter(comm => {
        const campusMatch = user.role === UserRole.SUPER_ADMIN || !comm.campusId || comm.campusId === user.campusId;
        if (!campusMatch) return false;

        if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.CAMPUS_ADMIN) {
            return true;
        }

        const roleMatch = !comm.targetRoles || comm.targetRoles.length === 0 || comm.targetRoles.includes(user.role);
        return roleMatch;
    }).map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        date: c.date,
        type: 'communication' as const,
        meta: c
    }));

    // Filter Events (Future events for this user)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const filteredEvents = allEvents.filter(evt => {
        const evtDate = new Date(evt.date);
        return evtDate >= today && (user.role === UserRole.SUPER_ADMIN || !evt.campusId || evt.campusId === user.campusId);
    }).map(e => ({
        id: e.id,
        title: `Evento: ${e.title}`,
        description: e.description || 'Sin descripción',
        date: e.date, // This is the event date, effectively sorting by "upcoming"
        type: 'event' as const,
        meta: e
    }));

    // Combine and Sort
    // We want recent communications AND upcoming events. 
    // Sorting strategy: Show events first if they are soon? Or simple merge?
    // Let's merge and sort by date descending for comms, but events are future dates.
    // To make a useful feed, let's put upcoming events at the top, then recent comms.
    
    const sortedEvents = filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedComms = filteredComms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Combine: Top 3 events, Top 7 comms
    const combined = [...sortedEvents.slice(0, 3), ...sortedComms.slice(0, 7)];
    
    setNotifications(combined);

    // Unread logic
    const lastCheck = localStorage.getItem('last_notification_view');
    if (lastCheck) {
        // If there's a new communication after last check
        const hasNewComm = sortedComms.some(c => new Date(c.date) > new Date(lastCheck));
        // If there's an event that wasn't there before? Hard to track without created_at.
        // Simplified: If any item in the list is "new" by some metric.
        // Let's assume if the combined list changed significantly or has items.
        // For now, stick to date check on communications as the primary "alert".
        setHasUnread(hasNewComm);
    } else if (combined.length > 0) {
        setHasUnread(true);
    }
  }, [user, allComms, allEvents]);

  const handleToggleNotifications = () => {
    setNotificationPanelOpen(prev => !prev);
    if (!isNotificationPanelOpen) {
        setHasUnread(false);
        localStorage.setItem('last_notification_view', new Date().toISOString());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <>
        <header className="bg-white/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] sticky top-0 z-30 px-6 py-4 border-b border-slate-100/50 dark:bg-slate-900/80 dark:border-slate-800/50 transition-all duration-300">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-5">
                {/* Menu Button */}
                <button onClick={toggleSidebar} className="text-slate-400 hover:text-primary hover:bg-slate-50/80 p-2.5 rounded-xl transition-all focus:outline-none dark:text-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-white group">
                    <MenuIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                
                {/* Branding */}
                <div className="flex items-center gap-4">
                    {schoolLogo ? (
                        <img src={schoolLogo} alt="School Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-sm text-white">
                            <span className="font-black text-xl">{schoolName.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-tight tracking-tight">
                            {schoolName}
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 hidden sm:block font-bold tracking-wide uppercase mt-0.5">
                            {user?.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative" ref={notificationRef}>
                <button onClick={handleToggleNotifications} className="relative p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all dark:text-slate-500 dark:hover:text-white group">
                    <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    {hasUnread && (
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-slate-900"></span>
                        </span>
                    )}
                </button>
                
                {/* Modern Notification Panel */}
                {isNotificationPanelOpen && (
                    <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white/90 backdrop-blur-xl dark:bg-slate-900/90 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 z-50 transform origin-top-right transition-all duration-300 ease-out border border-slate-100/50 dark:border-slate-800/50 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Notificaciones</h3>
                            {notifications.length > 0 && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full dark:bg-primary/20 dark:text-sky-300 uppercase tracking-widest">
                                    {notifications.length} Recientes
                                </span>
                            )}
                        </div>
                        <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                           {notifications.length > 0 ? (
                               <div className="divide-y divide-slate-50/50 dark:divide-slate-800/50">
                                   {notifications.map((item) => (
                                       <div key={item.id} className={`group flex items-start gap-4 px-6 py-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-default ${item.type === 'event' ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}>
                                           <div className="flex-shrink-0 mt-1">
                                               {item.type === 'event' ? (
                                                   <div className="w-10 h-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm">
                                                       <CalendarIcon className="w-5 h-5" />
                                                   </div>
                                               ) : (
                                                   <div className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-primary dark:text-sky-400 shadow-sm">
                                                       {fileTypeToIcon((item.meta as Communication).fileType)}
                                                   </div>
                                               )}
                                           </div>
                                           <div className="flex-grow min-w-0">
                                               <div className="flex justify-between items-start">
                                                   <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate pr-2 group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">{item.title}</p>
                                                   <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</span>
                                               </div>
                                               <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                                               {item.type === 'communication' && (
                                                   <div className="mt-3 flex items-center justify-between">
                                                       <span className="text-[10px] font-bold text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                           {(item.meta as Communication).campusName || 'General'}
                                                       </span>
                                                       <a 
                                                           href={(item.meta as Communication).fileUrl} 
                                                           download={(item.meta as Communication).fileName}
                                                           className="text-xs font-bold text-primary hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                                                           title="Descargar adjunto"
                                                       >
                                                           <DownloadIcon className="w-3.5 h-3.5" /> Descargar
                                                       </a>
                                                   </div>
                                               )}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <div className="px-6 py-16 text-center">
                                   <div className="mx-auto w-14 h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
                                       <BellIcon className="w-7 h-7 text-slate-300 dark:text-slate-500" />
                                   </div>
                                   <p className="text-sm font-bold text-slate-800 dark:text-white">Sin notificaciones</p>
                                   <p className="text-xs font-medium text-slate-400 mt-1">Estás al día con todo.</p>
                               </div>
                           )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 pl-2 focus:outline-none group">
                    <img className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md" src={user?.avatar} alt="User avatar" />
                    <div className="hidden md:block text-left">
                        <div className="font-black text-sm text-slate-800 dark:text-slate-100 truncate max-w-[140px] group-hover:text-primary transition-colors tracking-tight">{user?.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{user?.role}</div>
                    </div>
                </button>
                {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-2 z-20 dark:bg-slate-900/90 dark:border dark:border-slate-800/60 ring-1 ring-black/5 transform origin-top-right transition-all duration-200">
                    <div className="px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 mb-2 bg-slate-50/30 dark:bg-slate-900/30">
                        <p className="text-sm font-black text-slate-800 dark:text-white truncate tracking-tight">{user?.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); setProfileModalOpen(true); setDropdownOpen(false); }} className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50/80 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors font-bold">Mi Perfil</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setSettingsModalOpen(true); setDropdownOpen(false); }} className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50/80 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors font-bold">Configuración</a>
                    <div className="border-t border-slate-100/50 my-2 dark:border-slate-800/50"></div>
                    <button
                    onClick={logout}
                    className="w-full text-left flex items-center px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 transition-colors font-black"
                    >
                    <LogoutIcon className="w-4 h-4 mr-2.5" />
                    Cerrar Sesión
                    </button>
                </div>
                )}
            </div>
            </div>
        </div>
        </header>
        {isProfileModalOpen && <ProfileModal user={user} onClose={() => setProfileModalOpen(false)} />}
        {isSettingsModalOpen && <SettingsModal onClose={() => setSettingsModalOpen(false)} />}
    </>
  );
};

export default Header;
