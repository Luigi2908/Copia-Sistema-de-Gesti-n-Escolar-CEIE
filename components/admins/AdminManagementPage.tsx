
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { UserAddIcon, EditIcon, KeyIcon, TrashIcon, PaperAirplaneIcon, ShieldCheckIcon, CloseIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '../icons';
import { UserRole, AdminUser, User, Campus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const AdminFormModal: React.FC<{
    onClose: () => void;
    onSave: (admin: Omit<AdminUser, 'id' | 'role' | 'avatar' | 'campusId' | 'campusName'> & { campusId?: string }) => void;
    adminToEdit: AdminUser | null;
    campuses: Campus[];
}> = ({ onClose, onSave, adminToEdit, campuses }) => {
    const isEditing = !!adminToEdit;
    const [formData, setFormData] = useState({
        name: adminToEdit?.name || '',
        email: adminToEdit?.email || '',
        status: adminToEdit?.status || 'active',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg shadow-2xl animate-fade-in-up border-none">
                <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                            {isEditing ? 'Editar Administrador' : 'Nuevo Administrador'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">Complete los datos de acceso y privilegios.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6 text-slate-400"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nombre Completo</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" 
                                placeholder="Ej: Carlos Rodriguez"
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Correo Electrónico</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" 
                                placeholder="admin@ceie.com"
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Estado de Cuenta</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className={`w-full p-3 border rounded-xl outline-none transition-all text-sm font-black uppercase tracking-wider cursor-pointer ${
                                    formData.status === 'active' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500/10' 
                                    : 'bg-rose-50 border-rose-200 text-rose-700 focus:ring-rose-500/10'
                                } dark:bg-slate-800 dark:border-slate-700`}
                            >
                                <option value="active">● ACTIVO</option>
                                <option value="inactive">○ INACTIVO</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            {isEditing ? 'Guardar Cambios' : 'Crear Administrador'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const TempPasswordModal: React.FC<{ user: User; onClose: () => void; onSave: (tempPass: string) => void; }> = ({ user, onClose, onSave }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(password);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-sm shadow-2xl border-none p-8">
                <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-slate-700">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">Clave Provisional</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><CloseIcon className="w-5 h-5"/></button>
                </div>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Asigne una clave temporal para <strong className="text-slate-800 dark:text-white">{user.name}</strong>. El usuario deberá cambiarla en su primer ingreso.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nueva Contraseña</label>
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-12 text-sm font-bold"
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-4 top-[30px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Asignar</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ admin: AdminUser; onClose: () => void; onConfirm: () => void; }> = ({ admin, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-2xl border-none p-8">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white text-center">¿Eliminar Administrador?</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Está a punto de eliminar a <span className="font-bold text-slate-800 dark:text-white">{admin.name}</span>. Esta acción revocará todos sus accesos de forma permanente.
            </p>
            <div className="flex justify-center gap-3 mt-8">
                <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">No, Cancelar</button>
                <button onClick={onConfirm} className="px-6 py-2.5 bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all">Sí, Eliminar</button>
            </div>
        </Card>
    </div>
);

const ResetPasswordConfirmationModal: React.FC<{ user: User; onClose: () => void; onConfirm: () => void; }> = ({ user, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-2xl border-none p-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-emerald-500 -rotate-45" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white text-center">Restablecer por Email</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Enviaremos un enlace seguro a <strong className="text-primary font-bold">{user.email}</strong> para que el administrador pueda configurar una nueva contraseña.
            </p>
            <div className="flex justify-center gap-3 mt-8">
                <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200">Cancelar</button>
                <button onClick={onConfirm} className="px-8 py-2.5 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                    Enviar Enlace
                </button>
            </div>
        </Card>
    </div>
);

const AdminManagementPage: React.FC = () => {
    const { admins, addAdmin, updateAdmin, deleteAdmin, campuses, assignTemporaryPassword } = useData();
    const { sendPasswordReset, user } = useAuth();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
    const [resettingPasswordAdmin, setResettingPasswordAdmin] = useState<AdminUser | null>(null);
    const [assigningPassAdmin, setAssigningPassAdmin] = useState<AdminUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSave = async (data: any) => {
        try {
            // Send campusId as empty string to prevent MySQL missing column errors
            // DO NOT send campusName because it is not a column in the admins table
            const adminData = { 
                name: data.name,
                email: data.email,
                status: data.status,
                campusId: ""
            };

            if (editingAdmin) {
                await updateAdmin(editingAdmin.id, adminData);
                showNotification('Administrador actualizado exitosamente', 'success');
            } else {
                await addAdmin(adminData);
                showNotification('Administrador creado y activado', 'success');
            }
            setIsModalOpen(false);
        } catch (e: any) {
            showNotification(e.message || 'Error al guardar cambios', 'error');
        }
    };

    const handleDelete = async () => {
        if (deletingAdmin) {
            try {
                await deleteAdmin(deletingAdmin.id);
                showNotification('Administrador eliminado del sistema', 'success');
            } catch (e) {
                showNotification('Error al intentar eliminar', 'error');
            }
            setDeletingAdmin(null);
        }
    };

    const handleSendResetLink = async () => {
        if (resettingPasswordAdmin) {
            try {
                await sendPasswordReset(resettingPasswordAdmin.email);
                showNotification(`Enlace enviado a ${resettingPasswordAdmin.email}`, 'success');
            } catch (e) {
                showNotification('Error al enviar el enlace de recuperación', 'error');
            }
            setResettingPasswordAdmin(null);
        }
    };

    const handleAssignTempPass = async (tempPass: string) => {
        if (assigningPassAdmin) {
            try {
                await assignTemporaryPassword(assigningPassAdmin.id, UserRole.CAMPUS_ADMIN, tempPass);
                showNotification('Contraseña provisional asignada correctamente', 'success');
            } catch (e) {
                showNotification('Error al asignar contraseña provisional', 'error');
            }
            setAssigningPassAdmin(null);
        }
    };

    const openCreateModal = () => { setEditingAdmin(null); setIsModalOpen(true); };
    const openEditModal = (admin: AdminUser) => { setEditingAdmin(admin); setIsModalOpen(true); };

    const adminsForView = admins.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

    return (
        <>
            {notification && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up transition-all ${
                    notification.type === 'success' ? 'bg-emerald-600 text-white' : 
                    notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                    <div className="bg-white/20 p-1 rounded-full"><CheckIcon className="w-4 h-4"/></div>
                    <span className="font-bold text-sm tracking-tight">{notification.message}</span>
                </div>
            )}

            <Card className="flex flex-col h-full border-none shadow-none bg-transparent p-0">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                    
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-900">
                        <div>
                            <h2 className="font-black text-2xl text-slate-800 dark:text-white flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl dark:bg-emerald-900/20 dark:text-emerald-400 shadow-sm">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                Gestión de Administradores
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400 font-medium ml-16">Control de acceso, estados de cuenta y asignación de sedes.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre..." 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                />
                                <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </div>
                            </div>
                            <button 
                                onClick={openCreateModal} 
                                className="bg-primary text-white font-black py-3 px-6 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <UserAddIcon className="w-5 h-5"/> Nuevo Admin
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5">Identidad y Usuario</th>
                                    <th className="px-6 py-5">Sede Asignada</th>
                                    <th className="px-6 py-5">Estado</th>
                                    <th className="px-8 py-5 text-right">Acciones de Gestión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {adminsForView.map(admin => (
                                    <tr key={admin.id} className="bg-white hover:bg-slate-50/50 transition-all dark:bg-slate-900 dark:hover:bg-slate-800/50 group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-black text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 shadow-sm overflow-hidden group-hover:scale-105 transition-transform border border-white dark:border-slate-600">
                                                        {admin.avatar ? <img src={admin.avatar} alt="" className="w-full h-full object-cover"/> : admin.name.charAt(0)}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${admin.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-base">{admin.name}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                                {admin.campusName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                                admin.status === 'active' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                                                : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                                            }`}>
                                                {admin.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                {isSuperAdmin && (
                                                    <button onClick={() => setAssigningPassAdmin(admin)} className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-all shadow-sm border border-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800" title="Clave Provisional">
                                                        <KeyIcon className="w-5 h-5"/>
                                                    </button>
                                                )}
                                                <button onClick={() => setResettingPasswordAdmin(admin)} className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-all shadow-sm border border-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800" title="Enviar Recuperación">
                                                    <PaperAirplaneIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => openEditModal(admin)} className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all shadow-sm border border-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800" title="Editar Perfil">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => setDeletingAdmin(admin)} className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-all shadow-sm border border-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800" title="Revocar Acceso">
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                 {adminsForView.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-20">
                                            <div className="max-w-xs mx-auto">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                                    <ShieldCheckIcon className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-400 font-bold">No se encontraron administradores.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
            
            {isModalOpen && (
                <AdminFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    adminToEdit={editingAdmin} 
                    campuses={campuses} 
                />
            )}
            
            {deletingAdmin && (
                <DeleteConfirmationModal 
                    admin={deletingAdmin} 
                    onClose={() => setDeletingAdmin(null)} 
                    onConfirm={handleDelete} 
                />
            )}
            
            {resettingPasswordAdmin && (
                <ResetPasswordConfirmationModal 
                    user={resettingPasswordAdmin} 
                    onClose={() => setResettingPasswordAdmin(null)} 
                    onConfirm={handleSendResetLink} 
                />
            )}
            
            {assigningPassAdmin && (
                <TempPasswordModal 
                    user={assigningPassAdmin} 
                    onClose={() => setAssigningPassAdmin(null)} 
                    onSave={handleAssignTempPass} 
                />
            )}
        </>
    );
};

export default AdminManagementPage;
