
import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, UserRole, User, Campus, TeacherCourseAssignment } from '../../types';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Action, hasPermission } from '../../utils/permissions';
import { UploadIcon, UserAddIcon, PlusIcon, KeyIcon, EditIcon, TrashIcon, BookOpenIcon, EyeIcon, IdentificationIcon, CloseIcon, PaperAirplaneIcon, EyeSlashIcon, DownloadIcon, ChevronRightIcon, ChevronDownIcon } from '../icons';
import { useData } from '../../context/DataContext';

// Datos de Facultad > Programa > Semestre > Materias
const CURRICULUM_DATA: any = {
    'Innovación': {
        'Publicidad': {
            '1': ['Técnicas de aprendizaje', 'Planificación y gestión del tiempo', 'Matemáticas básicas', 'Liderazgo', 'Excel nivel básico', 'Sociología I', 'Planeación de campañas', 'Inglés básico nivel I', 'Excel nivel intermedio', 'Community manager - facebook ADS'],
            '2': ['TICS', 'Introducción al diseño de producto', 'Resolución de conflictos', 'Trabajo en Equipo', 'Inglés básico nivel II', 'Socioantropología', 'Excel nivel avanzado', 'Sociología nivel II', 'Geoogle ADS', 'Psicología del consumidor'],
            '3': ['Mercado y ventas', 'Creatividad organizacional', 'Emprendimiento e innovación empresarial', 'Inglés básico nivel III', 'Gestión de presupuestos', 'Estrategia de producto', 'Oratoria', 'E-mail marketing', 'Photoshop básico', 'Estrategia de innovación'],
            '4': ['Adobe ilustrator nivel básico', 'Corel draw básico', 'Metodología de investigación', 'Investigación de mercados', 'Creación de empresas', 'Habilidades de presentación', 'Photoshop intermedio', 'Ética profesional', 'Sociología III', 'Preparación Pruebas T y T']
        },
        'Marketing Internacional': {
            '1': ['Técnicas de aprendizaje', 'Planificación del tiempo', 'Matemática básica', 'Liderazgo', 'Sociología I', 'TICS', 'Trabajo en equipo', 'Inglés básico nivel I', 'Excel nivel básico', 'Creatividad organizacional']
        }
    },
    'Ingeniería': {
        'Ingenieria de Sistemas': {
            '1': ['Técnicas de aprendizaje', 'Sistemas operativos - linux', 'HTML', 'Matemáticas básicas', 'Programación algorítmica', 'Inglés básico nivel I'],
            '2': ['Fundamentos de programación', 'Excel nivel básico', 'Metodología de la investigación', 'Fundamentos de bases de datos', 'JAVA SCRIPT']
        }
    }
};

