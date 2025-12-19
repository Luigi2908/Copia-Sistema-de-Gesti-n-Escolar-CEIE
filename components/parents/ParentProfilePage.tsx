
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import Card from '../ui/Card';
import { useData } from '../../context/DataContext';
import { IdentificationIcon, AcademicCapIcon, BuildingOfficeIcon, CalendarIcon, CheckIcon, ClipboardDocumentListIcon } from '../icons';

const ProfileField: React.FC<{ icon: React.ReactNode; label: string; value?: string | number; color?: string }> = ({ icon, label, value, color = "text-slate-400" }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
        <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${color}`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value || '-'}</p>
        </div>
    </div>
);

const ParentProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { students } = useData();
    const [student, setStudent] = useState<Student | null>(null);

    useEffect(() => {
        if (user && (user as any).studentId) {
            const found = students.find(s => s.id === (user as any).studentId);
            setStudent(found || null);
        }
    }, [user, students]);

    if (!student) {
        return <Card className="p-12 text-center"><p className="text-slate-500">Cargando perfil del estudiante...</p></Card>;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <header>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Ficha del Estudiante</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Información detallada de su hijo(a) en la institución.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center text-center p-8 border-none shadow-soft">
                    <img 
                        src={student.avatar} 
                        alt="Foto de perfil" 
                        className="w-32 h-32 rounded-[2.5rem] object-cover shadow-xl border-4 border-white dark:border-slate-800 mb-6" 
                    />
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{student.name}</h2>
                    <span className="mt-2 inline-block bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full text-[10px] dark:bg-primary/20 dark:text-sky-400">Estudiante</span>
                    
                    <div className="w-full mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Matrícula</span>
                            <span className="font-black text-slate-700 dark:text-slate-200">{student.rollNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Documento</span>
                            <span className="font-black text-slate-700 dark:text-slate-200">{student.documentNumber}</span>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden border-none shadow-soft">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <AcademicCapIcon className="w-6 h-6 text-indigo-500" />
                                Información Académica
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField 
                                icon={<BuildingOfficeIcon className="w-5 h-5"/>} 
                                label="Programa" 
                                value={student.class} 
                                color="text-indigo-500"
                            />
                            <ProfileField 
                                icon={<CalendarIcon className="w-5 h-5"/>} 
                                label="Semestre" 
                                value={`Semestre ${student.section}`} 
                                color="text-blue-500"
                            />
                            <ProfileField 
                                icon={<IdentificationIcon className="w-5 h-5"/>} 
                                label="Sede Académica" 
                                value={student.campusName} 
                                color="text-emerald-500"
                            />
                            <ProfileField 
                                icon={<CheckIcon className="w-5 h-5"/>} 
                                label="Estado" 
                                value={student.status === 'active' ? 'Activo' : 'Inactivo'} 
                                color="text-amber-500"
                            />
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden border-none shadow-soft">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
                                Histórico Académico
                            </h3>
                        </div>
                        <div className="p-6">
                            {student.history && student.history.length > 0 ? (
                                <div className="space-y-3">
                                    {student.history.map((h, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div>
                                                <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Semestre {h.semester}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.year}-{h.period}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${h.status === 'Aprobado' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {h.status}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400">Prom: {h.gpa.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-6">No hay semestres finalizados registrados.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ParentProfilePage;
