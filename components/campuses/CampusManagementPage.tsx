
import React, { useState, useMemo } from 'react';
import { Campus, AdminUser, UserRole } from '../../types';
import Card from '../ui/Card';
/* Correcting missing imports for PlusIcon and ShieldCheckIcon */
import { BuildingOfficeIcon, EditIcon, TrashIcon, CloseIcon, ClipboardDocumentListIcon, ChevronDownIcon, CheckIcon, PlusIcon, ShieldCheckIcon } from '../icons';
import { useData } from '../../context/DataContext';

const CampusFormModal: React.FC<{
    onClose: () => void;
    onSave: (campus: Omit<Campus, 'id' | 'teachers' | 'students'>) => void;
    campusToEdit: Campus | null;
    admins: AdminUser[];
    allCampuses: Campus[];
}> = ({ onClose, onSave, campusToEdit, admins, allCampuses }) => {
    const isEditing = !!campusToEdit;
    const [formData, setFormData] = useState({
        name: campusToEdit?.name || '',
        address: campusToEdit?.address || '',
        admin: campusToEdit?.admin || '',
    });

    // Lógica para filtrar administradores disponibles (1 admin por sede)
    const availableAdmins = useMemo(() => {
        // 1. Obtener nombres de admins ya asignados a OTRAS sedes
        const assignedAdminNames = allCampuses
            .filter(c => c.id !== campusToEdit?.id) // No contar la sede que estamos editando
            .map(c => c.admin)
            .filter(name => name && name !== 'Sin asignar');

        // 2. Filtrar la lista global de admins
        return admins.filter(admin => 
            admin.role === UserRole.CAMPUS_ADMIN && 
            !assignedAdminNames.includes(admin.name)
        );
    }, [admins, allCampuses, campusToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg shadow-2xl animate-fade-in-up border-none overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">
                            {isEditing ? 'Configurar Sede' : 'Nueva Sede Académica'}
                        </h2>
                        <p className="text-xs opacity-80 font-medium">Asignación de infraestructura y liderazgo.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6 text-white"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nombre de la Sede</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-bold" 
                            placeholder="Ej: Sede Campestre - Facatativá"
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Dirección Geográfica</label>
                        <input 
                            type="text" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleChange} 
                            className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" 
                            placeholder="Ej: Km 5 Vía Occidente"
                            required 
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Administrador Asignado (Exclusivo)</label>
                        <div className="relative group">
                            <select 
                                name="admin" 
                                value={formData.admin} 
                                onChange={handleChange} 
                                className={`w-full p-3.5 border rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-black appearance-none cursor-pointer ${formData.admin ? 'text-primary' : 'text-slate-400'}`}
                                required
                            >
                                <option value="">Seleccionar un Administrador Disponible...</option>
                                {availableAdmins.map(admin => (
                                    <option key={admin.id} value={admin.name} className="text-slate-800 dark:text-white">
                                        {admin.name} ({admin.email})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDownIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <div className="text-amber-500 mt-0.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                            </div>
                            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium leading-tight">
                                Nota: Solo se muestran administradores que no tienen otra sede asignada actualmente para cumplir con la política institucional de exclusividad.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-50 transition-colors text-xs uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all text-xs uppercase tracking-widest"
                        >
                            {isEditing ? 'Actualizar Registro' : 'Confirmar Sede'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ campus: Campus; onClose: () => void; onConfirm: () => void; }> = ({ campus, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-2xl border-none p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-rose-50/50">
                <TrashIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">¿Remover Sede?</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Se eliminará la sede <strong className="text-slate-800 dark:text-white">"{campus.name}"</strong> permanentemente. Los administradores asociados quedarán disponibles para nuevas asignaciones.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs hover:bg-slate-200 transition-all order-2 sm:order-1 uppercase tracking-widest">No, Mantener</button>
                <button onClick={onConfirm} className="px-8 py-3 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all order-1 sm:order-2">Sí, Eliminar</button>
            </div>
        </Card>
    </div>
);

const CampusManagementPage: React.FC = () => {
    const { campuses, addCampus, updateCampus, deleteCampus, admins } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
    const [deletingCampus, setDeletingCampus] = useState<Campus | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSave = async (data: any) => {
        try {
            if (editingCampus) {
                await updateCampus(editingCampus.id, data);
                showNotification(`Sede "${data.name}" actualizada con éxito`, 'success');
            } else {
                await addCampus(data);
                showNotification(`Sede "${data.name}" registrada correctamente`, 'success');
            }
            setIsModalOpen(false);
        } catch (e: any) {
            showNotification(e.message || 'Error en la operación', 'error');
        }
    };

    const handleDelete = async () => {
        if (deletingCampus) {
            try {
                await deleteCampus(deletingCampus.id);
                showNotification('La sede ha sido removida del sistema', 'success');
            } catch (e) {
                showNotification('Hubo un problema al intentar eliminar', 'error');
            }
            setDeletingCampus(null);
        }
    };

    const openCreateModal = () => { setEditingCampus(null); setIsModalOpen(true); };
    const openEditModal = (campus: Campus) => { setEditingCampus(campus); setIsModalOpen(true); };

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
            
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                            <div className="p-4 bg-primary text-white rounded-[1.5rem] shadow-lg shadow-primary/20">
                                <BuildingOfficeIcon className="w-8 h-8" />
                            </div>
                            Nuestras Sedes
                        </h2>
                        <p className="text-sm text-slate-500 mt-2 dark:text-slate-400 font-medium ml-[4.5rem]">Control administrativo y operativo de la red institucional.</p>
                    </div>
                    <button 
                        onClick={openCreateModal} 
                        className="w-full md:w-auto bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-primary/30 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                    >
                        <PlusIcon className="w-5 h-5"/> Registrar Nueva Sede
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campuses.map(campus => (
                        <div key={campus.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-card border border-slate-50 dark:border-slate-800 flex flex-col justify-between hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden border-b-8 border-b-transparent hover:border-b-primary">
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-5 bg-slate-50 text-slate-400 rounded-3xl dark:bg-slate-800 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500 shadow-inner">
                                        <BuildingOfficeIcon className="w-10 h-10"/>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">Impacto</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                                            {campus.teachers + campus.students} Personas
                                        </span>
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 group-hover:text-primary transition-colors">{campus.name}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 font-bold uppercase tracking-wider mb-8">
                                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                    {campus.address}
                                </p>
                                
                                <div className="space-y-6">
                                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 relative z-10">Director a Cargo</span>
                                        <span className={`font-black text-sm relative z-10 ${campus.admin ? 'text-slate-800 dark:text-slate-200' : 'text-rose-500 animate-pulse'}`}>
                                            {campus.admin || 'ASIGNACIÓN PENDIENTE'}
                                        </span>
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            <ShieldCheckIcon className="w-12 h-12" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-3xl flex flex-col items-center group-hover:border-primary/20 transition-all">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Docentes</span>
                                            <span className="text-xl font-black text-slate-800 dark:text-white">{campus.teachers}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-3xl flex flex-col items-center group-hover:border-primary/20 transition-all">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Alumnos</span>
                                            <span className="text-xl font-black text-slate-800 dark:text-white">{campus.students}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                                <button onClick={() => openEditModal(campus)} className="text-[10px] font-black text-primary hover:text-blue-800 flex items-center gap-2 transition-colors uppercase tracking-widest">
                                    <ClipboardDocumentListIcon className="w-4 h-4" /> Configuración
                                </button>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => openEditModal(campus)} className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all shadow-sm border border-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800" title="Editar Perfil"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setDeletingCampus(campus)} className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-all shadow-sm border border-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <CampusFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    campusToEdit={editingCampus} 
                    admins={admins}
                    allCampuses={campuses}
                />
            )}
            {deletingCampus && (
                <DeleteConfirmationModal 
                    campus={deletingCampus} 
                    onClose={() => setDeletingCampus(null)} 
                    onConfirm={handleDelete} 
                />
            )}
        </>
    );
};

export default CampusManagementPage;