const ViewTeacherModal: React.FC<{ teacher: Teacher; onClose: () => void }> = ({ teacher, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-lg shadow-2xl animate-fade-in-up border-none overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-500">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                    <CloseIcon className="w-6 h-6"/>
                </button>
            </div>
            <div className="px-8 pb-8 -mt-12">
                <div className="relative inline-block">
                    <img src={teacher.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-xl object-cover" alt=""/>
                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ${teacher.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                </div>
                
                <div className="mt-4">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">{teacher.name}</h2>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{teacher.subject || 'Docente'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identificación</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.documentNumber}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo Institucional</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{teacher.email}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.phone}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sede</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.campusName}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                <button onClick={onClose} className="px-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all text-sm">Cerrar</button>
            </div>
        </Card>
    </div>
);

const TeacherFormModal: React.FC<{
    onClose: () => void;
    onSave: (teacher: any) => Promise<void>;
    teacherToEdit: Teacher | null;
    user: User | null;
    campuses: Campus[];
}> = ({ onClose, onSave, teacherToEdit, user, campuses }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [faculty, setFaculty] = useState<string>('');
    const [program, setProgram] = useState<string>('');
    
    const [formData, setFormData] = useState({
        name: teacherToEdit?.name || '',
        documentNumber: teacherToEdit?.documentNumber || '',
        email: teacherToEdit?.email || '',
        phone: teacherToEdit?.phone || '',
        subject: teacherToEdit?.subject || '',
        campusId: teacherToEdit?.campusId || (user?.role === UserRole.CAMPUS_ADMIN ? user.campusId : ''),
        status: teacherToEdit?.status || 'active',
    });

    const faculties = Object.keys(CURRICULUM_DATA);
    const programs = faculty ? Object.keys(CURRICULUM_DATA[faculty]) : [];
    
    const subjectsList = useMemo(() => {
        if (!faculty || !program) return [];
        const allSubjects: string[] = [];
        Object.values(CURRICULUM_DATA[faculty][program]).forEach((list: any) => {
            allSubjects.push(...list);
        });
        return Array.from(new Set(allSubjects)).sort();
    }, [faculty, program]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl shadow-2xl border-none animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">
                            {teacherToEdit ? 'Editar Perfil Docente' : 'Registrar Nuevo Profesor'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">Complete todos los campos institucionales.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nombre Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-bold" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Documento Identidad</label>
                            <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Teléfono Contacto</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Correo Institucional</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium" required />
                    </div>

                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <BookOpenIcon className="w-4 h-4"/> Especialidad Académica
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select 
                                value={faculty} 
                                onChange={e => { setFaculty(e.target.value); setProgram(''); }}
                                className="w-full p-2.5 text-xs border border-indigo-100 rounded-xl bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">Seleccione Facultad...</option>
                                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <select 
                                value={program} 
                                onChange={e => setProgram(e.target.value)}
                                disabled={!faculty}
                                className="w-full p-2.5 text-xs border border-indigo-100 rounded-xl bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                            >
                                <option value="">Seleccione Programa...</option>
                                {programs.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <select 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            disabled={!program}
                            className="w-full p-3 text-sm border-2 border-indigo-500/20 rounded-xl bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold transition-all disabled:opacity-50"
                            required
                        >
                            <option value="">Seleccione Área de Especialidad...</option>
                            {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user?.role === UserRole.SUPER_ADMIN && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Sede Asignada</label>
                                <select name="campusId" value={formData.campusId} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold dark:bg-slate-800 dark:text-white" required>
                                    <option value="">Seleccionar Sede...</option>
                                    {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className={user?.role !== UserRole.SUPER_ADMIN ? 'md:col-span-2' : ''}>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Estado Laboral</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold dark:bg-slate-800 dark:text-white">
                                <option value="active">Activo / En Contrato</option>
                                <option value="inactive">Inactivo / Retirado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700 mt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-xs uppercase tracking-widest disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-10 py-3 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-2">
                            {isSaving ? 'Procesando...' : (teacherToEdit ? 'Guardar Cambios' : 'Crear Profesor')}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const ViewAssignmentsModal: React.FC<{
    teacher: Teacher;
    assignments: TeacherCourseAssignment[];
    onClose: () => void;
    onEdit: (assignment: TeacherCourseAssignment) => void;
    onDelete: (id: string) => void;
}> = ({ teacher, assignments, onClose, onEdit, onDelete }) => (
    <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-2xl shadow-2xl animate-fade-in-up border-none max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Carga Académica</h2>
                    <p className="text-sm text-slate-500">Profesor: <span className="font-bold text-indigo-600">{teacher.name}</span></p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {assignments.length > 0 ? (
                    assignments.map((ass) => (
                        <div key={ass.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-600">
                                    <BookOpenIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 dark:text-white text-sm">{ass.subject}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ass.class}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => onEdit(ass)} className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all shadow-sm border border-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800" title="Editar Materia">
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDelete(ass.id)} className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-all shadow-sm border border-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800" title="Eliminar de la carga">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-400">
                        <BookOpenIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">Sin asignaturas registradas.</p>
                    </div>
                )}
            </div>

            <div className="p-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-xl flex justify-end">
                <button onClick={onClose} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all text-sm">Cerrar</button>
            </div>
        </Card>
    </div>
);

const TeacherManagementPage: React.FC = () => {
    const { user, sendPasswordReset } = useAuth();
    const { teachers, addTeacher, updateTeacher, deleteTeacher, assignments, addAssignment, updateAssignment, deleteAssignment, assignTemporaryPassword, campuses } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
    const [resettingPasswordTeacher, setResettingPasswordTeacher] = useState<Teacher | null>(null);
    const [assigningPassTeacher, setAssigningPassTeacher] = useState<Teacher | null>(null);
    const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
    const [viewingAssignmentsTeacher, setViewingAssignmentsTeacher] = useState<Teacher | null>(null);
    const [editingAssignment, setEditingAssignment] = useState<TeacherCourseAssignment | null>(null);
    const [inspectingTeacher, setInspectingTeacher] = useState<Teacher | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    
    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSaveTeacher = async (data: any) => {
        try {
            let teacherData = { ...data };
            
            // Lógica robusta para Administrador de Sede
            if (user?.role === UserRole.CAMPUS_ADMIN) {
                teacherData.campusId = user.campusId;
                teacherData.campusName = user.campusName;
            } else if (teacherData.campusId && !teacherData.campusName) {
                const campus = campuses.find(c => c.id === teacherData.campusId);
                if (campus) teacherData.campusName = campus.name;
            }

            if (editingTeacher) {
                await updateTeacher(editingTeacher.id, teacherData);
                showNotification('Perfil del profesor actualizado con éxito', 'success');
            } else {
                await addTeacher(teacherData);
                showNotification('Profesor registrado correctamente en el sistema', 'success');
            }
            setIsModalOpen(false);
        } catch (e: any) {
            showNotification(e.message || 'Hubo un problema al guardar los datos del profesor.', 'error');
        }
    };

    const handleDeleteTeacher = async () => {
        if (deletingTeacher) {
            try {
                await deleteTeacher(deletingTeacher.id);
                showNotification('El profesor ha sido retirado del sistema', 'success');
            } catch (error) {
                showNotification('Error al intentar eliminar el registro.', 'error');
            }
            setDeletingTeacher(null);
        }
    };

    const handleSendResetLink = async () => {
        if (resettingPasswordTeacher) {
            try {
                await sendPasswordReset(resettingPasswordTeacher.email);
                showNotification('Enlace de recuperación enviado al correo institucional', 'success');
            } catch (e) {
                showNotification('Error al conectar con el servidor de correo.', 'error');
            }
            setResettingPasswordTeacher(null);
        }
    };

    const handleAssignTempPass = async (tempPass: string) => {
        if (assigningPassTeacher) {
            try {
                await assignTemporaryPassword(assigningPassTeacher.id, UserRole.TEACHER, tempPass);
                showNotification('Contraseña provisional asignada y lista para primer ingreso', 'success');
            } catch (e) {
                showNotification('Error al configurar la clave provisional.', 'error');
            }
            setAssigningPassTeacher(null);
        }
    };

    const teachersForView = useMemo(() => {
        const base = user?.role === UserRole.SUPER_ADMIN ? teachers : teachers.filter(t => t.campusId === user?.campusId);
        return base.filter(teacher => teacher.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [teachers, user, searchQuery]);

    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

    return (
        <>
            {notification && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 animate-fade-in-up ${
                    notification.type === 'success' ? 'bg-emerald-600 text-white' : 
                    notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                    <span className="font-bold text-sm tracking-tight">{notification.message}</span>
                </div>
            )}

            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] dark:bg-indigo-900/20 dark:text-indigo-400">
                                <IdentificationIcon className="w-8 h-8" />
                            </div>
                            Gestión Docente
                        </h2>
                        <p className="text-sm text-slate-500 mt-2 dark:text-slate-400 font-medium ml-[4.5rem]">Control de profesorado y asignaciones para {user?.campusName || 'el Ecosistema'}.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="Filtrar por nombre..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-medium"
                            />
                             <div className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                        </div>
                        {user && hasPermission(user.role, Action.MANAGE_TEACHERS) && (
                            <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-primary text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-primary/30 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <PlusIcon className="w-5 h-5"/> Nuevo Docente
                            </button>
                        )}
                    </div>
                </div>

                <Card className="p-0 overflow-hidden border-none shadow-soft rounded-[2.5rem]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5">Nombre y Especialidad</th>
                                    <th className="px-6 py-5 text-center">Materias Asignadas</th>
                                    <th className="px-6 py-5">Estado Contrato</th>
                                    <th className="px-8 py-5 text-right">Gestión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {teachersForView.map((teacher) => {
                                    const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
                                    return (
                                    <tr key={teacher.id} className="bg-white hover:bg-slate-50/50 transition-all dark:bg-slate-900 dark:hover:bg-slate-800/50 group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-white dark:border-slate-700 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                                    {teacher.avatar ? <img src={teacher.avatar} alt="" className="w-full h-full object-cover"/> : teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-base">{teacher.name}</p>
                                                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest">{teacher.subject || 'Especialidad Pendiente'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button 
                                                onClick={() => setViewingAssignmentsTeacher(teacher)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all focus:outline-none shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 text-[10px] font-black uppercase tracking-tighter"
                                            >
                                                {teacherAssignments.length} Asignaturas
                                                <ChevronRightIcon className="w-3 h-3 opacity-40" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${teacher.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                {teacher.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button onClick={() => setInspectingTeacher(teacher)} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-all shadow-sm border border-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:border-slate-700" title="Ver Ficha Completa">
                                                    <EyeIcon className="w-5 h-5"/>
                                                </button>
                                                {isSuperAdmin && (
                                                    <button onClick={() => setAssigningPassTeacher(teacher)} className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-all shadow-sm border border-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800" title="Clave Provisional">
                                                        <KeyIcon className="w-5 h-5"/>
                                                    </button>
                                                )}
                                                <button onClick={() => setResettingPasswordTeacher(teacher)} className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-all shadow-sm border border-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800" title="Restablecimiento Email">
                                                    <PaperAirplaneIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }} className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all shadow-sm border border-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800" title="Editar Perfil">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => setDeletingTeacher(teacher)} className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-all shadow-sm border border-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800" title="Eliminar Registro">
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {isModalOpen && (
                <TeacherFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSaveTeacher} 
                    teacherToEdit={editingTeacher} 
                    user={user} 
                    campuses={campuses} 
                />
            )}
            
            {deletingTeacher && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl border-none p-8 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrashIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">¿Eliminar Profesor?</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Está a punto de eliminar a <span className="font-bold text-slate-800 dark:text-white">{deletingTeacher.name}</span>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center gap-3 mt-8">
                            <button onClick={() => setDeletingTeacher(null)} className="px-8 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">Cancelar</button>
                            <button onClick={handleDeleteTeacher} className="px-8 py-2.5 bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg active:scale-95 transition-all">Sí, Eliminar</button>
                        </div>
                    </Card>
                </div>
            )}

            {inspectingTeacher && <ViewTeacherModal teacher={inspectingTeacher} onClose={() => setInspectingTeacher(null)} />}
            
            {resettingPasswordTeacher && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl border-none p-8 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PaperAirplaneIcon className="w-8 h-8 -rotate-45" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Restablecer por Email</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Enviaremos un enlace seguro a <strong className="text-indigo-600">{resettingPasswordTeacher.email}</strong>.
                        </p>
                        <div className="flex justify-center gap-3 mt-8">
                            <button onClick={() => setResettingPasswordTeacher(null)} className="px-8 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200">Cancelar</button>
                            <button onClick={handleSendResetLink} className="px-8 py-2.5 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg active:scale-95 transition-all">Enviar Enlace</button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default TeacherManagementPage;
