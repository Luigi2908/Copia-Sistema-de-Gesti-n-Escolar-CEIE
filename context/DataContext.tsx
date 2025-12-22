
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    Campus, AdminUser, Teacher, Student, Grade, Communication, ClassSchedule, Exam, TeacherCourseAssignment, UserRole, AttendanceRecord, SchoolEvent, AcademicHistory
} from '../types';

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

    const loadFromStorage = () => {
        setIsLoading(true);
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
        setIsLoading(false);
    };

    useEffect(() => {
        loadFromStorage();
    }, []);

    const saveToStorage = (key: string, data: any, stateSetter: any) => {
        localStorage.setItem(key, JSON.stringify(data));
        stateSetter(data);
    };

    // CRUD Methods
    const addCampus = async (data: any) => {
        const newList = [...campuses, { ...data, id: `CAMP-${Date.now()}`, teachers: 0, students: 0 }];
        saveToStorage('school_campuses', newList, setCampuses);
    };

    const updateCampus = async (id: string, data: any) => {
        const newList = campuses.map(c => c.id === id ? { ...c, ...data } : c);
        saveToStorage('school_campuses', newList, setCampuses);
    };

    const deleteCampus = async (id: string) => {
        const newList = campuses.filter(c => c.id !== id);
        saveToStorage('school_campuses', newList, setCampuses);
    };

    const addAdmin = async (data: any) => {
        const newList = [...admins, { ...data, id: `ADM-${Date.now()}`, role: UserRole.CAMPUS_ADMIN, avatar: `https://ui-avatars.com/api/?name=${data.name.replace(' ', '+')}` }];
        saveToStorage('school_admins', newList, setAdmins);
    };

    const updateAdmin = async (id: string, data: any) => {
        const newList = admins.map(a => a.id === id ? { ...a, ...data } : a);
        saveToStorage('school_admins', newList, setAdmins);
    };

    const deleteAdmin = async (id: string) => {
        const newList = admins.filter(a => a.id !== id);
        saveToStorage('school_admins', newList, setAdmins);
    };

    const addTeacher = async (data: any) => {
        const newList = [...teachers, { ...data, id: `TEA-${Date.now()}`, role: UserRole.TEACHER, avatar: `https://ui-avatars.com/api/?name=${data.name.replace(' ', '+')}` }];
        saveToStorage('school_teachers', newList, setTeachers);
    };

    const updateTeacher = async (id: string, data: any) => {
        const newList = teachers.map(t => t.id === id ? { ...t, ...data } : t);
        saveToStorage('school_teachers', newList, setTeachers);
    };

    const deleteTeacher = async (id: string) => {
        const newList = teachers.filter(t => t.id !== id);
        saveToStorage('school_teachers', newList, setTeachers);
    };

    const addStudent = async (data: any) => {
        const id = `STU-${Date.now()}`;
        const newList = [...students, { ...data, id, role: UserRole.STUDENT, avatar: `https://ui-avatars.com/api/?name=${data.name.replace(' ', '+')}`, rollNumber: `${data.class.substring(0,3)}${Date.now().toString().slice(-4)}` }];
        saveToStorage('school_students', newList, setStudents);
    };

    const updateStudent = async (id: string, data: any) => {
        const newList = students.map(s => s.id === id ? { ...s, ...data } : s);
        saveToStorage('school_students', newList, setStudents);
    };

    const deleteStudent = async (id: string) => {
        const newList = students.filter(s => s.id !== id);
        saveToStorage('school_students', newList, setStudents);
    };

    const addGrade = async (data: any) => {
        const newList = [...grades, { ...data, id: `GRD-${Date.now()}` }];
        saveToStorage('school_grades', newList, setGrades);
    };

    const updateGrade = async (id: string, data: any) => {
        const newList = grades.map(g => g.id === id ? { ...g, ...data } : g);
        saveToStorage('school_grades', newList, setGrades);
    };

    const deleteGrade = async (id: string) => {
        const newList = grades.filter(g => g.id !== id);
        saveToStorage('school_grades', newList, setGrades);
    };

    const addCommunication = async (data: any) => {
        const newList = [...communications, { ...data, id: `COM-${Date.now()}`, date: new Date().toISOString() }];
        saveToStorage('school_communications', newList, setCommunications);
    };

    const updateCommunication = async (id: string, data: any) => {
        const newList = communications.map(c => c.id === id ? { ...c, ...data } : c);
        saveToStorage('school_communications', newList, setCommunications);
    };

    const deleteCommunication = async (id: string) => {
        const newList = communications.filter(c => c.id !== id);
        saveToStorage('school_communications', newList, setCommunications);
    };

    const addExam = async (data: any) => {
        const newList = [...exams, { ...data, id: `EXM-${Date.now()}` }];
        saveToStorage('school_exams', newList, setExams);
    };

    const updateExam = async (id: string, data: any) => {
        const newList = exams.map(e => e.id === id ? { ...e, ...data } : e);
        saveToStorage('school_exams', newList, setExams);
    };

    const deleteExam = async (id: string) => {
        const newList = exams.filter(e => e.id !== id);
        saveToStorage('school_exams', newList, setExams);
    };

    const addSchedule = async (data: any) => {
        const newList = [...schedules, { ...data, id: `SCH-${Date.now()}` }];
        saveToStorage('school_schedules', newList, setSchedules);
    };

    const updateSchedule = async (id: string, data: any) => {
        const newList = schedules.map(s => s.id === id ? { ...s, ...data } : s);
        saveToStorage('school_schedules', newList, setSchedules);
    };

    const deleteSchedule = async (id: string) => {
        const newList = schedules.filter(s => s.id !== id);
        saveToStorage('school_schedules', newList, setSchedules);
    };

    const addAssignment = async (data: any) => {
        const newList = [...assignments, { ...data, id: `ASG-${Date.now()}` }];
        saveToStorage('teacher_assignments', newList, setAssignments);
    };

    const updateAssignment = async (id: string, data: any) => {
        const newList = assignments.map(a => a.id === id ? { ...a, ...data } : a);
        saveToStorage('teacher_assignments', newList, setAssignments);
    };

    const deleteAssignment = async (id: string) => {
        const newList = assignments.filter(a => a.id !== id);
        saveToStorage('teacher_assignments', newList, setAssignments);
    };

    const addEvent = async (data: any) => {
        const newList = [...events, { ...data, id: `EVT-${Date.now()}` }];
        saveToStorage('school_events', newList, setEvents);
    };

    const updateEvent = async (id: string, data: any) => {
        const newList = events.map(e => e.id === id ? { ...e, ...data } : e);
        saveToStorage('school_events', newList, setEvents);
    };

    const deleteEvent = async (id: string) => {
        const newList = events.filter(e => e.id !== id);
        saveToStorage('school_events', newList, setEvents);
    };

    const saveAttendance = async (data: any) => {
        const existingIdx = attendanceRecords.findIndex(r => r.studentId === data.studentId && r.date === data.date && r.period === data.period);
        let newList;
        if (existingIdx > -1) {
            newList = [...attendanceRecords];
            newList[existingIdx] = { ...newList[existingIdx], ...data };
        } else {
            newList = [...attendanceRecords, { ...data, id: `ATT-${Date.now()}` }];
        }
        saveToStorage('school_attendance', newList, setAttendanceRecords);
    };

    const deleteAttendance = async (id: string) => {
        const newList = attendanceRecords.filter(r => r.id !== id);
        saveToStorage('school_attendance', newList, setAttendanceRecords);
    };

    const updateUserAvatar = async (userId: string, role: UserRole, avatar: string) => {
        let key = '';
        let setter: any;
        let list: any[];

        if (role === UserRole.CAMPUS_ADMIN) { key = 'school_admins'; setter = setAdmins; list = admins; }
        else if (role === UserRole.TEACHER) { key = 'school_teachers'; setter = setTeachers; list = teachers; }
        else if (role === UserRole.STUDENT) { key = 'school_students'; setter = setStudents; list = students; }
        else if (role === UserRole.PARENT) { key = 'school_parents'; setter = setStudents; list = students; } // Parents usually share student ID context or own key

        if (key) {
            const newList = list.map(u => u.id === userId ? { ...u, avatar } : u);
            saveToStorage(key, newList, setter);
            const currentUser = JSON.parse(localStorage.getItem('school_current_user') || '{}');
            if (currentUser.id === userId) {
                localStorage.setItem('school_current_user', JSON.stringify({ ...currentUser, avatar }));
            }
        }
    };

    const assignTemporaryPassword = async (userId: string, role: UserRole, tempPass: string) => {
        console.log(`Asignando clave temporal ${tempPass} al usuario ${userId}`);
    };

    const promoteStudent = async (studentId: string): Promise<{ success: boolean; message: string; type?: 'error' | 'warning' | 'success' }> => {
        const student = students.find(s => s.id === studentId);
        if (!student) return { success: false, message: 'Estudiante no encontrado.', type: 'error' };

        if (student.financialStatus === 'Mora Crítica (Bloqueado)') {
            return { success: false, message: 'Bloqueo por mora crítica.', type: 'error' };
        }

        const studentGrades = grades.filter(g => g.studentId === studentId);
        const subjects: string[] = Array.from(new Set(studentGrades.map(g => g.subject)));
        
        if (subjects.length === 0) return { success: false, message: 'Sin registros académicos.', type: 'warning' };

        const semesterDetails = subjects.map(subj => {
            const subjGrades = studentGrades.filter(g => g.subject === subj);
            const totalScore = subjGrades.reduce((acc, g) => acc + (g.score * g.percentage / 100), 0);
            const totalPerc = subjGrades.reduce((acc, g) => acc + g.percentage, 0);
            return { subject: subj, finalGrade: totalPerc > 0 ? (totalScore * 100) / totalPerc : 0 };
        });

        const gpa = semesterDetails.reduce((acc, d) => acc + d.finalGrade, 0) / semesterDetails.length;
        const passed = gpa >= 3.0;

        const historyRecord: AcademicHistory = {
            semester: student.section,
            year: student.schoolYear,
            period: student.schoolPeriod,
            gpa: parseFloat(gpa.toFixed(2)),
            status: passed ? 'Aprobado' : 'Reprobado',
            financialStatusAtClosing: student.financialStatus || 'Al día',
            details: semesterDetails,
            completionDate: new Date().toISOString()
        };

        const nextSemester = passed ? (parseInt(student.section) + 1).toString() : student.section;
        const updatedHistory = [...(student.history || []), historyRecord];

        const newList = students.map(s => s.id === studentId ? { ...s, section: nextSemester, history: updatedHistory, observation: passed ? `Promovido a semestre ${nextSemester}` : `Reprobó semestre ${student.section}` } : s);
        saveToStorage('school_students', newList, setStudents);

        return { 
            success: passed, 
            message: passed ? `Promovido a semestre ${nextSemester}.` : `Debe repetir el semestre (${gpa.toFixed(2)}).`,
            type: passed ? 'success' : 'warning'
        };
    };

    const value = {
        isLoading, campuses, admins, teachers, students, grades, communications, schedules, exams, events, assignments, attendanceRecords,
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
