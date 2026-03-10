
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Communication, Campus, AdminUser, Student, Teacher, AttendanceRecord, SchoolEvent, Exam } from '../../types';
import StatCard from './StatCard';
import { StudentsIcon, StaffIcon, FeesIcon, ExamsIcon, DocumentTextIcon, PdfIcon, WordIcon, DownloadIcon, BuildingOfficeIcon, MegaphoneIcon, ShieldCheckIcon, IdentificationIcon, CalendarIcon } from '../icons';
import Card from '../ui/Card';
import StudentDashboard from '../students/StudentDashboard';
import ParentDashboard from '../parents/ParentDashboard';
import { useData } from '../../context/DataContext';

const iconForFileType = (type: string) => {
    const className = "w-8 h-8 flex-shrink-0";
    if (type.includes('pdf')) return <PdfIcon className={`${className} text-rose-500`} />;
    if (type.includes('word')) return <WordIcon className={`${className} text-sky-500`} />;
    return <DocumentTextIcon className={`${className} text-slate-400`} />;
};

export const UpcomingEventsCard: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { user } = useAuth();
    const { events: allEvents } = useData();
    
    const upcomingEvents = useMemo(() => {
        if (!user) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return allEvents
            .filter(evt => {
                const evtDate = new Date(evt.date);
                evtDate.setHours(0, 0, 0, 0);
                const isFuture = evtDate >= today;
                const campusMatch = user.role === UserRole.SUPER_ADMIN || !evt.campusId || evt.campusId === user.campusId;
                return isFuture && campusMatch;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 4);
    }, [user, allEvents]);

    return (
        <div className={`bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 dark:border-slate-800/50 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${className}`}>
            <div className="p-6 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between bg-gradient-to-r from-transparent via-transparent to-primary/5 dark:to-primary/10">
                <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-primary dark:text-sky-400"/>
                    </div>
                    Próximos Eventos
                </h3>
            </div>
            <div className="p-6 space-y-4 flex-grow">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((evt) => {
                        const dateObj = new Date(evt.date);
                        return (
                            <div key={evt.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-300 group border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 hover:shadow-sm">
                                <div className="flex-shrink-0 w-16 h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center overflow-hidden group-hover:border-primary/30 dark:group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
                                    <span className="text-[10px] font-black uppercase text-white bg-gradient-to-r from-primary to-blue-500 dark:from-sky-500 dark:to-blue-600 w-full text-center py-1.5 tracking-widest">
                                        {dateObj.toLocaleString('es-ES', { month: 'short' }).replace('.', '')}
                                    </span>
                                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200 leading-none mt-2 mb-1">
                                        {dateObj.getDate()}
                                    </span>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">{evt.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-medium">{evt.description || 'Sin descripción adicional'}</p>
                                </div>
                                {evt.fileUrl && (
                                    <a href={evt.fileUrl} download={evt.fileName} className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all duration-300 hover:scale-110" title="Descargar adjunto">
                                        <DownloadIcon className="w-4 h-4"/>
                                    </a>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 min-h-[150px] text-center px-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 shadow-inner">
                            <CalendarIcon className="w-6 h-6 stroke-1" />
                        </div>
                        <p className="text-sm font-bold">No hay eventos programados próximamente.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const RecentCommunications: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { user } = useAuth();
    const { communications: allComms } = useData();
    const [communications, setCommunications] = useState<Communication[]>([]);

    useEffect(() => {
        if (!user) return;
        const filteredComms = allComms.filter(comm => {
            const campusMatch = user.role === UserRole.SUPER_ADMIN || !comm.campusId || comm.campusId === user.campusId;
            if (!campusMatch) return false;
            if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.CAMPUS_ADMIN) return true;
            return !comm.targetRoles || comm.targetRoles.length === 0 || comm.targetRoles.includes(user.role);
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
        setCommunications(filteredComms);
    }, [user, allComms]);

    return (
        <div className={`bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 dark:border-slate-800/50 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${className}`}>
            <div className="p-6 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between bg-gradient-to-r from-transparent via-transparent to-indigo-500/5 dark:to-indigo-500/10">
                <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl shadow-sm">
                        <MegaphoneIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400"/>
                    </div>
                    Comunicaciones Recientes
                </h3>
            </div>
            <div className="p-6 space-y-4 flex-grow">
                {communications.length > 0 ? (
                    communications.map((comm) => (
                        <div key={comm.id} className="flex items-start gap-5 p-5 rounded-2xl border border-slate-100/80 hover:bg-slate-50/80 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-all duration-300 group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                {iconForFileType(comm.fileType)}
                            </div>
                            <div className="flex-grow min-w-0 pt-1">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{comm.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">{comm.description}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {new Date(comm.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <a href={comm.fileUrl} download={comm.fileName} className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 p-2.5 rounded-xl dark:hover:bg-indigo-500/20 transition-all duration-300 hover:scale-110">
                                <DownloadIcon className="w-4 h-4"/>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 min-h-[150px]">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 shadow-inner">
                            <MegaphoneIcon className="w-6 h-6 stroke-1" />
                        </div>
                        <p className="text-sm font-bold">No hay comunicaciones recientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SuperAdminDashboard: React.FC = () => {
    const { campuses, admins, students, teachers } = useData();
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<BuildingOfficeIcon />} title="Total Sedes" value={String(campuses.length)} color="#0ea5e9" />
                <StatCard icon={<ShieldCheckIcon />} title="Administradores" value={String(admins.length)} color="#10b981" />
                <StatCard icon={<StudentsIcon />} title="Estudiantes" value={students.length.toLocaleString('es-ES')} color="#f59e0b" />
                <StatCard icon={<IdentificationIcon />} title="Profesores" value={String(teachers.length)} color="#8b5cf6" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentCommunications />
                </div>
                <div>
                    <UpcomingEventsCard />
                </div>
            </div>
        </div>
    );
};

const CampusAdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { students, teachers, exams } = useData();
    const [stats, setStats] = useState({ students: 0, staff: 0, upcomingExams: 0 });

    useEffect(() => {
        if (!user?.campusId) return;
        const today = new Date().toISOString().split('T')[0];
        const campusUpcomingExams = exams.filter(e => e.campusId === user.campusId && e.status === 'Programado' && e.startDate >= today);
        const campusStudents = students.filter(s => s.campusId === user.campusId);
        const campusTeachers = teachers.filter(t => t.campusId === user.campusId);

        setStats({ students: campusStudents.length, staff: campusTeachers.length, upcomingExams: campusUpcomingExams.length });
    }, [user, students, teachers, exams]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<StudentsIcon />} title={`Estudiantes`} value={stats.students.toLocaleString('es-ES')} color="#0ea5e9" />
                <StatCard icon={<StaffIcon />} title={`Profesores`} value={String(stats.staff)} color="#10b981" />
                <StatCard icon={<ExamsIcon />} title="Actividades" value={String(stats.upcomingExams)} color="#f59e0b" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentCommunications />
                </div>
                <div>
                    <UpcomingEventsCard />
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const { schedules, communications, exams, teachers } = useData();
    
    const [mySchedules, setMySchedules] = useState<any[]>([]);
    const [currentClassId, setCurrentClassId] = useState<string | null>(null);
    const [latestAnnouncement, setLatestAnnouncement] = useState<Communication | null>(null);
    const [myExams, setMyExams] = useState<Exam[]>([]);
    const [teacher, setTeacher] = useState<Teacher | null>(null);

    useEffect(() => {
        if (user) {
            const currentTeacher = teachers.find(t => t.id === user.id);
            setTeacher(currentTeacher || null);
            const teacherSchedules = schedules.filter(s => s.teacherId === user.id);
            setMySchedules(teacherSchedules);
            const latest = communications.filter(c => !c.campusId || c.campusId === user.campusId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            setLatestAnnouncement(latest || null);
            if (currentTeacher) {
                const teacherExams = exams.filter(ex => ex.campusId === currentTeacher.campusId && (ex.teacherId === currentTeacher.id || !ex.teacherId));
                setMyExams(teacherExams);
            }
        }
    }, [user, teachers, schedules, communications, exams]);

    useEffect(() => {
        const checkCurrentClass = () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const activeClass = mySchedules.find(schedule => schedule.dayOfWeek === dayOfWeek && currentTime >= schedule.startTime && currentTime < schedule.endTime);
            setCurrentClassId(activeClass ? activeClass.id : null);
        };
        checkCurrentClass();
        const intervalId = setInterval(checkCurrentClass, 60000);
        return () => clearInterval(intervalId);
    }, [mySchedules]);

    const findNextClass = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const upcomingToday = mySchedules.filter(s => s.dayOfWeek === dayOfWeek && s.startTime > currentTime).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (upcomingToday.length > 0) return { classInfo: upcomingToday[0], day: 'Hoy' };
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (dayOfWeek + i) % 7;
            const upcomingNextDay = mySchedules.filter(s => s.dayOfWeek === nextDayIndex).sort((a, b) => a.startTime.localeCompare(b.startTime));
            if (upcomingNextDay.length > 0) {
                const nextDate = new Date();
                nextDate.setDate(now.getDate() + i);
                return { classInfo: upcomingNextDay[0], day: nextDate.toLocaleDateString('es-ES', { weekday: 'long' }) };
            }
        }
        return null;
    };
    
    const today = new Date();
    const currentDayIdx = today.getDay();
    const diff = today.getDate() - currentDayIdx + (currentDayIdx === 0 ? -6 : 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);

    const weekDates = Array.from({ length: 6 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });

    const nextClass = findNextClass();

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<IdentificationIcon />} title="Espacios Académicos" value={String(mySchedules.length)} color="#0ea5e9" />
                <StatCard icon={<ExamsIcon />} title="Actividades Pendientes" value={String(myExams.length)} color="#f59e0b" />
                <StatCard icon={<CalendarIcon />} title="Próximo Espacio" value={nextClass ? `${nextClass.classInfo.subject} (${nextClass.day})` : 'Sin espacios'} color="#10b981" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 overflow-hidden flex flex-col bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100/50 dark:border-slate-800/50 rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100/50 dark:border-slate-800/50 bg-gradient-to-r from-transparent via-transparent to-emerald-500/5 dark:to-emerald-500/10">
                        <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl shadow-sm">
                                <CalendarIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400"/>
                            </div>
                            Horario Semanal
                        </h3>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-inner">Lunes a Sábado</span>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-5 p-6 snap-x custom-scrollbar">
                        {weekDates.map(date => {
                            const isToday = date.toDateString() === today.toDateString();
                            const daySchedules = mySchedules
                                .filter(s => s.dayOfWeek === date.getDay())
                                .sort((a, b) => a.startTime.localeCompare(b.startTime));

                            return (
                                <div 
                                    key={date.toString()} 
                                    className={`min-w-[260px] flex-shrink-0 snap-start rounded-3xl p-6 transition-all duration-300 border ${
                                        isToday 
                                            ? 'bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20 shadow-sm ring-1 ring-primary/10' 
                                            : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100/80 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <p className={`text-[11px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                                                {date.toLocaleDateString('es-ES', { weekday: 'long' })}
                                            </p>
                                            <p className={`text-3xl font-black leading-none mt-1.5 ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {date.getDate()}
                                            </p>
                                        </div>
                                        {isToday && (
                                            <span className="bg-gradient-to-r from-primary to-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-pulse tracking-widest">HOY</span>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {daySchedules.length > 0 ? (
                                            daySchedules.map(s => (
                                                <div key={s.id} className={`p-4 rounded-2xl border shadow-sm transition-all duration-300 ${currentClassId === s.id ? 'bg-gradient-to-br from-primary to-blue-600 border-primary text-white shadow-md scale-[1.02] hover:scale-[1.03]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-0.5 hover:shadow-md'}`}>
                                                    <p className={`text-[11px] font-black tracking-widest ${currentClassId === s.id ? 'text-sky-100' : 'text-primary dark:text-sky-400'}`}>
                                                        {s.startTime} - {s.endTime}
                                                    </p>
                                                    <p className={`text-base font-bold truncate mt-1.5 ${currentClassId === s.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {s.subject}
                                                    </p>
                                                    <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-2 ${currentClassId === s.id ? 'text-sky-50' : 'text-slate-500'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${currentClassId === s.id ? 'bg-sky-200' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                                        {s.class}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center opacity-40">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3 shadow-inner">
                                                    <CalendarIcon className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500">Sin clases programadas</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                
                <div className="space-y-8">
                    <UpcomingEventsCard />
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                <RecentCommunications />
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    const renderDashboard = () => {
        switch (user?.role) {
            case UserRole.SUPER_ADMIN: return <SuperAdminDashboard />;
            case UserRole.CAMPUS_ADMIN: return <CampusAdminDashboard />;
            case UserRole.TEACHER: return <TeacherDashboard />;
            case UserRole.STUDENT: return <StudentDashboard />;
            case UserRole.PARENT: return <ParentDashboard />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Panel de Control
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">Resumen de actividad y acceso rápido a tus herramientas.</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-800/80 px-6 py-3 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-4 transition-all duration-300 hover:shadow-md">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <span className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {renderDashboard()}

            {user?.role !== UserRole.TEACHER && user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.CAMPUS_ADMIN && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2">
                        <RecentCommunications />
                    </div>
                    <div className="space-y-8">
                        <UpcomingEventsCard />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
