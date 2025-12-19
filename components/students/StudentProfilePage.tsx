
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import Card from '../ui/Card';
// Se agrega ClipboardDocumentListIcon a las importaciones desde ../icons para corregir error de referencia
import { IdentificationIcon, AcademicCapIcon, BuildingOfficeIcon, CalendarIcon, CheckIcon, FeesIcon, ClipboardDocumentListIcon } from '../icons';

const ProfileField: React.FC<{ icon: React.ReactNode; label: string; value?: string | number; color?: string }> = ({ icon, label, value, color = "text-slate-400" }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:border-primary/20 group">
        <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value || '-'}</p>
        </div>
    </div>
);

const StudentProfilePage: React.FC = () => {
    const { user } = useAuth();
    const student = user as Student;

    if (!student) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Mi Perfil Institucional</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Información académica y administrativa oficial.</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
                    student.financialStatus === 'Al día' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${student.financialStatus === 'Al día' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                    Estado: {student.financialStatus || 'Al día'}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lateral Card - Personal Info */}
                <Card className="lg:col-span-1 flex flex-col items-center text-center p-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-none shadow-soft">
                    <div className="relative mb-6">
                        <img 
                            src={student.avatar} 
                            alt="Foto de perfil" 
                            className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800" 
                        />
                        <div className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg">
                            <CheckIcon className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{student.name}</h2>
                    <p className="text-sm font-bold text-primary dark:text-sky-400 mt-1 uppercase tracking-widest">{student.role}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{student.email}</p>

                    <div className="w-full mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Código</span>
                            <span className="font-black text-slate-700 dark:text-slate-200">{student.rollNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Documento</span>
                            <span className="font-black text-slate-700 dark:text-slate-200">{student.documentNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Cohorte</span>
                            <span className="font-black text-slate-700 dark:text-slate-200">{student.schoolYear}-{student.schoolPeriod}</span>
                        </div>
                    </div>
                </Card>

                {/* Main Content - Academic Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden border-none shadow-soft">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <AcademicCapIcon className="w-6 h-6 text-indigo-500" />
                                Ubicación Académica
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField 
                                icon={<BuildingOfficeIcon className="w-5 h-5"/>} 
                                label="Programa Académico" 
                                value={student.class} 
                                color="text-indigo-500"
                            />
                            <ProfileField 
                                icon={<CalendarIcon className="w-5 h-5"/>} 
                                label="Semestre Actual" 
                                value={`Semestre ${student.section}`} 
                                color="text-blue-500"
                            />
                            <ProfileField 
                                icon={<IdentificationIcon className="w-5 h-5"/>} 
                                label="Sede Institucional" 
                                value={student.campusName} 
                                color="text-emerald-500"
                            />
                            <ProfileField 
                                icon={<CheckIcon className="w-5 h-5"/>} 
                                label="Estado de Matrícula" 
                                value={student.status === 'active' ? 'Vigente / Activo' : 'Inactivo'} 
                                color="text-amber-500"
                            />
                        </div>
                    </Card>

                    {/* Academic History */}
                    <Card className="p-0 overflow-hidden border-none shadow-soft">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
                                Historial de Semestres
                            </h3>
                        </div>
                        <div className="p-6">
                            {student.history && student.history.length > 0 ? (
                                <div className="space-y-3">
                                    {student.history.map((h, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm">
                                                    {h.semester}°
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Semestre {h.semester}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.year}-{h.period}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${h.status === 'Aprobado' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {h.status}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400">Promedio: {h.gpa.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    <AcademicCapIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No se registran semestres finalizados aún.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;
