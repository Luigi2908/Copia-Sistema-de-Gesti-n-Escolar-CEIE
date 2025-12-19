
import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, UserRole, User, Campus, TeacherCourseAssignment } from '../../types';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Action, hasPermission } from '../../utils/permissions';
import { UploadIcon, UserAddIcon, PlusIcon, KeyIcon, EditIcon, TrashIcon, BookOpenIcon, EyeIcon, IdentificationIcon, CloseIcon, PaperAirplaneIcon, EyeSlashIcon, DownloadIcon, ChevronRightIcon } from '../icons';
import { useData } from '../../context/DataContext';

// Datos corregidos según archivo PDF (Facultad > Programa > Semestre > Materias)
const CURRICULUM_DATA: any = {
    'Innovación': {
        'Publicidad': {
            '1': ['Técnicas de aprendizaje', 'Planificación y gestión del tiempo', 'Matemáticas básicas', 'Liderazgo', 'Excel nivel básico', 'Sociología I', 'Planeación de campañas', 'Inglés básico nivel I', 'Excel nivel intermedio', 'Community manager - facebook ADS'],
            '2': ['TICS', 'Introducción al diseño de producto', 'Resolución de conflictos', 'Trabajo en Equipo', 'Inglés básico nivel II', 'Socioantropología', 'Excel nivel avanzado', 'Sociología nivel II', 'Geoogle ADS', 'Psicología del consumidor'],
            '3': ['Mercado y ventas', 'Creatividad organizacional', 'Emprendimiento e innovación empresarial', 'Inglés básico nivel III', 'Gestión de presupuestos', 'Estrategia de producto', 'Oratoria', 'E-mail marketing', 'Photoshop básico', 'Estrategia de innovación'],
            '4': ['Adobe ilustrator nivel básico', 'Corel draw básico', 'Metodología de investigación', 'Investigación de mercados', 'Creación de empresas', 'Habilidades de presentación', 'Photoshop intermedio', 'Ética profesional', 'Sociología III', 'Preparación Pruebas T y T'],
            '5': ['Formulación de proyectos en marco lógico', 'Diseño de identidad corporativa', 'Animación virtual', 'Inglés intermedio nivel I', 'Fintech finanzas digitales', 'Neuromarketing', 'Inteligencia de mercados', 'Comunicación y escucha activa'],
            '6': ['Guiones y libretos', 'Ingles intermedio nivel II', 'Diseño de web con Divi', 'After effects básico', 'Expresión corporal', 'Desarrollo empresarial y proyección social', 'Gestión ágil de proyectos innovadores', 'Dirección gráfica'],
            '7': ['Relaciones públicas', 'AutoCAD 2D intermedio', 'After effects avanzado', 'Marketing político', 'Producción de audio', 'Plan de mercadeo estratégico', 'Gestión comercial y ventas', 'AutoCAD 3D'],
            '8': ['Green marketing', 'Fotografía', 'Técnicas de negociación', 'Mercadeo relacional', 'Negocios digitales', 'Brading', 'Escritura de textos científicos', 'Preparación pruebas Saber PRO']
        },
        'Marketing Internacional': {
            '1': ['Técnicas de aprendizaje', 'Planificación del tiempo', 'Matemática básica', 'Liderazgo', 'Sociología I', 'TICS', 'Trabajo en equipo', 'Inglés básico nivel I', 'Excel nivel básico', 'Creatividad organizacional'],
            '2': ['Mercadeo y ventas', 'Gestión de talento humano', 'Resolución de conflictos', 'Estrategia de producto y marca', 'Inglés básico nivel II', 'Legislación laboral', 'Community manager', 'Atención y servicio al cliente', 'Psicología del consumidor', 'Excel nivel intermedio'],
            '3': ['Pedagogía y didáctica', 'Investigación de mercados', 'Comunicación escucha activa', 'Inglés básico nivel III', 'Inteligencia de mercados', 'Legislación comercial', 'Excel nivel avanzado', 'Sociología II', 'Creación de empresas', 'Marketing mix internacional'],
            '4': ['Gestión documentos', 'Gestión ambiental', 'Metodología de investigación', 'Trading', 'Neuromarketing', 'Fintech finanzas digitales', 'Sociología III', 'Ética profesional', 'Habilidades de presentación', 'Preparación Pruebas T y T'],
            '5': ['Formulación de proyectos marco lógico', 'Contabilidad I', 'Inglés intermedio nivel I', 'Alta gerencia', 'Direccionamiento y planeación estratégica', 'Probabilidad y estadística', 'Planeación de campañas', 'Gerencia de transporte']
        }
    },
    'Ingeniería': {
        'Ingenieria de Sistemas': {
            '1': ['Técnicas de aprendizaje', 'Planificación y gestión del tiempo', 'Introducción a la informática', 'Ofiática', 'Sistemas operativos - linux', 'Creatividad organizacional', 'HTML', 'Matemáticas básicas', 'Programación algorítmica', 'Inglés básico nivel I'],
            '2': ['Fundamentos de programación', 'Excel nivel básico', 'Metodología de la investigación', 'Fundamentos de redes', 'Mantenimiento de equipos nivel básico', 'Probbilidad y estadística', 'Fundamentos de bases de datos', 'CSS - Flexbox', 'JAVA SCRIPT', 'Gestión y auditoría en sistemas'],
            '3': ['TICS', 'Fundamentos de diseño', 'Excel nivel intermedio', 'Mantenimiento de equipos avanzado', 'Cálculo multivariables', 'PHP básico', 'Photoshop intermedio', 'Inglés básico nivel II', 'Ngocios digitales', 'Gestión de redes'],
            '4': ['Fundamentos angular', 'Mercadeo y ventas', 'Sguridad informática', 'Excel nivel avanzado', 'Fundamentos de electrónica', 'Adinistración de redes', 'Fundamentos de Spring framework', 'Diseño web con Divi', 'Pruebas T y T', 'JAVA'],
            '5': ['Formulación de proyectos y marco lógico', 'PHP nivel avanzado', 'Arquitectura TI', 'Inglés intermedio nivel I', 'Fundamentos de Python', 'Facebook ADS', 'Inglés básico nivel III', 'Diseño UX UI'],
            '6': ['Juegos gerenciales', 'BACK END', 'Física, electrónica y laboratorio', 'Big Data I', 'Fundamentos de machine Learning', 'Gestión ágil de proyectos innovadores', 'Android desde cero', 'Producción de audio'],
            '7': ['Fundamentos de VUE JS', 'Técnicas de negociación', 'Gerencia y gestión de TI', 'Inglés intermedio nivel II', 'Adinistadores de servidores', 'Métodos numéricos', 'Excel nivel experto', 'Inglés intermedio nivel III'],
            '8': ['Inteligencia artificial', 'Big Data II', 'Nuromarketing', 'Data Warehouse', 'GITHUB desde cero', 'Pruebas saber PRO', 'Programación orientada a objetos con PHP', 'Sistemas móviles']
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
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{teacher.professionalProfile || 'Docente'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identificación</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.documentNumber}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{teacher.email}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.phone}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sede de Trabajo</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.campusName}</p>
                    </div>
                </div>

                {teacher.observation && (
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Perfil y Observaciones</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{teacher.observation}"</p>
                    </div>
                )}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                <button onClick={onClose} className="px-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all text-sm">Cerrar</button>
            </div>
        </Card>
    </div>
);

