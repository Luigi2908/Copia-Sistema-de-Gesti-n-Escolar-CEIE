
import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, UserRole, User, Campus, TeacherCourseAssignment } from '../../types';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Action, hasPermission } from '../../utils/permissions';
import { UploadIcon, UserAddIcon, PlusIcon, KeyIcon, EditIcon, TrashIcon, BookOpenIcon, EyeIcon, IdentificationIcon, CloseIcon, PaperAirplaneIcon, EyeSlashIcon, DownloadIcon } from '../icons';
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
            '7': ['Fundamentos de VUE JS', 'Técnicas de negociación', 'Gerencia y gestión de TI', 'Inglés intermedio nivel II', 'Adinistradores de servidores', 'Métodos numéricos', 'Excel nivel experto', 'Inglés intermedio nivel III'],
            '8': ['Inteligencia artificial', 'Big Data II', 'Nuromarketing', 'Data Warehouse', 'GITHUB desde cero', 'Pruebas saber PRO', 'Programación orientada a objetos con PHP', 'Sistemas móviles']
        },
        'Ingenieria Industrial': {
            '1': ['Técnicas de aprendizaje', 'Plnificación y gestión del tiempo', 'Mtemáticas básicas', 'Liderazgo', 'Seguridad y salud en el trabajo', 'Primeros auxilios', 'Trbajo en equipo', 'English Basic Level 1', 'Excel nivel básico', 'Legislación seguridad y salud', 'Pln de emergencias'],
            '2': ['Tecnologías de la comunicación TIC´S', 'Gestión de Talento humano', 'English Basic Level 2', 'Legislación laboral', 'Cálculo multivariado', 'Gestión de COPASST', 'Excel nivel intermedio', 'Desarrollo Rural', 'Gestión del Riesgo ISO 31000', 'Mtemáticas financieras I'],
            '3': ['Medicina preventiva y del trabajo', 'English Basic Level 3', 'Inv. de incidentes y accidentes', 'Excel nivel avanzado', 'Hgiene industrial', 'Química general', 'Estrategias de innovación', 'Gestión ambiental ISO 14001', 'Probabilidad y estadística', 'Gestión de la calidad en Salud'],
            '4': ['Gestión documental', 'Metodología de la investigación', 'Ecuaciones diferenciales', 'Ética profesional', 'Preparación pruebas saber TyT', 'Gestión y control de indicadores', 'Gestión y control de calidad', 'Procesos Administrativos', 'Gerencia Sistemas de Calidad HSEQ', 'Auditoria y control interno']
        },
        'Diseño Industrial': {
            '1': ['Técnicas de aprendizaje', 'Planificación y gestión del tiempo', 'Fundamentos de diseño gráfico', 'Liderazgo', 'Emprendimiento innovación empresarial', 'Geometría descriptiva I', 'Trabajo en equipo', 'English Basic Level 1', 'Excel nivel básico', 'Introducción al diseño del producto'],
            '2': ['Tecnologias de la comunicación TIC´S', 'Dibujo', 'Adobe Photoshop Básico', 'English Basic Level 2', 'Investigación de mercados', 'AutoCAD 2D Nivel Básico', 'Geometría descriptiva II', 'Alta gerencia', 'Excel nivel intermedio', 'Psicología del color'],
            '3': ['Mercadeo y ventas', 'Adobe Photoshop intermedio', 'English Basic Level 3', 'Estrategias de innovación', 'Corel Draw nivel básico', 'Excel nivel avanzado', 'AutoCAD 2D nivel intermedio', 'Animación virtual con pencil 2D', 'Adobe Photoshop Experto', 'Introducción a 3D studio Max'],
            '4': ['Geometría descritiva III', 'Metodología de la investigación', 'After effect nivel básico', 'Creatividad organizacional', 'After effects nivel intermedio', 'Ética profesional', 'After effects nivel avanzado', 'Preparación pruebas saber TyT', 'Psicología del consumidor', 'Adobe ilustrator nivel Básico']
        }
    },
    'Ciencias Administrativas y Contables': {
        'Contaduría Pública': {
            '1': ['Técnicas de aprendizaje', 'Plnificación y gestión del tiempo', 'Mtemáticas básicas', 'Liderazgo', 'Excel nivel básico', 'Mtemáticas financieras I', 'Procesos Administrativos', 'English Basic Level 1', 'Excel nivel intermedio', 'Contabilidad I', 'Fundamentos de economía', 'Ofimática'],
            '2': ['Tecnologias de la comunicación TIC´S', 'Gestión de Talento humano', 'English Basic Level 2', 'Legislación laboral', 'Excel nivel avanzado', 'Derechos humanos', 'Contabilidad II', 'Comercio internacional', 'Legislación comercial', 'Sistematización de procesos aduaneros'],
            '3': ['Mtemáticas financieras II', 'Emprendimiento/innovación empresarial', 'English Basic Level 3', 'Gestión de presupuesto', 'Excel nivel experto', 'Seguridad informática', 'Contabilidad III', 'Gestión documental', 'Mrco juridico creación de empresas'],
            '4': ['Metodología de la investigación', 'Investigación de mercados', 'Creación de empresas', 'Ética profesional', 'Preparación pruebas TyT', 'Probabilidad y estadística', 'Blockchain', 'Estadistica descriptiva', 'Metodos númericos', 'Power BI', 'Mercado bursatil']
        },
        'Administración de Empresas': {
            '1': ['Técnicas de aprendizaje', 'Planificación y gestión del tiempo', 'Procesos administrativos', 'Liderazgo', 'Procesos Organizacionales I', 'Matemáticas financieras I', 'Administración de la producción', 'Inglés básico nivel I', 'Excel nivel básico', 'Contabilidad I', 'Fundamentos de economía', 'Matemáticas básicas'],
            '2': ['Tecnologias de la comunicación TIC´S', 'Gestión de talento Humano', 'Trabajo en equipo', 'Inglés básico nivel II', 'Legislación laboral', 'Procesos Organizacionales II', 'Derechos Humanos', 'Contabilidad II', 'Excel nivel intermedio', 'Estrategia del producto y marca', 'Atención y Servicio al cliente'],
            '3': ['Mercadeo y ventas', 'Etnoeducación', 'Emprendimiento-innovación empresarial', 'English Basic Level 3', 'Procesos organizacionales III', 'Oratoria', 'Excel nivel avanzado', 'Contabilidad III', 'Gestión Documental', 'Probabilidad y estadística', 'Mercado bursatil', 'Nómina y prestaciones sociales', 'Marketing Mix Internacional'],
            '4': ['English Basic Level 4', 'Metodología de la investigación', 'Investigación de los mercados', 'Creación de empresas', 'Estrategias de innovación', 'Ética profesional', 'Seguridad y salud en el trabajo', 'Preparación pruebas TyT', 'Costos por procesos', 'Legislación comercial']
        }
    }
};

