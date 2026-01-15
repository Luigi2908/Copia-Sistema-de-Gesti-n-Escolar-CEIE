
import React, { useState, useMemo } from 'react';
import { Student, UserRole, Campus, User, Grade, FinancialStatus } from '../../types';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { UploadIcon, EyeIcon, EditIcon, TrashIcon, PaperAirplaneIcon, PlusIcon, AcademicCapIcon, CloseIcon, KeyIcon, EyeSlashIcon, DownloadIcon, CheckIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon } from '../icons';
import { useData } from '../../context/DataContext';

// ... (Keep other Modals like FinancialStatusModal, PromotionModal, etc. exactly as they were, only changing StudentFormModal and StudentManagementPage logic)

// FINANCIAL STATUS MODAL
const FinancialStatusModal: React.FC<{
    student: Student;
    onClose: () => void;
    onSave: (status: FinancialStatus) => void;
}> = ({ student, onClose, onSave }) => {
    const [selectedStatus, setSelectedStatus] = useState<FinancialStatus>(student.financialStatus || 'Al día');

    const statusOptions: { val: FinancialStatus; label: string; desc: string; color: string }[] = [
        { 
            val: 'Al día', 
            label: 'Al día / Paz y Salvo', 
            desc: 'El estudiante no presenta deudas. Habilitado para todos los procesos.',
            color: 'bg-emerald-500' 
        },
        { 
            val: 'Pendiente (Sensibilización)', 
            label: 'Pendiente (Etapa 1)', 
            desc: 'Saldos menores. Permite promoción con compromiso de pago.',
            color: 'bg-amber-500' 
        },
        { 
            val: 'Mora Crítica (Bloqueado)', 
            label: 'Mora Crítica (Etapa 2)', 
            desc: 'Incumplimiento grave. Bloquea automáticamente la promoción académica.',
            color: 'bg-rose-500' 
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-up border-none">
                <div className="flex justify-between items-center mb-6 pb-2 border-b dark:border-slate-700">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Gestión Financiera</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400"/></button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4">
                        <img src={student.avatar} className="w-10 h-10 rounded-full shadow-sm" alt=""/>
                        <div>
                            <p className="font-bold text-sm dark:text-white">{student.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{student.class}</p>
                        </div>
                    </div>

                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Nuevo Estado</p>
                    
                    <div className="space-y-2">
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => setSelectedStatus(opt.val)}
                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                    selectedStatus === opt.val 
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                                    : 'border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${opt.color} ${selectedStatus === opt.val ? 'ring-4 ring-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : ''}`}></div>
                                <div>
                                    <p className={`font-bold text-sm ${selectedStatus === opt.val ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{opt.desc}</p>
                                </div>
                                {selectedStatus === opt.val && <CheckIcon className="w-5 h-5 text-indigo-600 ml-auto self-center" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-4 border-t dark:border-slate-700">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                    <button 
                        onClick={() => onSave(selectedStatus)} 
                        className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all text-sm"
                    >
                        Actualizar Estado
                    </button>
                </div>
            </Card>
        </div>
    );
};

// ... Include other modals (PromotionModal, ResetPasswordConfirmationModal, TempPasswordModal, BulkUploadModal) as is ...
const PromotionModal: React.FC<{
    student: Student;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    grades: Grade[];
}> = ({ student, onClose, onConfirm, grades }) => {
    // ... (Keep existing implementation)
    const [isProcessing, setIsProcessing] = useState(false);
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const subjects = Array.from(new Set(studentGrades.map(g => g.subject)));
    const summary = subjects.map(subj => {
        const subjGrades = studentGrades.filter(g => g.subject === subj);
        const score = subjGrades.reduce((acc, g) => acc + (g.score * g.percentage / 100), 0);
        const perc = subjGrades.reduce((acc, g) => acc + g.percentage, 0);
        return { 
            name: subj, 
            final: perc > 0 ? (score * 100) / perc : 0,
            breakdown: subjGrades 
        };
    });
    const gpa = summary.length > 0 ? summary.reduce((acc, s) => acc + s.final, 0) / summary.length : 0;
    const isAcademicEligible = gpa >= 3.0;
    const financialStatus = student.financialStatus || 'Al día';
    const isFinancialBlocked = financialStatus === 'Mora Crítica (Bloqueado)';
    const isFinancialWarning = financialStatus === 'Pendiente (Sensibilización)';
    const handleConfirm = async () => {
        if (isFinancialBlocked) return;
        setIsProcessing(true);
        await onConfirm();
        setIsProcessing(false);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl shadow-2xl animate-fade-in-up border-none max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Verificación de Cierre y Promoción</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* ... (Keep existing UI content) ... */}
                    <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <img src={student.avatar} className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-lg" alt=""/>
                        <div className="flex-1">
                            <p className="font-black text-xl text-slate-800 dark:text-white">{student.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-wider">{student.class}</span>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Semestre {student.section}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio General</p>
                            <p className={`text-4xl font-black ${isAcademicEligible ? 'text-emerald-500' : 'text-rose-500'}`}>{gpa.toFixed(2)}</p>
                        </div>
                    </div>
                    {/* ... */}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 z-20">
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-white hover:shadow-sm rounded-2xl transition-all">Cancelar</button>
                    {!isFinancialBlocked ? (
                        <button disabled={isProcessing} onClick={handleConfirm} className={`px-10 py-3 text-sm font-black text-white rounded-2xl shadow-xl shadow-indigo-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all ${isAcademicEligible ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                            {isProcessing ? 'Procesando...' : isAcademicEligible ? 'Ejecutar Promoción' : 'Confirmar Repitencia'}
                        </button>
                    ) : (
                        <button disabled className="px-10 py-3 text-sm font-bold bg-slate-200 text-slate-400 rounded-2xl cursor-not-allowed">Promoción Bloqueada</button>
                    )}
                </div>
            </Card>
        </div>
    );
};

// ... Reset, Temp, Bulk ...
const ResetPasswordConfirmationModal: React.FC<{ user: User; onClose: () => void; onConfirm: () => void; }> = ({ user, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 dark:text-white">Restablecer Contraseña (Email)</h2>
             <div className="space-y-3 text-sm">
                <p className="dark:text-gray-300">Se enviará un correo electrónico a <strong className="text-primary">{user.email}</strong>.</p>
                <p className="dark:text-gray-400">¿Desea continuar?</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white">Cancelar</button>
                <button onClick={onConfirm} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 shadow-md transition-colors">
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Enviar Enlace
                </button>
            </div>
        </Card>
    </div>
);

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
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-10" placeholder="Ingrese clave temporal" required minLength={4} />
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

const BulkUploadModal: React.FC<{ onClose: () => void; onSave: (newStudents: any[]) => void; user: User | null; campuses: Campus[]; }> = ({ onClose, onSave, user, campuses }) => {
    // ... (Keep existing implementation)
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [campusId, setCampusId] = useState(user?.role === UserRole.SUPER_ADMIN ? (campuses[0]?.id || '') : (user?.campusId || ''));
    
    const downloadTemplate = () => {
        const headers = "nombre,documento,correo,telefono,programa,semestre\n";
        const example = "Juan Perez,12345678,juan@ejemplo.com,3001234567,Publicidad,1\n";
        const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_estudiantes.csv");
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
                        class: columns[4],
                        section: columns[5],
                        campusId: campusId,
                        schoolPeriod: 'A',
                        schoolYear: 2025,
                        status: 'active',
                        financialStatus: 'Al día'
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
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Carga Masiva de Estudiantes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4 mb-6">
                    {/* ... (Keep existing UI) ... */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-1"><DownloadIcon className="w-4 h-4"/> Formato requerido (CSV):</p>
                            <code className="text-[10px] block bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-700 dark:text-slate-300">nombre, documento, correo, telefono, programa, semestre</code>
                        </div>
                        <button onClick={downloadTemplate} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm">Descargar Plantilla</button>
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
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Se detectaron {parsedData.length} estudiantes listos para importar.</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">Cancelar</button>
                    <button onClick={() => onSave(parsedData)} disabled={parsedData.length === 0 || isProcessing} className="px-6 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all">Procesar Importación</button>
                </div>
            </Card>
        </div>
    );
};

// UPDATED STUDENT FORM MODAL
const StudentFormModal: React.FC<{
    onClose: () => void;
    onSave: (studentData: any) => Promise<void>;
    studentToEdit: Student | null;
    campuses: Campus[];
    user: User | null;
}> = ({ onClose, onSave, studentToEdit, campuses, user }) => {
    const isEditing = !!studentToEdit;
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: studentToEdit?.name || '',
        documentNumber: studentToEdit?.documentNumber || '',
        email: studentToEdit?.email || '',
        phone: studentToEdit?.phone || '',
        class: studentToEdit?.class || '',
        section: studentToEdit?.section || '',
        status: studentToEdit?.status || 'active',
        financialStatus: studentToEdit?.financialStatus || 'Al día',
        campusId: studentToEdit?.campusId || (user?.role === UserRole.CAMPUS_ADMIN ? user.campusId : ''),
        schoolPeriod: studentToEdit?.schoolPeriod || 'A',
        schoolYear: studentToEdit?.schoolYear || new Date().getFullYear(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            // Si tiene éxito, el padre (StudentManagementPage) cerrará el modal
        } catch (error) {
            // El error se maneja arriba, pero nos aseguramos de parar el loading
            setIsSaving(false);
        }
    };

    const programOptions = [
        { category: 'Innovación', grades: ['Publicidad', 'Marketing Internacional'] },
        { category: 'Ingeniería', grades: ['Ingenieria de Sistemas', 'Ingenieria Industrial'] }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl">
                <h2 className="text-lg font-bold mb-6 dark:text-white">{isEditing ? 'Editar Perfil Estudiantil' : 'Matricular Estudiante'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Nombre Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Documento</label>
                            <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Teléfono</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Programa</label>
                            <select name="class" value={formData.class} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" required>
                                <option value="">Seleccionar</option>
                                {programOptions.map(cat => (
                                    <optgroup key={cat.category} label={cat.category}>
                                        {cat.grades.map(g => <option key={g} value={g}>{g}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Semestre</label>
                            <select name="section" value={formData.section} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" required>
                                <option value="">Seleccionar</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s.toString()}>Semestre {s}</option>)}
                            </select>
                        </div>
                    </div>

                    {user?.role === UserRole.SUPER_ADMIN && (
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Sede Académica</label>
                            <select name="campusId" value={formData.campusId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" required>
                                <option value="">Seleccionar Sede...</option>
                                {campuses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Estado Académico</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-indigo-600 dark:text-indigo-400">Estado Administrativo (Finanzas)</label>
                            <select name="financialStatus" value={formData.financialStatus} onChange={handleChange} className="w-full p-2 border border-indigo-100 rounded bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold">
                                <option value="Al día">Al día / Pago Total</option>
                                <option value="Pendiente (Sensibilización)">Pendiente (Sensibilización)</option>
                                <option value="Mora Crítica (Bloqueado)">Mora Crítica (Bloqueado)</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {isSaving ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Finalizar Matrícula')}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

// ... (ViewStudentModal, DeleteConfirmationModal - Keep unchanged)
const ViewStudentModal: React.FC<any> = ({ student, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-2xl">
             <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Detalles del Estudiante</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="w-6 h-6"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Nombre Completo</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{student.name}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Ubicación Académica</p>
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold mt-1">
                        {student.class} - Semestre {student.section}
                    </span>
                </div>
                <div className="col-span-full border-t pt-4 dark:border-slate-700">
                    <p className="text-gray-500 text-xs uppercase font-bold mb-2">Historial de Semestres</p>
                    {student.history && student.history.length > 0 ? (
                        <div className="space-y-2">
                            {student.history.map((h: any, idx: number) => (
                                <div key={idx} className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                                    <span>Semestre {h.semester} ({h.year}-{h.period})</span>
                                    <span className={`font-bold ${h.status === 'Aprobado' ? 'text-emerald-500' : 'text-rose-500'}`}>Prom: {h.gpa} - {h.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400">No hay semestres terminados aún.</p>
                    )}
                </div>
            </div>
            <div className="mt-6 text-right">
                <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg text-sm transition-colors">Cerrar</button>
            </div>
        </Card>
    </div>
);

const DeleteConfirmationModal: React.FC<{ student: Student; onClose: () => void; onConfirm: () => void; }> = ({ student, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Eliminar Estudiante</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">¿Está seguro de que desea eliminar a <span className="font-bold text-gray-900 dark:text-white">{student.name}</span>?</p>
            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 shadow-sm transition-colors">Eliminar</button>
            </div>
        </Card>
    </div>
);

const StudentManagementPage: React.FC = () => {
    const { students, campuses, grades, addStudent, updateStudent, deleteStudent, promoteStudent, assignTemporaryPassword } = useData();
    const { user, sendPasswordReset } = useAuth();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [promotingStudent, setPromotingStudent] = useState<Student | null>(null);
    const [managingFinancial, setManagingFinancial] = useState<Student | null>(null);
    const [resettingPasswordStudent, setResettingPasswordStudent] = useState<Student | null>(null);
    const [assigningPassStudent, setAssigningPassStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const filteredStudents = students
        .filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.documentNumber.includes(searchQuery);
            if (user?.role === UserRole.SUPER_ADMIN) return matchesSearch;
            return matchesSearch && s.campusId === user?.campusId;
        });

    const handleSaveStudent = async (studentData: any) => {
        try {
            let finalData = { ...studentData };
            // Lógica de Sede para Super Admin
            if (user?.role === UserRole.CAMPUS_ADMIN) {
                finalData.campusId = user.campusId;
                finalData.campusName = user.campusName;
            } else if (finalData.campusId) {
                const selectedCampus = campuses.find(c => c.id === finalData.campusId);
                if (selectedCampus) finalData.campusName = selectedCampus.name;
            }

            if (editingStudent) {
                await updateStudent(editingStudent.id, finalData);
                showNotification('Estudiante actualizado exitosamente', 'success');
            } else {
                await addStudent(finalData);
                showNotification('Estudiante matriculado exitosamente', 'success');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error(error);
            // Mostrar mensaje de error específico si viene de la DB (ej: unique constraint)
            const msg = error.message?.includes('duplicate key') 
                ? 'El documento o correo ya existe en el sistema.' 
                : 'Error al guardar los datos del estudiante.';
            showNotification(msg, 'error');
            throw error; // Re-lanzar para que el modal sepa que falló
        }
    };

    const handleSaveFinancialStatus = async (status: FinancialStatus) => {
        if (!managingFinancial) return;
        try {
            await updateStudent(managingFinancial.id, { financialStatus: status });
            showNotification(`Estado financiero actualizado a: ${status}`, 'success');
            setManagingFinancial(null);
        } catch (error) {
            showNotification('Error al actualizar estado financiero', 'error');
        }
    };

    const handleDeleteStudent = async () => {
        if (deletingStudent) {
            try {
                await deleteStudent(deletingStudent.id);
                showNotification('Estudiante eliminado', 'success');
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
            setDeletingStudent(null);
        }
    };

    const handlePromoteConfirm = async () => {
        if (promotingStudent) {
            const result = await promoteStudent(promotingStudent.id);
            showNotification(result.message, result.type || (result.success ? 'success' : 'error'));
            setPromotingStudent(null);
        }
    };

    const handleBulkSave = async (studentsList: any[]) => { 
        let added = 0;
        let errors = 0;
        for (const stu of studentsList) {
            try { await addStudent(stu); added++; } catch (e) { errors++; }
        }
        setIsBulkOpen(false); 
        if (added > 0) showNotification(`Importación completada: ${added} exitosos.`, 'success');
        if (errors > 0) setTimeout(() => showNotification(`Hubo ${errors} errores (posibles duplicados).`, 'warning'), 1000);
    };
    
    const handleSendResetLink = async () => { 
        if (resettingPasswordStudent) {
            try {
                await sendPasswordReset(resettingPasswordStudent.email);
                showNotification(`Enlace enviado a ${resettingPasswordStudent.email}`, 'success');
            } catch (e) {
                showNotification('Error al enviar enlace', 'error');
            }
            setResettingPasswordStudent(null); 
        }
    };

    const handleAssignTempPass = async (tempPass: string) => {
        if (assigningPassStudent) {
            try {
                await assignTemporaryPassword(assigningPassStudent.id, UserRole.STUDENT, tempPass);
                showNotification('Contraseña provisional asignada', 'success');
            } catch (e) {
                showNotification('Error al asignar contraseña', 'error');
            }
            setAssigningPassStudent(null);
        }
    };

    return (
        <>
            {notification && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
                    notification.type === 'success' ? 'bg-emerald-600 text-white' : 
                    notification.type === 'error' ? 'bg-rose-600 text-white' : 
                    notification.type === 'warning' ? 'bg-amber-600 text-white' :
                    'bg-blue-600 text-white'
                }`}>
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            <Card className="flex flex-col h-full border-none shadow-none bg-transparent p-0">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                    
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900">
                        <div>
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                                    <AcademicCapIcon className="w-6 h-6" />
                                </div>
                                Gestión de Estudiantes
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400 ml-11">Administración de programas y promociones de semestre.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    placeholder="Buscar estudiante..." 
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
                            <button onClick={() => setIsBulkOpen(true)} className="bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-sm flex items-center justify-center gap-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                                <UploadIcon className="w-4 h-4"/> Masiva
                            </button>
                            <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2">
                                <PlusIcon className="w-4 h-4"/> Añadir
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 font-semibold tracking-wider dark:bg-slate-800 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Nombre Completo</th>
                                    <th className="px-6 py-4">Programa / Semestre</th>
                                    <th className="px-6 py-4">Estado Financiero</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="bg-white hover:bg-slate-50/80 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                                                    {student.name.charAt(0)}
                                                </div>
                                                {student.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                {student.class} <span className="mx-1 opacity-50">|</span> Semestre {student.section}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setManagingFinancial(student)}
                                                className={`group inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${
                                                student.financialStatus === 'Al día' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 
                                                student.financialStatus === 'Pendiente (Sensibilización)' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                                                'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                    student.financialStatus === 'Al día' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                                    student.financialStatus === 'Pendiente (Sensibilización)' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                    'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                                }`}></span>
                                                {student.financialStatus || 'Al día'}
                                                <EditIcon className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => setPromotingStudent(student)} className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-all focus:outline-none shadow-sm dark:bg-indigo-900/20 dark:text-indigo-400" title="Cierre de Semestre / Promoción">
                                                    <CheckIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => setViewingStudent(student)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white" title="Ver Detalles">
                                                    <EyeIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-amber-400" title="Editar">
                                                    <EditIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => setDeletingStudent(student)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 transition-all focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-400" title="Eliminar">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {isModalOpen && <StudentFormModal onClose={() => setIsModalOpen(false)} onSave={handleSaveStudent} studentToEdit={editingStudent} campuses={campuses} user={user} />}
            {isBulkOpen && <BulkUploadModal onClose={() => setIsBulkOpen(false)} onSave={handleBulkSave} user={user} campuses={campuses} />}
            {viewingStudent && <ViewStudentModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
            {deletingStudent && <DeleteConfirmationModal student={deletingStudent} onClose={() => setDeletingStudent(null)} onConfirm={handleDeleteStudent} />}
            {promotingStudent && <PromotionModal student={promotingStudent} onClose={() => setPromotingStudent(null)} onConfirm={handlePromoteConfirm} grades={grades} />}
            {managingFinancial && <FinancialStatusModal student={managingFinancial} onClose={() => setManagingFinancial(null)} onSave={handleSaveFinancialStatus} />}
            {resettingPasswordStudent && <ResetPasswordConfirmationModal user={resettingPasswordStudent} onClose={() => setResettingPasswordStudent(null)} onConfirm={handleSendResetLink} />}
            {assigningPassStudent && <TempPasswordModal user={assigningPassStudent} onClose={() => setAssigningPassStudent(null)} onSave={handleAssignTempPass} />}
        </>
    );
};

export default StudentManagementPage;
