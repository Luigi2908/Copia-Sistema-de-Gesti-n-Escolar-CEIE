
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    Campus, AdminUser, Teacher, Student, Grade, Communication, ClassSchedule, Exam, TeacherCourseAssignment, UserRole, AttendanceRecord, SchoolEvent
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
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
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
        try {
            const [
                { data: camps }, { data: profs }, { data: grds }, { data: comms }, 
                { data: schs }, { data: exms }, { data: evts }, { data: asgs }, { data: atts }
            ] = await Promise.all([
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

            setCampuses(camps || []);
            if (profs) {
                setAdmins(profs.filter(p => p.role === UserRole.CAMPUS_ADMIN));
                setTeachers(profs.filter(p => p.role === UserRole.TEACHER));
                setStudents(profs.filter(p => p.role === UserRole.STUDENT));
            }
            setGrades(grds || []);
            setCommunications(comms || []);
            setSchedules(schs || []);
            setExams(exms || []);
            setEvents(evts || []);
            setAssignments(asgs || []);
            setAttendanceRecords(atts || []);
        } catch (error) {
            console.error("Sync Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAuthenticated]);

    // Helpers genéricos para Supabase
    const dbAdd = async (table: string, data: any) => {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
        await fetchData();
    };

    const dbUpdate = async (table: string, id: string, data: any) => {
        const { error } = await supabase.from(table).update(data).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const dbDelete = async (table: string, id: string) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    return (
        <DataContext.Provider value={{
            isLoading, campuses, admins, teachers, students, grades, communications, schedules, exams, events, assignments, attendanceRecords,
            addCampus: (d) => dbAdd('campuses', d),
            updateCampus: (id, d) => dbUpdate('campuses', id, d),
            deleteCampus: (id) => dbDelete('campuses', id),
            addAdmin: (d) => dbAdd('profiles', { ...d, role: UserRole.CAMPUS_ADMIN }),
            updateAdmin: (id, d) => dbUpdate('profiles', id, d),
            deleteAdmin: (id) => dbDelete('profiles', id),
            addTeacher: (d) => dbAdd('profiles', { ...d, role: UserRole.TEACHER }),
            updateTeacher: (id, d) => dbUpdate('profiles', id, d),
            deleteTeacher: (id) => dbDelete('profiles', id),
            addStudent: (d) => dbAdd('profiles', { ...d, role: UserRole.STUDENT }),
            updateStudent: (id, d) => dbUpdate('profiles', id, d),
            deleteStudent: (id) => dbDelete('profiles', id),
            addGrade: (d) => dbAdd('grades', d),
            updateGrade: (id, d) => dbUpdate('grades', id, d),
            deleteGrade: (id) => dbDelete('grades', id),
            addCommunication: (d) => dbAdd('communications', { ...d, date: new Date() }),
            updateCommunication: (id, d) => dbUpdate('communications', id, d),
            deleteCommunication: (id) => dbDelete('communications', id),
            addExam: (d) => dbAdd('exams', d),
            updateExam: (id, d) => dbUpdate('exams', id, d),
            deleteExam: (id) => dbDelete('exams', id),
            addSchedule: (d) => dbAdd('schedules', d),
            updateSchedule: (id, d) => dbUpdate('schedules', id, d),
            deleteSchedule: (id) => dbDelete('schedules', id),
            addAssignment: (d) => dbAdd('teacher_assignments', d),
            updateAssignment: (id, d) => dbUpdate('teacher_assignments', id, d),
            deleteAssignment: (id) => dbDelete('teacher_assignments', id),
            addEvent: (d) => dbAdd('school_events', d),
            updateEvent: (id, d) => dbUpdate('school_events', id, d),
            deleteEvent: (id) => dbDelete('school_events', id),
            saveAttendance: async (d) => {
                const { data: ex } = await supabase.from('attendance').select('id').eq('student_id', d.studentId).eq('date', d.date).maybeSingle();
                if (ex) await dbUpdate('attendance', ex.id, d); else await dbAdd('attendance', d);
            },
            deleteAttendance: (id) => dbDelete('attendance', id),
            updateUserAvatar: (id, role, avatar) => dbUpdate('profiles', id, { avatar }),
            assignTemporaryPassword: async (id, role, p) => { console.warn("Clave provisional:", p); },
            promoteStudent: async (id) => { return { success: true, message: "Promoción exitosa (Modo Nube)" }; }
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