const AssignmentModal: React.FC<{
    teacher: Teacher;
    onClose: () => void;
    onSave: (data: { subject: string, grade: string, faculty?: string, program?: string }) => void;
}> = ({ teacher, onClose, onSave }) => {
    const [faculty, setFaculty] = useState<string>('');
    const [semester, setSemester] = useState<string>('');
    const [program, setProgram] = useState<string>('');
    const [subject, setSubject] = useState<string>('');

    // Listas dinámicas
    const faculties = Object.keys(CURRICULUM_DATA);
    const semesters = (faculty && program) ? Object.keys(CURRICULUM_DATA[faculty][program]) : ['1', '2', '3', '4', '5', '6', '7', '8'];
    const programs = faculty ? Object.keys(CURRICULUM_DATA[faculty]) : [];
    const subjects = (faculty && program && semester) ? CURRICULUM_DATA[faculty][program][semester] : [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            subject, 
            grade: `Semestre ${semester}`, 
            faculty,
            program
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl shadow-2xl border-none">
                <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Asignar Carga Académica</h2>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Docente: <span className="font-bold text-primary">{teacher.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Facultad */}
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">1. Facultad</label>
                            <select 
                                value={faculty} 
                                onChange={(e) => { setFaculty(e.target.value); setProgram(''); setSemester(''); setSubject(''); }} 
                                className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                required
                            >
                                <option value="">Seleccione Facultad</option>
                                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        {/* 2. Semestre (Antepenúltimo en el flujo visual del grid) */}
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">2. Semestre</label>
                            <select 
                                value={semester} 
                                onChange={(e) => { setSemester(e.target.value); setSubject(''); }} 
                                disabled={!program}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                                required
                            >
                                <option value="">Seleccione Semestre</option>
                                {semesters.map(n => <option key={n} value={n}>Semestre {n}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 3. Programa Académico (Penúltimo) */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">3. Programa Académico</label>
                        <select 
                            value={program} 
                            onChange={(e) => { setProgram(e.target.value); setSemester(''); setSubject(''); }} 
                            disabled={!faculty}
                            className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                            required
                        >
                            <option value="">Seleccione Programa</option>
                            {programs.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* 4. Asignatura (Espacio - Último) */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 ml-1">4. Asignatura (Espacio Académico)</label>
                        <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            disabled={!semester}
                            className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                            required
                        >
                            <option value="">Seleccione Asignatura</option>
                            {subjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            <BookOpenIcon className="w-5 h-5"/> Confirmar Carga
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const BulkUploadTeachersModal: React.FC<{
    onClose: () => void;
    onSave: (newTeachers: any[]) => void;
    user: User | null;
    campuses: Campus[];
}> = ({ onClose, onSave, user, campuses }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [campusId, setCampusId] = useState(user?.role === UserRole.SUPER_ADMIN ? (campuses[0]?.id || '') : (user?.campusId || ''));

    const downloadTemplate = () => {
        const headers = "nombre,documento,correo,telefono,asignatura\n";
        const example = "Marta Gomez,87654321,marta@ejemplo.com,3109876543,Matemáticas\n";
        const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_profesores.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            setIsProcessing(true);
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const rows = text.split('\n').filter(row => row.trim());
                const data = rows.slice(1).map(row => {
                    const columns = row.split(',').map(col => col.trim());
                    return {
                        name: columns[0],
                        documentNumber: columns[1],
                        email: columns[2],
                        phone: columns[3],
                        subject: columns[4] || 'General',
                        campusId: campusId,
                        status: 'active'
                    };
                });
                setParsedData(data);
                setIsProcessing(false);
            };
            reader.readAsText(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Carga Masiva de Profesores</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-1">
                                <DownloadIcon className="w-4 h-4"/> Formato requerido (CSV):
                            </p>
                            <code className="text-[10px] block bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-700 dark:text-slate-300">
                                nombre, documento, correo, telefono, asignatura
                            </code>
                        </div>
                        <button 
                            onClick={downloadTemplate}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Descargar Plantilla
                        </button>
                    </div>

                    {user?.role === UserRole.SUPER_ADMIN && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignar a Sede:</label>
                            <select value={campusId} onChange={e => setCampusId(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:text-white">
                                {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                        <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <UploadIcon className="w-10 h-10 mx-auto text-slate-300 mb-2"/>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{file ? file.name : 'Haz clic o arrastra tu archivo CSV aquí'}</p>
                    </div>

                    {parsedData.length > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Se detectaron {parsedData.length} docentes listos para importar.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">Cancelar</button>
                    <button 
                        onClick={() => onSave(parsedData)} 
                        disabled={parsedData.length === 0 || isProcessing}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        Procesar Importación
                    </button>
                </div>
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg">
                <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{isEditing ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Documento</label>
                            <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Teléfono</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Asignatura Principal</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                    </div>
                    
                    {user?.role === UserRole.SUPER_ADMIN && (
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Sede</label>
                            <select name="campusId" value={formData.campusId} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" required>
                                <option value="">Seleccionar Sede</option>
                                {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Estado</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-primary outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white">
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
                <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">Usuario: <strong>{user.name}</strong></p>
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

const TeacherManagementPage: React.FC = () => {
    const { user, sendPasswordReset } = useAuth();
    const { teachers, addTeacher, updateTeacher, deleteTeacher, assignments, addAssignment, setHomeroomAssignments, assignTemporaryPassword, campuses } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
    const [resettingPasswordTeacher, setResettingPasswordTeacher] = useState<Teacher | null>(null);
    const [assigningPassTeacher, setAssigningPassTeacher] = useState<Teacher | null>(null);
    const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    
    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSaveTeacher = async (data: any) => {
        try {
            // Ensure campusName is set if campusId is present (for Super Admin flow)
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
            } catch (e) {
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
            await addAssignment({
                teacherId: assigningTeacher.id,
                subject: data.subject,
                class: data.program, // Usamos el programa como "clase" principal en educacion superior
                section: '-',
                jornada: 'Diurno',
                intensidadHoraria: 4 
            });

            showNotification('Carga asignada exitosamente', 'success');
            setAssigningTeacher(null);
        } catch (e) {
            showNotification('Error al asignar carga', 'error');
        }
    };

    const handleBulkSave = async (teachersList: any[]) => {
        let added = 0;
        for (const t of teachersList) {
            try {
                await addTeacher(t);
                added++;
            } catch (e) {
                console.error(e);
            }
        }
        setIsBulkOpen(false);
        showNotification(`Se han importado ${added} docentes correctamente.`, 'success');
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
                        <p className="text-sm text-slate-500 mt-1 dark:text-slate-400 ml-11">Administración del cuerpo docente.</p>
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
                            <div className="flex gap-2">
                                <button onClick={() => setIsBulkOpen(true)} className="bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-sm flex items-center justify-center gap-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                                    <UploadIcon className="w-4 h-4"/> Masiva
                                </button>
                                <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2">
                                    <PlusIcon className="w-4 h-4"/> Añadir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 font-semibold tracking-wider dark:bg-slate-800 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nombre Completo</th>
                                <th scope="col" className="px-6 py-4">Asignatura</th>
                                {isSuperAdmin && <th scope="col" className="px-6 py-4">Sede</th>}
                                <th scope="col" className="px-6 py-4 text-center">Cursos</th>
                                <th scope="col" className="px-6 py-4">Correo Electrónico</th>
                                <th scope="col" className="px-6 py-4">Estado</th>
                                <th scope="col" className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {teachersForView.map((teacher) => {
                                const assignedCoursesCount = assignments.filter(a => a.teacherId === teacher.id).length;
                                return (
                                <tr key={teacher.id} className="bg-white hover:bg-slate-50/80 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                {teacher.avatar ? <img src={teacher.avatar} alt="" className="w-full h-full object-cover"/> : teacher.name.charAt(0)}
                                            </div>
                                            {teacher.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{teacher.subject}</td>
                                    {isSuperAdmin && <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{teacher.campusName}</td>}
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{assignedCoursesCount}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{teacher.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${teacher.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${teacher.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {teacher.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                       {user && hasPermission(user.role, Action.MANAGE_TEACHERS) && (
                                           <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => setAssigningTeacher(teacher)} className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all focus:outline-none shadow-sm dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40" title="Asignar Carga Académica">
                                                    <BookOpenIcon className="w-4 h-4"/>
                                                </button>
                                                {isSuperAdmin && (
                                                    <button onClick={() => setAssigningPassTeacher(teacher)} className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-all focus:outline-none shadow-sm dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-blue-900/40" title="Asignar Clave Provisional">
                                                        <KeyIcon className="w-4 h-4"/>
                                                    </button>
                                                )}
                                                <button onClick={() => setResettingPasswordTeacher(teacher)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400" title="Restablecer Contraseña (Email)">
                                                    <PaperAirplaneIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400" title="Editar">
                                                    <EditIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => setDeletingTeacher(teacher)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-400" title="Eliminar">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})}
                            {teachersForView.length === 0 && (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 dark:bg-slate-800">
                                                <IdentificationIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p>No se encontraron profesores.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
        
        {isModalOpen && <TeacherFormModal onClose={() => setIsModalOpen(false)} onSave={handleSaveTeacher} teacherToEdit={editingTeacher} user={user} campuses={campuses} />}
        {deletingTeacher && <DeleteConfirmationModal teacher={deletingTeacher} onClose={() => setDeletingTeacher(null)} onConfirm={handleDeleteTeacher} />}
        {resettingPasswordTeacher && <ResetPasswordConfirmationModal user={resettingPasswordTeacher} onClose={() => setResettingPasswordTeacher(null)} onConfirm={handleSendResetLink} />}
        {assigningPassTeacher && <TempPasswordModal user={assigningPassTeacher} onClose={() => setAssigningPassTeacher(null)} onSave={handleAssignTempPass} />}
        {assigningTeacher && <AssignmentModal teacher={assigningTeacher} onClose={() => setAssigningTeacher(null)} onSave={handleSaveAssignment} />}
        {isBulkOpen && <BulkUploadTeachersModal onClose={() => setIsBulkOpen(false)} onSave={handleBulkSave} user={user} campuses={campuses} />}
        </>
    );
};

export default TeacherManagementPage;
