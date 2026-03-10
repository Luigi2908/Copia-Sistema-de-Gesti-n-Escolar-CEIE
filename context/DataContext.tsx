
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { 
    Campus, AdminUser, Teacher, Student, Grade, Communication, ClassSchedule, Exam, TeacherCourseAssignment, UserRole, AttendanceRecord, SchoolEvent, AcademicHistory
} from '../types';
import { useAuth } from './AuthContext';

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
    refreshAll: () => Promise<void>;
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

// Helper to manage local storage
const getLocalData = (key: string, defaultData: any = []) => {
    const data = localStorage.getItem(`school_${key}`);
    return data ? JSON.parse(data) : defaultData;
};

const setLocalData = (key: string, data: any) => {
    localStorage.setItem(`school_${key}`, JSON.stringify(data));
};

// Default Mock Data
const MOCK_CAMPUSES: Campus[] = [
    { id: 'c1', name: 'Sede Principal', address: 'Av. Central 123', admin: 'Admin Principal', teachers: 15, students: 300 },
    { id: 'c2', name: 'Sede Norte', address: 'Calle Norte 456', admin: 'Admin Norte', teachers: 8, students: 150 }
];

const MOCK_ADMINS: AdminUser[] = [
    { id: 'a1', name: 'Super Administrador', email: 'superadmin@ceie.com', role: UserRole.SUPER_ADMIN, status: 'active' },
    { id: 'a2', name: 'Admin Principal', email: 'admin.principal@ceie.com', role: UserRole.CAMPUS_ADMIN, campusId: 'c1', campusName: 'Sede Principal', status: 'active' },
    { id: 'a3', name: 'Admin Norte', email: 'admin.norte@ceie.com', role: UserRole.CAMPUS_ADMIN, campusId: 'c2', campusName: 'Sede Norte', status: 'active' }
];

const MOCK_TEACHERS: Teacher[] = [
    { id: 't1', name: 'Profesor Matemáticas', email: 'profesor.matematicas@ceie.com', role: UserRole.TEACHER, campusId: 'c1', campusName: 'Sede Principal', subject: 'Matemáticas', documentNumber: '12345678', phone: '555-0101', status: 'active' },
    { id: 't2', name: 'Profesora Ciencias', email: 'profesora.ciencias@ceie.com', role: UserRole.TEACHER, campusId: 'c1', campusName: 'Sede Principal', subject: 'Ciencias', documentNumber: '87654321', phone: '555-0102', status: 'active' }
];

const MOCK_STUDENTS: Student[] = [
    { id: 's1', name: 'Estudiante Ejemplo', email: 'estudiante@ceie.com', role: UserRole.STUDENT, campusId: 'c1', campusName: 'Sede Principal', class: '10A', section: '1', rollNumber: '001', schoolYear: '2026', schoolPeriod: '1', financialStatus: 'Al día', documentNumber: '11223344', status: 'active' },
    { id: 's2', name: 'Estudiante Dos', email: 'estudiante2@ceie.com', role: UserRole.STUDENT, campusId: 'c1', campusName: 'Sede Principal', class: '10A', section: '1', rollNumber: '002', schoolYear: '2026', schoolPeriod: '1', financialStatus: 'Pendiente', documentNumber: '44332211', status: 'active' }
];

export const DataProvider = ({ children }: { children?: ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
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

    // Initialize mock data if empty
    useEffect(() => {
        if (!localStorage.getItem('school_campuses')) setLocalData('campuses', MOCK_CAMPUSES);
        if (!localStorage.getItem('school_admins')) setLocalData('admins', MOCK_ADMINS);
        if (!localStorage.getItem('school_teachers')) setLocalData('teachers', MOCK_TEACHERS);
        if (!localStorage.getItem('school_students')) setLocalData('students', MOCK_STUDENTS);
    }, []);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated) {
            setCampuses([]);
            setAdmins([]);
            setTeachers([]);
            setStudents([]);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setCampuses(getLocalData('campuses', MOCK_CAMPUSES));
            setAdmins(getLocalData('admins', MOCK_ADMINS));
            setTeachers(getLocalData('teachers', MOCK_TEACHERS));
            setStudents(getLocalData('students', MOCK_STUDENTS));
            setGrades(getLocalData('grades'));
            setCommunications(getLocalData('communications'));
            setSchedules(getLocalData('schedules'));
            setExams(getLocalData('exams'));
            setEvents(getLocalData('events'));
            setAssignments(getLocalData('assignments'));
            setAttendanceRecords(getLocalData('attendance'));

        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message || 'Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dbUpdate = async (table: string, id: string, data: any) => {
        const currentData = getLocalData(table);
        const updatedData = currentData.map((item: any) => item.id === id ? { ...item, ...data } : item);
        setLocalData(table, updatedData);
        await fetchData();
    };

    const dbInsert = async (table: string, data: any) => {
        const currentData = getLocalData(table);
        const newItem = { ...data, id: Date.now().toString() };
        setLocalData(table, [...currentData, newItem]);
        await fetchData();
    };

    const dbDelete = async (table: string, id: string) => {
        const currentData = getLocalData(table);
        const filteredData = currentData.filter((item: any) => item.id !== id);
        setLocalData(table, filteredData);
        await fetchData();
    };

    const promoteStudent = async (studentId: string): Promise<{ success: boolean; message: string; type?: 'error' | 'warning' | 'success' }> => {
        const student = students.find(s => s.id === studentId);
        if (!student) return { success: false, message: 'No encontrado', type: 'error' };
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
            semester: student.section, year: student.schoolYear, period: student.schoolPeriod, gpa: parseFloat(gpa.toFixed(2)), status: passed ? 'Aprobado' : 'Reprobado',
            financialStatusAtClosing: student.financialStatus || 'Al día', details, completionDate: new Date().toISOString()
        };
        const updatedHistory = [...(student.history || []), newHistory];
        const nextSemester = passed ? (parseInt(student.section) + 1).toString() : student.section;
        
        try {
            await dbUpdate('students', studentId, { section: nextSemester, history: updatedHistory });
            return { success: passed, message: passed ? `Promovido a Semestre ${nextSemester}` : `Reprobado (${gpa.toFixed(2)})`, type: passed ? 'success' : 'warning' };
        } catch (e: any) {
            return { success: false, message: e.message, type: 'error' };
        }
    };

    return (
        <DataContext.Provider value={{
            isLoading, error, campuses, admins, teachers, students, grades, communications, schedules, exams, events, assignments, attendanceRecords,
            refreshAll: fetchData,
            addCampus: (d) => dbInsert('campuses', d),
            updateCampus: (id, d) => dbUpdate('campuses', id, d),
            deleteCampus: (id) => dbDelete('campuses', id),
            addAdmin: (d) => dbInsert('admins', { ...d, role: UserRole.CAMPUS_ADMIN }),
            updateAdmin: (id, d) => dbUpdate('admins', id, d),
            deleteAdmin: (id) => dbDelete('admins', id),
            addTeacher: (d) => dbInsert('teachers', { ...d, role: UserRole.TEACHER }),
            updateTeacher: (id, d) => dbUpdate('teachers', id, d),
            deleteTeacher: (id) => dbDelete('teachers', id),
            addStudent: (d) => dbInsert('students', { ...d, role: UserRole.STUDENT }),
            updateStudent: (id, d) => dbUpdate('students', id, d),
            deleteStudent: (id) => dbDelete('students', id),
            promoteStudent,
            addGrade: (d) => dbInsert('grades', d),
            updateGrade: (id, d) => dbUpdate('grades', id, d),
            deleteGrade: (id) => dbDelete('grades', id),
            addCommunication: (d) => dbInsert('communications', d),
            updateCommunication: (id, d) => dbUpdate('communications', id, d),
            deleteCommunication: (id) => dbDelete('communications', id),
            addExam: (d) => dbInsert('exams', d),
            updateExam: (id, d) => dbUpdate('exams', id, d),
            deleteExam: (id) => dbDelete('exams', id),
            addSchedule: (d) => dbInsert('schedules', d),
            updateSchedule: (id, d) => dbUpdate('schedules', id, d),
            deleteSchedule: (id) => dbDelete('schedules', id),
            addAssignment: (d) => dbInsert('assignments', d),
            updateAssignment: (id, d) => dbUpdate('assignments', id, d),
            deleteAssignment: (id) => dbDelete('assignments', id),
            addEvent: (d) => dbInsert('events', d),
            updateEvent: (id, d) => dbUpdate('events', id, d),
            deleteEvent: (id) => dbDelete('events', id),
            saveAttendance: async (d) => {
                const currentData = getLocalData('attendance');
                const existingIndex = currentData.findIndex((a: any) => a.id === d.id);
                if (existingIndex >= 0) {
                    currentData[existingIndex] = { ...currentData[existingIndex], ...d };
                } else {
                    currentData.push({ ...d, id: Date.now().toString() });
                }
                setLocalData('attendance', currentData);
                await fetchData();
            },
            deleteAttendance: (id) => dbDelete('attendance', id),
            updateUserAvatar: async (id, role, avatar) => {
                let table = '';
                if (role === UserRole.CAMPUS_ADMIN || role === UserRole.SUPER_ADMIN) table = 'admins';
                else if (role === UserRole.TEACHER) table = 'teachers';
                else if (role === UserRole.STUDENT) table = 'students';
                
                if (table) {
                    await dbUpdate(table, id, { avatar });
                }
            },
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
