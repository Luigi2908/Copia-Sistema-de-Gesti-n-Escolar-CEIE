
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
    cancellations: {classScheduleId: string, date: string}[];
    homeroomAssignments: Record<string, string>;

    setHomeroomAssignments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    isLoading: boolean;
    setCampuses: React.Dispatch<React.SetStateAction<Campus[]>>;
    setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;

    addCampus: (data: Omit<Campus, 'id' | 'teachers' | 'students'>) => Promise<void>;
    updateCampus: (id: string, data: Partial<Omit<Campus, 'id' | 'teachers' | 'students'>>) => Promise<void>;
    deleteCampus: (id: string) => Promise<void>;
    addAdmin: (data: Omit<AdminUser, 'id' | 'role' | 'avatar'>) => Promise<void>;
    updateAdmin: (id: string, data: Partial<AdminUser>) => Promise<void>;
    deleteAdmin: (id: string) => Promise<void>;
    addTeacher: (data: Omit<Teacher, 'id' | 'role' | 'avatar'>) => Promise<void>;
    updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>;
    deleteTeacher: (id: string) => Promise<void>;
    addStudent: (data: Omit<Student, 'id' | 'role' | 'avatar' | 'rollNumber'>) => Promise<void>;
    updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    promoteStudent: (studentId: string) => Promise<{ success: boolean; message: string }>;
    addGrade: (data: Omit<Grade, 'id'>) => Promise<void>;
    updateGrade: (id: string, data: Partial<Grade>) => Promise<void>;
    deleteGrade: (id: string) => Promise<void>;
    addCommunication: (data: Omit<Communication, 'id' | 'date'>) => Promise<void>;
    updateCommunication: (id: string, data: Partial<Communication>) => Promise<void>;
    deleteCommunication: (id: string) => Promise<void>;
    addEvent: (data: Omit<SchoolEvent, 'id'>) => Promise<void>;
    updateEvent: (id: string, data: Partial<SchoolEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    addExam: (data: Omit<Exam, 'id'>) => Promise<void>;
    updateExam: (id: string, data: Partial<Exam>) => Promise<void>;
    deleteExam: (id: string) => Promise<void>;
    addSchedule: (data: Omit<ClassSchedule, 'id'>) => Promise<void>;
    updateSchedule: (id: string, data: Partial<ClassSchedule>) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
    addAssignment: (data: Omit<TeacherCourseAssignment, 'id'>) => Promise<void>;
    updateAssignment: (id: string, data: Partial<TeacherCourseAssignment>) => Promise<void>;
    deleteAssignment: (id: string) => Promise<void>;
    addEvent: (data: Omit<SchoolEvent, 'id'>) => Promise<void>;
    updateEvent: (id: string, data: Partial<SchoolEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    saveAttendance: (data: Omit<AttendanceRecord, 'id'>) => Promise<void>;
    deleteAttendance: (id: string) => Promise<void>;
    updateUserAvatar: (userId: string, role: UserRole, avatar: string) => Promise<void>;
    assignTemporaryPassword: (userId: string, role: UserRole, tempPass: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
    const { isAuthenticated } = useAuth();
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
    const [cancellations, setCancellations] = useState<{classScheduleId: string, date: string}[]>([]);
    const [homeroomAssignments, setHomeroomAssignments] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                setCampuses(JSON.parse(localStorage.getItem('school_campuses') || '[]'));
                setAdmins(JSON.parse(localStorage.getItem('school_admins') || '[]'));
                setTeachers(JSON.parse(localStorage.getItem('school_teachers') || '[]'));
                setStudents(JSON.parse(localStorage.getItem('school_students') || '[]'));
                setGrades(JSON.parse(localStorage.getItem('school_grades') || '[]'));
                setCommunications(JSON.parse(localStorage.getItem('school_communications') || '[]'));
                setSchedules(JSON.parse(localStorage.getItem('school_schedules') || '[]'));
                setExams(JSON.parse(localStorage.getItem('school_exams') || '[]'));
                setEvents(JSON.parse(localStorage.getItem('school_events') || '[]'));
                setAssignments(JSON.parse(localStorage.getItem('teacher_assignments') || '[]'));
                setAttendanceRecords(JSON.parse(localStorage.getItem('school_attendance') || '[]'));
            } catch (error) {
                console.error("Error loading local data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (isAuthenticated) fetchData();
        else setIsLoading(false);
    }, [isAuthenticated]);
    
    useEffect(() => {
        const studentCounts = students.reduce((acc, student) => {
            if (student.campusId) acc[student.campusId] = (acc[student.campusId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const teacherCounts = teachers.reduce((acc, teacher) => {
            if (teacher.campusId) acc[teacher.campusId] = (acc[teacher.campusId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        setCampuses(prev => prev.map(campus => ({ ...campus, students: studentCounts[campus.id] || 0, teachers: teacherCounts[campus.id] || 0 })));
    }, [students, teachers]);

    const addInstance = async function<T extends { id: string }>(table: string, data: Omit<T, 'id'>, setState: React.Dispatch<React.SetStateAction<any[]>>, localKey: string): Promise<void> {
        const newItem = { ...data, id: `${table.substring(0,3)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` } as unknown as T;
        setState(prev => {
            const newState = [newItem, ...prev];
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    const updateInstance = async function<T>(table: string, id: string, data: Partial<T>, setState: React.Dispatch<React.SetStateAction<any[]>>, localKey: string): Promise<void> {
        setState(prev => {
            const newState = prev.map(item => item.id === id ? { ...item, ...data } : item);
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    const deleteInstance = async (table: string, id: string, setState: React.Dispatch<React.SetStateAction<any[]>>, localKey: string): Promise<void> => {
        setState(prev => {
            const newState = prev.filter(item => item.id !== id);
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    const addCampus = (data: any) => addInstance('campuses', data, setCampuses, 'school_campuses');
    const updateCampus = (id: string, data: any) => updateInstance('campuses', id, data, setCampuses, 'school_campuses');
    const deleteCampus = (id: string) => deleteInstance('campuses', id, setCampuses, 'school_campuses');
    const addGrade = (data: any) => addInstance('grades', data, setGrades, 'school_grades');
    const updateGrade = (id: string, data: any) => updateInstance('grades', id, data, setGrades, 'school_grades');
    const deleteGrade = (id: string) => deleteInstance('grades', id, setGrades, 'school_grades');
    const addCommunication = (data: any) => addInstance('communications', { ...data, date: new Date().toISOString() }, setCommunications, 'school_communications');
    const updateCommunication = (id: string, data: any) => updateInstance('communications', id, data, setCommunications, 'school_communications');
    const deleteCommunication = (id: string) => deleteInstance('communications', id, setCommunications, 'school_communications');
    const addEvent = (data: any) => addInstance('events', data, setEvents, 'school_events');
    const updateEvent = (id: string, data: any) => updateInstance('events', id, data, setEvents, 'school_events');
    const deleteEvent = (id: string) => deleteInstance('events', id, setEvents, 'school_events');
    const addExam = (data: any) => addInstance('exams', data, setExams, 'school_exams');
    const updateExam = (id: string, data: any) => updateInstance('exams', id, data, setExams, 'school_exams');
    const deleteExam = (id: string) => deleteInstance('exams', id, setExams, 'school_exams');
    const addSchedule = (data: any) => addInstance('schedules', data, setSchedules, 'school_schedules');
    const updateSchedule = (id: string, data: any) => updateInstance('schedules', id, data, setSchedules, 'school_schedules');
    const deleteSchedule = (id: string) => deleteInstance('schedules', id, setSchedules, 'school_schedules');
    const addAssignment = (data: any) => addInstance('assignments', data, setAssignments, 'teacher_assignments');
    const updateAssignment = (id: string, data: any) => updateInstance('assignments', id, data, setAssignments, 'teacher_assignments');
    const deleteAssignment = (id: string) => deleteInstance('assignments', id, setAssignments, 'teacher_assignments');

    const saveAttendance = async (data: Omit<AttendanceRecord, 'id'>) => {
        const recordData = { ...data, count: data.count || 1, period: data.period };
        setAttendanceRecords(prev => {
            const existingRecord = prev.find(r => r.studentId === data.studentId && r.date === data.date && r.period === data.period);
            let newState;
            if (existingRecord) newState = prev.map(r => r.id === existingRecord.id ? { ...r, ...recordData } : r);
            else {
                const newItem = { ...recordData, id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` };
                newState = [...prev, newItem];
            }
            localStorage.setItem('school_attendance', JSON.stringify(newState));
            return newState;
        });
    };

    const deleteAttendance = (id: string) => deleteInstance('attendance', id, setAttendanceRecords, 'school_attendance');

    const updateUserAvatar = async (userId: string, role: UserRole, avatar: string) => {
        let setState = role === UserRole.TEACHER ? setTeachers : setStudents;
        let key = role === UserRole.TEACHER ? 'school_teachers' : 'school_students';
        if (role === UserRole.CAMPUS_ADMIN) { setState = setAdmins; key = 'school_admins'; }
        await updateInstance('users', userId, { avatar }, setState as any, key);
    };

    const assignTemporaryPassword = async (userId: string, role: UserRole, tempPass: string) => {
        let setState = role === UserRole.TEACHER ? setTeachers : setStudents;
        let key = role === UserRole.TEACHER ? 'school_teachers' : 'school_students';
        if (role === UserRole.CAMPUS_ADMIN) { setState = setAdmins; key = 'school_admins'; }
        await updateInstance('users', userId, { tempPassword: tempPass }, setState as any, key);
    };

    const addAdmin = (data: any) => addInstance('admins', data, setAdmins, 'school_admins');
    const updateAdmin = (id: string, data: any) => updateInstance('admins', id, data, setAdmins, 'school_admins');
    const deleteAdmin = (id: string) => deleteInstance('admins', id, setAdmins, 'school_admins');

    const addTeacher = (data: any) => addInstance('teachers', data, setTeachers, 'school_teachers');
    const updateTeacher = (id: string, data: any) => updateInstance('teachers', id, data, setTeachers, 'school_teachers');
    const deleteTeacher = (id: string) => deleteInstance('teachers', id, setTeachers, 'school_teachers');

    const addStudent = async (data: any) => {
        const newItem = { 
            ...data, id: `local-stu-${Date.now()}`, role: UserRole.STUDENT, isLocal: true,
            avatar: `https://ui-avatars.com/api/?name=${data.name.replace(/\s/g, '+')}&background=random`,
            rollNumber: `${data.class.substring(0,3)}${data.section}${Date.now().toString().slice(-4)}`
        };
        setStudents(prev => {
            const newState = [newItem, ...prev];
            localStorage.setItem('school_students', JSON.stringify(newState));
            return newState;
        });
    };
    const updateStudent = (id: string, data: any) => updateInstance('students', id, data, setStudents, 'school_students');
    const deleteStudent = (id: string) => deleteInstance('students', id, setStudents, 'school_students');

    const promoteStudent = async (studentId: string): Promise<{ success: boolean; message: string }> => {
        const student = students.find(s => s.id === studentId);
        if (!student) return { success: false, message: 'Estudiante no encontrado.' };

        // 1. Calcular Rendimiento del Semestre Actual
        const studentGrades = grades.filter(g => g.studentId === studentId);
        // Tipado explícito para evitar inferencia 'unknown' de Set/Array.from
        const subjects: string[] = Array.from(new Set(studentGrades.map(g => g.subject)));
        
        if (subjects.length === 0) return { success: false, message: 'No hay registros académicos para este semestre.' };

        const semesterDetails = subjects.map(subj => {
            const subjGrades = studentGrades.filter(g => g.subject === subj);
            const totalScore = subjGrades.reduce((acc, g) => acc + (g.score * g.percentage / 100), 0);
            const totalPerc = subjGrades.reduce((acc, g) => acc + g.percentage, 0);
            return { subject: subj, finalGrade: totalPerc > 0 ? (totalScore * 100) / totalPerc : 0 };
        });

        const gpa = semesterDetails.reduce((acc, d) => acc + d.finalGrade, 0) / semesterDetails.length;
        const passed = gpa >= 3.0;

        // 2. Crear Registro Histórico
        const historyRecord: AcademicHistory = {
            semester: student.section,
            year: student.schoolYear,
            period: student.schoolPeriod,
            gpa: parseFloat(gpa.toFixed(2)),
            status: passed ? 'Aprobado' : 'Reprobado',
            details: semesterDetails,
            completionDate: new Date().toISOString()
        };

        // 3. Actualizar Estudiante
        const nextSemester = passed ? (parseInt(student.section) + 1).toString() : student.section;
        const updatedHistory = [...(student.history || []), historyRecord];

        await updateInstance('students', studentId, {
            section: nextSemester,
            history: updatedHistory,
            observation: passed ? `Promovido a semestre ${nextSemester}` : `Reprobó semestre ${student.section}. Debe repetir.`
        }, setStudents, 'school_students');

        // Opcional: Podríamos eliminar las notas actuales para empezar limpio, o dejarlas por periodo.
        // Por ahora las mantenemos ya que getPeriodFromDate las filtra.

        return { 
            success: passed, 
            message: passed ? `¡Felicidades! Estudiante promovido al semestre ${nextSemester}.` : `El estudiante no alcanzó el promedio mínimo (${gpa.toFixed(2)}). Debe repetir el semestre.` 
        };
    };

    const value = {
        isLoading, campuses, admins, teachers, students, grades, communications, schedules, exams, events, assignments, cancellations, homeroomAssignments, attendanceRecords,
        setCampuses, setAdmins, setTeachers, setStudents, setHomeroomAssignments,
        addCampus, updateCampus, deleteCampus, addAdmin, updateAdmin, deleteAdmin, addTeacher, updateTeacher, deleteTeacher,
        addStudent, updateStudent, deleteStudent, promoteStudent, addGrade, updateGrade, deleteGrade, addCommunication, updateCommunication, deleteCommunication,
        addExam, updateExam, deleteExam, addSchedule, updateSchedule, deleteSchedule, addAssignment, updateAssignment, deleteAssignment,
        addEvent, updateEvent, deleteEvent, updateUserAvatar, saveAttendance, deleteAttendance, assignTemporaryPassword
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