const ViewAssignmentsModal: React.FC<{
    teacher: Teacher;
    assignments: TeacherCourseAssignment[];
    onClose: () => void;
    onEdit: (assignment: TeacherCourseAssignment) => void;
    onDelete: (id: string) => void;
}> = ({ teacher, assignments, onClose, onEdit, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl shadow-2xl animate-fade-in-up border-none max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Carga Académica Detallada</h2>
                        <p className="text-sm text-slate-500">Docente: <span className="font-bold text-indigo-600">{teacher.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {assignments.length > 0 ? (
                        <div className="grid gap-3">
                            {assignments.map((ass) => (
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
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onEdit(ass)}
                                            className="p-2 bg-white dark:bg-slate-900 text-amber-500 hover:text-amber-600 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                                            title="Editar Materia"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(ass.id)}
                                            className="p-2 bg-white dark:bg-slate-900 text-rose-500 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                                            title="Eliminar de la carga"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-slate-400">
                            <BookOpenIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No hay materias asignadas a este docente.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all text-sm">Cerrar</button>
                </div>
            </Card>
        </div>
    );
};

const AssignmentModal: React.FC<{
    teacher: Teacher;
    assignmentToEdit?: TeacherCourseAssignment | null;
    onClose: () => void;
    onSave: (data: { subject: string, grade: string, faculty?: string, program?: string, id?: string }) => void;
}> = ({ teacher, assignmentToEdit, onClose, onSave }) => {
    const { assignments } = useData();
    const [faculty, setFaculty] = useState<string>('');
    const [program, setProgram] = useState<string>('');
    const [semester, setSemester] = useState<string>('all'); 
    const [subject, setSubject] = useState<string>(assignmentToEdit?.subject || '');

    const faculties = Object.keys(CURRICULUM_DATA);
    const programs = faculty ? Object.keys(CURRICULUM_DATA[faculty]) : [];
    const semesters = (faculty && program) ? Object.keys(CURRICULUM_DATA[faculty][program]) : [];
    
    const subjects = useMemo(() => {
        if (!faculty || !program) return [];
        
        let allSubs: string[] = [];
        if (semester === 'all') {
            Object.values(CURRICULUM_DATA[faculty][program]).forEach((semSubs: any) => {
                allSubs.push(...semSubs);
            });
            allSubs = Array.from(new Set(allSubs));
        } else {
            allSubs = [...(CURRICULUM_DATA[faculty][program][semester] || [])];
        }

        const currentClassLabel = semester === 'all' ? `${program} (Todos los semestres)` : `${program} - Semestre ${semester}`;

        return allSubs.filter(sub => {
            const isAlreadyAssigned = assignments.some(a => a.subject === sub && a.class === currentClassLabel && a.id !== assignmentToEdit?.id);
            return !isAlreadyAssigned;
        }).sort();

    }, [faculty, program, semester, assignments, assignmentToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            id: assignmentToEdit?.id,
            subject, 
            grade: semester === 'all' ? `${program} (Todos los semestres)` : `${program} - Semestre ${semester}`, 
            faculty,
            program
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[80] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl shadow-2xl border-none animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">{assignmentToEdit ? 'Editar Materia' : 'Asignar Carga Académica'}</h2>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Docente: <span className="font-bold text-primary">{teacher.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">1. Facultad</label>
                        <select 
                            value={faculty} 
                            onChange={(e) => { setFaculty(e.target.value); setProgram(''); setSemester('all'); setSubject(''); }} 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            required
                        >
                            <option value="">Seleccione Facultad</option>
                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">2. Programa Académico</label>
                        <select 
                            value={program} 
                            onChange={(e) => { setProgram(e.target.value); setSemester('all'); setSubject(''); }} 
                            disabled={!faculty}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                            required
                        >
                            <option value="">Seleccione Programa</option>
                            {programs.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">3. Semestre (Filtrar)</label>
                        <select 
                            value={semester} 
                            onChange={(e) => { setSemester(e.target.value); setSubject(''); }} 
                            disabled={!program}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                        >
                            <option value="all">TODOS LOS SEMESTRES (Habilitado)</option>
                            {semesters.map(n => <option key={n} value={n}>Semestre {n}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">4. Espacio Académico (Materia)</label>
                        <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            disabled={!program}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50 font-bold"
                            required
                        >
                            <option value="">{subjects.length > 0 ? 'Seleccione Espacio Académico' : 'No hay espacios disponibles (Todos asignados)'}</option>
                            {subjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all dark:bg-slate-700 dark:text-white">Cancelar</button>
                        <button type="submit" disabled={!subject} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
                            <BookOpenIcon className="w-5 h-5"/> {assignmentToEdit ? 'Actualizar Materia' : 'Confirmar Carga'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const TeacherFormModal: React.FC<{
    onClose: () => void;
    onSave: (teacher: any) => void;
    teacherToEdit: Teacher | null;
    user: User | null;
    campuses: Campus[];
}> = ({ onClose, onSave, teacherToEdit, user, campuses }) => {
    const { assignments } = useData();
    const isEditing = !!teacherToEdit;
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
    const [faculty, setFaculty] = useState<string>('');
    const [program, setProgram] = useState<string>('');

    const programs = faculty ? Object.keys(CURRICULUM_DATA[faculty]) : [];
    
    const availableSubjects = useMemo(() => {
        if (!faculty || !program) return [];
        const subs: string[] = [];
        Object.values(CURRICULUM_DATA[faculty][program]).forEach((sArr: any) => subs.push(...sArr));
        const uniqueSubs = Array.from(new Set(subs));
        return uniqueSubs.filter(sub => {
            if (isEditing && sub === teacherToEdit?.subject) return true;
            return !assignments.some(a => a.subject === sub);
        }).sort();
    }, [faculty, program, assignments, isEditing, teacherToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl">
                <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{isEditing ? 'Editar Perfil Docente' : 'Nuevo Profesor'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Documento</label>
                            <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full p-2.5 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Teléfono</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Correo Institucional</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                    </div>
                    
                    {user?.role === UserRole.SUPER_ADMIN && (
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Sede</label>
                            <select name="campusId" value={formData.campusId} onChange={handleChange} className="w-full p-2.5 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required>
                                <option value="">Seleccionar Sede</option>
                                {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Estado</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors">
                            {isEditing ? 'Guardar Cambios' : 'Crear Profesor'}
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
            <Card className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Asignar Clave Provisional</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-5 h-5"/></button>
                </div>
                <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">Docente: <strong>{user.name}</strong></p>
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                        <label className="block text-xs font-bold mb-1 uppercase text-gray-500 dark:text-gray-400">Nueva Contraseña</label>
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-10"
                            placeholder="Ingrese clave temporal"
                            required
                            minLength={4}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">Cancelar</button>
                        <button type="submit" className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 shadow-md">Guardar</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

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
            if (teacherData.campusId && !teacherData.campusName) {
                const campus = campuses.find(c => c.id === teacherData.campusId);
                if (campus) teacherData.campusName = campus.name;
            }

            if (editingTeacher) {
                await updateTeacher(editingTeacher.id, teacherData);
                showNotification('Profesor actualizado', 'success');
            } else {
                await addTeacher(teacherData);
                showNotification('Profesor creado', 'success');
            }
            setIsModalOpen(false);
        } catch (e: any) {
            showNotification(e.message || 'Error al guardar', 'error');
        }
    };

    const handleDeleteTeacher = async () => {
        if (deletingTeacher) {
            try {
                await deleteTeacher(deletingTeacher.id);
                showNotification('Profesor eliminado', 'success');
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
            setDeletingTeacher(null);
        }
    };

    const handleSendResetLink = async () => {
        if (resettingPasswordTeacher) {
            try {
                await sendPasswordReset(resettingPasswordTeacher.email);
                showNotification('Enlace enviado', 'success');
            } catch (e) {
                showNotification('Error al enviar', 'error');
            }
            setResettingPasswordTeacher(null);
        }
    };

    const handleAssignTempPass = async (tempPass: string) => {
        if (assigningPassTeacher) {
            try {
                await assignTemporaryPassword(assigningPassTeacher.id, UserRole.TEACHER, tempPass);
                showNotification('Contraseña provisional asignada', 'success');
            } catch (e) {
                showNotification('Error al asignar contraseña', 'error');
            }
            setAssigningPassTeacher(null);
        }
    };

    const handleSaveAssignment = async (data: any) => {
        if (!assigningTeacher) return;
        try {
            if (data.id) {
                await updateAssignment(data.id, {
                    subject: data.subject,
                    class: data.grade,
                });
                showNotification('Asignación actualizada', 'success');
            } else {
                await addAssignment({
                    teacherId: assigningTeacher.id,
                    subject: data.subject,
                    class: data.grade,
                    section: '-',
                    jornada: 'Diurno',
                    intensidadHoraria: 4 
                });
                showNotification('Carga asignada exitosamente', 'success');
            }
            setAssigningTeacher(null);
            setEditingAssignment(null);
        } catch (e) {
            showNotification('Error al gestionar carga', 'error');
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        if (!window.confirm('¿Eliminar esta materia de la carga académica?')) return;
        try {
            await deleteAssignment(id);
            showNotification('Materia eliminada de la carga', 'success');
        } catch (e) {
            showNotification('Error al eliminar materia', 'error');
        }
    };

    const teachersForView = (user?.role === UserRole.SUPER_ADMIN ? teachers : teachers.filter(t => t.campusId === user?.campusId))
        .filter(teacher => teacher.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

    return (
        <>
        {notification && (
            <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
                notification.type === 'success' ? 'bg-emerald-600 text-white' : 
                notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
            }`}>
                <span className="font-medium text-sm">{notification.message}</span>
            </div>
        )}
        <Card className="flex flex-col h-full border-none shadow-none bg-transparent p-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900">
                    <div>
                        <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400">
                                <IdentificationIcon className="w-6 h-6" />
                            </div>
                            Gestión de Profesores
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 dark:text-slate-400 ml-11">Administración docente y carga académica.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="Buscar profesor..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            />
                             <div className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                        </div>
                        {user && hasPermission(user.role, Action.MANAGE_TEACHERS) && (
                            <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2">
                                <PlusIcon className="w-4 h-4"/> Añadir Profesor
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 font-semibold tracking-wider dark:bg-slate-800 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nombre Completo</th>
                                <th scope="col" className="px-6 py-4 text-center">Carga Actual</th>
                                <th scope="col" className="px-6 py-4">Estado</th>
                                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {teachersForView.map((teacher) => {
                                const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
                                const assignedCoursesCount = teacherAssignments.length;
                                return (
                                <tr key={teacher.id} className="bg-white hover:bg-slate-50/80 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                                {teacher.avatar ? <img src={teacher.avatar} alt="" className="w-full h-full object-cover"/> : teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold">{teacher.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{teacher.documentNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => setViewingAssignmentsTeacher(teacher)}
                                            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all focus:outline-none shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50"
                                        >
                                            <BookOpenIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            <span className="font-black text-xs uppercase tracking-tight">{assignedCoursesCount} Materias</span>
                                            <ChevronRightIcon className="w-3 h-3 opacity-40 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${teacher.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                            {teacher.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                       {user && hasPermission(user.role, Action.MANAGE_TEACHERS) && (
                                           <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => setInspectingTeacher(teacher)} className="p-2 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white" title="Ver Información Completa">
                                                    <EyeIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => setAssigningTeacher(teacher)} className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-all focus:outline-none shadow-sm dark:bg-indigo-900/20 dark:text-indigo-400" title="Nueva Asignación">
                                                    <PlusIcon className="w-4 h-4"/>
                                                </button>
                                                {isSuperAdmin && (
                                                    <button onClick={() => setAssigningPassTeacher(teacher)} className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-all focus:outline-none shadow-sm dark:bg-amber-900/20 dark:text-amber-400" title="Clave Provisional">
                                                        <KeyIcon className="w-4 h-4"/>
                                                    </button>
                                                )}
                                                <button onClick={() => setResettingPasswordTeacher(teacher)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400" title="Restablecer Vía Email">
                                                    <PaperAirplaneIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-amber-400" title="Editar Perfil">
                                                    <EditIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => setDeletingTeacher(teacher)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-400" title="Eliminar Profesor">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>

        {isModalOpen && <TeacherFormModal onClose={() => setIsModalOpen(false)} onSave={handleSaveTeacher} teacherToEdit={editingTeacher} user={user} campuses={campuses} />}
        {deletingTeacher && <DeleteConfirmationModal teacher={deletingTeacher} onClose={() => setDeletingTeacher(null)} onConfirm={handleDeleteTeacher} />}
        {resettingPasswordTeacher && <ResetPasswordConfirmationModal user={resettingPasswordTeacher} onClose={() => setResettingPasswordTeacher(null)} onConfirm={handleSendResetLink} />}
        {assigningPassTeacher && <TempPasswordModal user={assigningPassTeacher} onClose={() => setAssigningPassTeacher(null)} onSave={handleAssignTempPass} />}
        {inspectingTeacher && <ViewTeacherModal teacher={inspectingTeacher} onClose={() => setInspectingTeacher(null)} />}

        {(assigningTeacher || editingAssignment) && (
            <AssignmentModal 
                teacher={assigningTeacher!} 
                assignmentToEdit={editingAssignment}
                onClose={() => { setAssigningTeacher(null); setEditingAssignment(null); }} 
                onSave={handleSaveAssignment} 
            />
        )}

        {viewingAssignmentsTeacher && (
            <ViewAssignmentsModal 
                teacher={viewingAssignmentsTeacher}
                assignments={assignments.filter(a => a.teacherId === viewingAssignmentsTeacher.id)}
                onClose={() => setViewingAssignmentsTeacher(null)}
                onEdit={(ass) => {
                    setEditingAssignment(ass);
                    setAssigningTeacher(viewingAssignmentsTeacher);
                    setViewingAssignmentsTeacher(null);
                }}
                onDelete={handleDeleteAssignment}
            />
        )}
        </>
    );
};

const DeleteConfirmationModal: React.FC<{ teacher: Teacher; onClose: () => void; onConfirm: () => void; }> = ({ teacher, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Eliminar Profesor</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">¿Está seguro de que desea eliminar a <span className="font-bold text-gray-900 dark:text-white">{teacher.name}</span>?</p>
            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 shadow-sm transition-colors">Eliminar</button>
            </div>
        </Card>
    </div>
);

const ResetPasswordConfirmationModal: React.FC<{ user: User; onClose: () => void; onConfirm: () => void; }> = ({ user, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 dark:text-white">Restablecer Contraseña (Email)</h2>
             <div className="space-y-3 text-sm">
                <p className="dark:text-gray-300">Se enviará un correo a <strong className="text-primary">{user.email}</strong>.</p>
                <p className="dark:text-gray-400">¿Desea continuar?</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white">Cancelar</button>
                <button onClick={onConfirm} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 shadow-md transition-colors">
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Enviar
                </button>
            </div>
        </Card>
    </div>
);

export default TeacherManagementPage;
