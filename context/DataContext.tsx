
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    Campus, AdminUser, Teacher, Student, Grade, Communication, ClassSchedule, Exam, TeacherCourseAssignment, UserRole, AttendanceRecord, SchoolEvent, AcademicHistory
} from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface DataContextType {
    campuses: Campus[];
    admins: AdminUser[];
    teachers: Teacher[];
    students: Student[];
    grades: Grade[];
    communications: Communication[];
    schedules: ClassSchedule[];
    exams: Exam[];
    assignments: TeacherCourseAssignment[];
    attendanceRecords: AttendanceRecord[];
    events: SchoolEvent[];
    isLoading: boolean;
    error: string | null;

    addCampus: (data: any) => Promise<void>;
    updateCampus: (id: string, data: any) => Promise<void>;
    deleteCampus: (id: string) => Promise<void>;
    addAdmin: (data: any) => Promise<void>;
    updateAdmin: (id: string, data: any) => Promise<void>;
    deleteAdmin: (id: string) => Promise<void>;
    addTeacher: (data: any) => Promise<void>;
    updateTeacher: (id: string, data: any) => Promise<void>;
    deleteTeacher: (id: string) => Promise<void>;
    addStudent: (data: any) => Promise<void>;
    updateStudent: (id: string, data: any) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    promoteStudent: (studentId: string) => Promise<{ success: boolean; message: string; type?: 'error' | 'warning' | 'success' }>;
    addGrade: (data: any) => Promise<void>;
    updateGrade: (id: string, data: any) => Promise<void>;
    deleteGrade: (id: string) => Promise<void>;
    addCommunication: (data: any) => Promise<void>;
    updateCommunication: (id: string, data: any) => Promise<void>;
    deleteCommunication: (id: string) => Promise<void>;
    addExam: (data: any) => Promise<void>;
    updateExam: (id: string, data: any) => Promise<void>;
    deleteExam: (id: string) => Promise<void>;
    addSchedule: (data: any) => Promise<void>;
    updateSchedule: (id: string, data: any) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
    addAssignment: (data: any) => Promise<void>;
    updateAssignment: (id: string, data: any) => Promise<void>;
    deleteAssignment: (id: string) => Promise<void>;
    addEvent: (data: any) => Promise<void>;
    updateEvent: (id: string, data: any) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    saveAttendance: (data: any) => Promise<void>;
    deleteAttendance: (id: string) => Promise<void>;
    updateUserAvatar: (userId: string, role: UserRole, avatar: string) => Promise<void>;
    assignTemporaryPassword: (userId: string, role: UserRole, tempPass: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [communications, setCommunications] = useState<Communication[]>([]);
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [events, setEvents] = useState<SchoolEvent[]>([]);
    const [assignments, setAssignments] = useState<TeacherCourseAssignment[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    const fetchData = async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        setError(null);
        
        try {
            const results = await Promise.allSettled([
                supabase.from('campuses').select('*'),
                supabase.from('profiles').select('*'),
                supabase.from('grades').select('*'),
                supabase.from('communications').select('*'),
                supabase.from('schedules').select('*'),
                supabase.from('exams').select('*'),
                supabase.from('school_events').select('*'),
                supabase.from('teacher_assignments').select('*'),
                supabase.from('attendance').select('*')
            ]);

            const [
                campsRes, profsRes, grdsRes, commsRes, 
                schsRes, exmsRes, evtsRes, asgsRes, attsRes
            ] = results;

            if (campsRes.status === 'fulfilled' && campsRes.value.data) {
                setCampuses(campsRes.value.data.map(c => ({
                    id: c.id,
                    name: c.name || 'Sede sin nombre',
                    address: c.address || 'Sin dirección',
                    admin: c.admin || 'Sin asignar',
                    teachers: c.teachers || 0,
                    students: c.students || 0
                })));
            }

            if (profsRes.status === 'fulfilled' && profsRes.value.data) {
                const profs = profsRes.value.data;
                
                // Normalización de Administradores
                setAdmins(profs.filter(p => p.role === UserRole.CAMPUS_ADMIN).map(p => ({ 
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    role: p.role,
                    campusId: p.campus_id, 
                    campusName: p.campus_name,
                    status: p.status,
                    avatar: p.avatar || `https://ui-avatars.com/api/?name=${(p.name || 'U').replace(' ', '+')}`
                } as AdminUser)));
                
                // Normalización de Profesores
                setTeachers(profs.filter(p => p.role === UserRole.TEACHER).map(p => ({ 
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    role: p.role,
                    campusId: p.campus_id,
                    campusName: p.campus_name,
                    documentNumber: p.document_number || p.documentNumber || '',
                    phone: p.phone || '',
                    subject: p.subject || '',
                    status: p.status || 'active',
                    avatar: p.avatar || `https://ui-avatars.com/api/?name=${(p.name || 'U').replace(' ', '+')}`
                } as Teacher)));

                // Normalización de Estudiantes
                setStudents(profs.filter(p => p.role === UserRole.STUDENT).map(p => ({ 
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    role: p.role,
                    campusId: p.campus_id, 
                    campusName: p.campus_name,
                    class: p.class || '',
                    section: p.section || '',
                    rollNumber: p.roll_number || p.rollNumber || '', 
                    schoolPeriod: p.school_period || p.schoolPeriod || 'A', 
                    schoolYear: p.school_year || p.schoolYear || 2025, 
                    financialStatus: p.financial_status || p.financialStatus || 'Al día', 
                    documentNumber: p.document_number || p.documentNumber || '',
                    status: p.status || 'active',
                    avatar: p.avatar || `https://ui-avatars.com/api/?name=${(p.name || 'U').replace(' ', '+')}`
                } as Student)));
            }

            if (grdsRes.status === 'fulfilled' && grdsRes.value.data) setGrades(grdsRes.value.data.map(g => ({ ...g, studentId: g.student_id, teacherId: g.teacher_id, assignmentTitle: g.assignment_title, conceptCode: g.concept_code })));
            if (commsRes.status === 'fulfilled' && commsRes.value.data) setCommunications(commsRes.value.data.map(c => ({ ...c, campusId: c.campus_id, campusName: c.campus_name, targetRoles: c.target_roles })));
            if (schsRes.status === 'fulfilled' && schsRes.value.data) setSchedules(schsRes.value.data.map(s => ({ ...s, teacherId: s.teacher_id, dayOfWeek: s.day_of_week, startTime: s.start_time, endTime: s.end_time })));
            if (exmsRes.status === 'fulfilled' && exmsRes.value.data) setExams(exmsRes.value.data.map(e => ({ ...e, campusId: e.campus_id, teacherId: e.teacher_id, startDate: e.start_date, endDate: e.end_date, schoolYear: e.school_year, schoolPeriod: e.school_period, maxScore: e.max_score })));
            if (evtsRes.status === 'fulfilled' && evtsRes.value.data) setEvents(evtsRes.value.data.map(e => ({ ...e, campusId: e.campus_id, fileUrl: e.file_url, fileName: e.file_name, fileType: e.file_type })));
            if (asgsRes.status === 'fulfilled' && asgsRes.value.data) setAssignments(asgsRes.value.data.map(a => ({ ...a, teacherId: a.teacher_id, intensidadHoraria: a.intensidad_horaria })));
            if (attsRes.status === 'fulfilled' && attsRes.value.data) setAttendanceRecords(attsRes.value.data.map(a => ({ ...a, studentId: a.student_id })));

        } catch (err: any) {
            console.error("Error cargando datos:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const dbAdd = async (table: string, data: any) => {
        const dataWithId = { ...data, id: data.id || crypto.randomUUID() };
        const mappedData = Object.keys(dataWithId).reduce((acc: any, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = dataWithId[key];
            return acc;
        }, {});

        const { error } = await supabase.from(table).insert([mappedData]);
        if (error) throw error;
        await fetchData();
    };

    const dbUpdate = async (table: string, id: string, data: any) => {
        const mappedData = Object.keys(data).reduce((acc: any, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = data[key];
            return acc;
        }, {});

        const { error } = await supabase.from(table).update(mappedData).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const promoteStudent = async (studentId: string): Promise<{ success: boolean; message: string; type?: 'error' | 'warning' | 'success' }> => {
        const student = students.find(s => s.id === studentId);
        if (!student) return { success: false, message: 'No encontrado', type: 'error' };
        if (student.financialStatus === 'Mora Crítica (Bloqueado)') return { success: false, message: 'Bloqueo Financiero', type: 'error' };
        const studentGrades = grades.filter(g => g.studentId === studentId);
        const subjects: string[] = Array.from(new Set(studentGrades.map(g => g.subject)));
        if (subjects.length === 0) return { success: false, message: 'Sin notas registradas', type: 'warning' };
        const details = subjects.map(subj => {
            const subjGrades = studentGrades.filter(g => g.subject === subj);
            const score = subjGrades.reduce((acc, g) => acc + (g.score * g.percentage / 100), 0);
            const perc = subjGrades.reduce((acc, g) => acc + g.percentage, 0);
            return { subject: subj, finalGrade: perc > 0 ? (score * 100) / perc : 0 };
        });
        const gpa = details.reduce((acc, d) => acc + d.finalGrade, 0) / details.length;
        const passed = gpa >= 3.0;
        const newHistory: AcademicHistory = {
            semester: student.section,
            year: student.schoolYear,
            period: student.schoolPeriod,
            gpa: parseFloat(gpa.toFixed(2)),
            status: passed ? 'Aprobado' : 'Reprobado',
            financialStatusAtClosing: student.financialStatus || 'Al día',
            details,
            completionDate: new Date().toISOString()
        };
        const updatedHistory = [...(student.history || []), newHistory];
        const nextSemester = passed ? (parseInt(student.section) + 1).toString() : student.section;
        await dbUpdate('profiles', studentId, { section: nextSemester, history: updatedHistory });
        return { success: passed, message: passed ? `Promovido a Semestre ${nextSemester}` : `Debe repetir semestre (${gpa.toFixed(2)})`, type: passed ? 'success' : 'warning' };
    };

    return (
        <DataContext.Provider value={{
            isLoading, error, campuses, admins, teachers, students, grades, communications, schedules, exams, events, assignments, attendanceRecords,
            addCampus: (d) => dbAdd('campuses', d),
            updateCampus: (id, d) => dbUpdate('campuses', id, d),
            deleteCampus: (id) => supabase.from('campuses').delete().eq('id', id).then(() => fetchData()),
            addAdmin: (d) => dbAdd('profiles', { ...d, role: UserRole.CAMPUS_ADMIN }),
            updateAdmin: (id, d) => dbUpdate('profiles', id, d),
            deleteAdmin: (id) => supabase.from('profiles').delete().eq('id', id).then(() => fetchData()),
            addTeacher: (d) => dbAdd('profiles', { ...d, role: UserRole.TEACHER }),
            updateTeacher: (id, d) => dbUpdate('profiles', id, d),
            deleteTeacher: (id) => supabase.from('profiles').delete().eq('id', id).then(() => fetchData()),
            addStudent: (d) => dbAdd('profiles', { ...d, role: UserRole.STUDENT }),
            updateStudent: (id, d) => dbUpdate('profiles', id, d),
            deleteStudent: (id) => supabase.from('profiles').delete().eq('id', id).then(() => fetchData()),
            promoteStudent,
            addGrade: (d) => dbAdd('grades', d),
            updateGrade: (id, d) => dbUpdate('grades', id, d),
            deleteGrade: (id) => supabase.from('grades').delete().eq('id', id).then(() => fetchData()),
            addCommunication: (d) => dbAdd('communications', d),
            updateCommunication: (id, d) => dbUpdate('communications', id, d),
            deleteCommunication: (id) => supabase.from('communications').delete().eq('id', id).then(() => fetchData()),
            addExam: (d) => dbAdd('exams', d),
            updateExam: (id, d) => dbUpdate('exams', id, d),
            deleteExam: (id) => supabase.from('exams').delete().eq('id', id).then(() => fetchData()),
            addSchedule: (d) => dbAdd('schedules', d),
            updateSchedule: (id, d) => dbUpdate('schedules', id, d),
            deleteSchedule: (id) => supabase.from('schedules').delete().eq('id', id).then(() => fetchData()),
            addAssignment: (d) => dbAdd('teacher_assignments', d),
            updateAssignment: (id, d) => dbUpdate('teacher_assignments', id, d),
            deleteAssignment: (id) => supabase.from('teacher_assignments').delete().eq('id', id).then(() => fetchData()),
            addEvent: (d) => dbAdd('school_events', d),
            updateEvent: (id, d) => dbUpdate('school_events', id, d),
            deleteEvent: (id) => supabase.from('school_events').delete().eq('id', id).then(() => fetchData()),
            saveAttendance: async (d) => {
                const { data: ex } = await supabase.from('attendance').select('id').eq('student_id', d.studentId).eq('date', d.date).maybeSingle();
                if (ex) await dbUpdate('attendance', ex.id, d); else await dbAdd('attendance', d);
            },
            deleteAttendance: (id) => supabase.from('attendance').delete().eq('id', id).then(() => fetchData()),
            updateUserAvatar: (id, role, avatar) => dbUpdate('profiles', id, { avatar }),
            assignTemporaryPassword: async (id, role, p) => { console.warn("Clave provisional:", p); }
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
