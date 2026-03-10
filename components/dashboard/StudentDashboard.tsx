import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Student, Grade, Exam, ClassSchedule, Teacher } from '../../types';
import StatCard from '../dashboard/StatCard';
import { AcademicCapIcon, ExamsIcon, ClipboardDocumentListIcon } from '../icons';
import Card from '../ui/Card';
import { useData } from '../../context/DataContext';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const student = user as Student;

    const { grades: allGrades, exams: allExams, schedules: allSchedules, teachers } = useData();

    const grades = allGrades.filter(g => g.studentId === student.id);
    const exams = allExams.filter(e => e.campusId === student.campusId);
    const schedules = allSchedules.filter(s => s.class === student.class && s.section === student.section);
    
    // --- Calculations for Stat Cards ---
    const calculateOverallAverage = () => {
        if (grades.length === 0) return "N/A";
        const totalScore = grades.reduce((acc, grade) => acc + (grade.score * (grade.percentage / 100)), 0);
        const totalPercentage = grades.reduce((acc, grade) => acc + grade.percentage, 0);
        if (totalPercentage === 0) return "N/A";
        // Average is scaled to be out of 5, based on the total weighted score.
        const average = (totalScore / totalPercentage) * 100 * (5/100);
        return average.toFixed(2);
    };

    const findNextExam = () => {
        const today = new Date().toISOString().split('T')[0];
        const upcomingExams = exams
            .filter(e => e.startDate >= today && e.status === 'Programado')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return upcomingExams.length > 0 ? `${upcomingExams[0].title} (${upcomingExams[0].startDate})` : "Ninguno";
    };

    const todaySchedules = schedules
        .filter(s => s.dayOfWeek === new Date().getDay())
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const recentGrades = grades
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
        
    const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || 'N/A';

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<AcademicCapIcon />} title="Promedio General" value={calculateOverallAverage()} color="#3B82F6" />
                <StatCard icon={<ExamsIcon />} title="Próximo Examen" value={findNextExam()} color="#10B981" />
                <StatCard icon={<ClipboardDocumentListIcon />} title="Clases Hoy" value={String(todaySchedules.length)} color="#F97316" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 overflow-hidden flex flex-col bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100/50 dark:border-slate-800/50 rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100/50 dark:border-slate-800/50 bg-gradient-to-r from-transparent via-transparent to-orange-500/5 dark:to-orange-500/10">
                        <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl shadow-sm">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-orange-500 dark:text-orange-400"/>
                            </div>
                            Horario de Hoy
                        </h3>
                    </div>
                    <div className="p-6">
                        {todaySchedules.length > 0 ? (
                            <div className="space-y-4">
                                {todaySchedules.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-5 bg-slate-50/80 rounded-2xl dark:bg-slate-800/50 border border-slate-100/80 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
                                        <div>
                                            <p className="font-black text-sm text-primary dark:text-sky-400 tracking-widest uppercase">{s.startTime} - {s.endTime}</p>
                                            <p className="font-bold text-base text-slate-800 dark:text-white mt-1 group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">{s.subject}</p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">{getTeacherName(s.teacherId)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center opacity-40">
                                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3 shadow-inner">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-500">No hay clases programadas para hoy.</p>
                            </div>
                        )}
                    </div>
                </Card>
                 <Card className="overflow-hidden flex flex-col bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100/50 dark:border-slate-800/50 rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100/50 dark:border-slate-800/50 bg-gradient-to-r from-transparent via-transparent to-blue-500/5 dark:to-blue-500/10">
                        <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl shadow-sm">
                                <AcademicCapIcon className="w-5 h-5 text-blue-500 dark:text-blue-400"/>
                            </div>
                            Calificaciones Recientes
                        </h3>
                    </div>
                    <div className="p-6">
                        {recentGrades.length > 0 ? (
                            <ul className="space-y-4">
                               {recentGrades.map(grade => (
                                   <li key={grade.id} className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl dark:bg-slate-800/50 border border-slate-100/80 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
                                       <div>
                                           <p className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{grade.subject}</p>
                                           <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{grade.assignmentTitle}</p>
                                       </div>
                                       <span className="font-black text-lg text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-xl shadow-inner">{grade.score.toFixed(1)}</span>
                                   </li>
                               ))}
                            </ul>
                        ) : (
                             <div className="py-12 flex flex-col items-center justify-center opacity-40">
                                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3 shadow-inner">
                                    <AcademicCapIcon className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-500">No hay calificaciones recientes.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentDashboard;