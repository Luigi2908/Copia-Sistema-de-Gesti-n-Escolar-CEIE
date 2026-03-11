
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

    // URL BASE DE TU API EN HOSTINGER (DEBE SER HTTPS PARA EVITAR ERRORES DE MIXED CONTENT)
    const API_BASE_URL = 'https://ceie.website/api/api.php';

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

            // Función auxiliar para consultar la API dinámicamente
            const fetchResource = async (resourceName: string) => {
                try {
                    const response = await fetch(`${API_BASE_URL}?resource=${resourceName}`);
                    if (response.ok) {
                        return await response.json();
                    } else {
                        console.warn(`API de Hostinger no disponible para ${resourceName}.`);
                        return [];
                    }
                } catch (fetchError) {
                    console.error(`Error conectando a Hostinger para ${resourceName}:`, fetchError);
                    return [];
                }
            };

            // Ejecutar todas las consultas a la API en paralelo
            const [
                fetchedCampuses,
                fetchedAdmins,
                fetchedTeachers,
                fetchedStudents,
                fetchedGrades,
                fetchedCommunications,
                fetchedSchedules,
                fetchedExams,
                fetchedEvents,
                fetchedAssignments,
                fetchedAttendance
            ] = await Promise.all([
                fetchResource('campuses'),
                fetchResource('admins'),
                fetchResource('teachers'),
                fetchResource('students'),
                fetchResource('grades'),
                fetchResource('communications'),
                fetchResource('schedules'),
                fetchResource('exams'),
                fetchResource('events'),
                fetchResource('assignments'),
                fetchResource('attendance')
            ]);

            // Actualizar el estado de la aplicación con los datos obtenidos
            setCampuses(fetchedCampuses);
            setAdmins(fetchedAdmins);
            setTeachers(fetchedTeachers);
            setStudents(fetchedStudents);
            setGrades(fetchedGrades);
            setCommunications(fetchedCommunications);
            setSchedules(fetchedSchedules);
            setExams(fetchedExams);
            setEvents(fetchedEvents);
            setAssignments(fetchedAssignments);
            setAttendanceRecords(fetchedAttendance);

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
        const response = await fetch(`${API_BASE_URL}?resource=${table}&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.error || `Error HTTP: ${response.status}`);
        }
        await fetchData();
    };

    const dbInsert = async (table: string, data: any) => {
        const newItem = { ...data, id: data.id || Date.now().toString() };
        const response = await fetch(`${API_BASE_URL}?resource=${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.error || `Error HTTP: ${response.status}`);
        }
        await fetchData();
    };

    const dbDelete = async (table: string, id: string) => {
        const response = await fetch(`${API_BASE_URL}?resource=${table}&id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.error || `Error HTTP: ${response.status}`);
        }
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
