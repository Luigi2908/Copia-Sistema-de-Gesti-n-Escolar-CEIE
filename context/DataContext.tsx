
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    Campus, AdminUser, Teacher, Student, Grade, Communication, ClassSchedule, Exam, TeacherCourseAssignment, UserRole, AttendanceRecord, SchoolEvent
} from '../types';
import { useAuth } from './AuthContext';

// Helper to handle Supabase responses
function handleResponse<T>(response: { data: T | null; error: any }): T {
    if (response.error) {
        console.error('Supabase error:', response.error.message);
        throw new Error(response.error.message);
    }
    return response.data as T;
}

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

    // CRUD Functions
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

    addGrade: (data: Omit<Grade, 'id'>) => Promise<void>;
    updateGrade: (id: string, data: Partial<Grade>) => Promise<void>;
    deleteGrade: (id: string) => Promise<void>;
    
    addCommunication: (data: Omit<Communication, 'id' | 'date'>) => Promise<void>;
    updateCommunication: (id: string, data: Partial<Communication>) => Promise<void>;
    deleteCommunication: (id: string) => Promise<void>;
    
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
    const [cancellations, setCancellations] = useState<{classScheduleId: string, date: string}[]>([]);
    const [homeroomAssignments, setHomeroomAssignments] = useState<Record<string, string>>({});

    // Fetch initial data ONLY from LocalStorage
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Load from Local Storage (using empty array as fallback)
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
        
        if (isAuthenticated) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);
    
    // Update campus counts dynamically based on local data
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


    // --- CRUD HELPER (PURE LOCAL) ---
    // Fixed: Standard function syntax to safely handle generics in TSX
    const addInstance = async function<T extends { id: string }>(
        table: string, 
        data: Omit<T, 'id'>, 
        setState: React.Dispatch<React.SetStateAction<any[]>>,
        localKey: string
    ): Promise<void> {
        const newItem = { ...data, id: `${table.substring(0,3)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` } as unknown as T;
        setState(prev => {
            const newState = [newItem, ...prev];
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    const updateInstance = async function<T>(
        table: string, 
        id: string, 
        data: Partial<T>, 
        setState: React.Dispatch<React.SetStateAction<any[]>>,
        localKey: string
    ): Promise<void> {
        setState(prev => {
            const newState = prev.map(item => item.id === id ? { ...item, ...data } : item);
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    const deleteInstance = async (
        table: string, 
        id: string, 
        setState: React.Dispatch<React.SetStateAction<any[]>>,
        localKey: string
    ): Promise<void> => {
        setState(prev => {
            const newState = prev.filter(item => item.id !== id);
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    // Generic CRUD Mappings
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

    // Attendance Logic (Upsert Local)
    const saveAttendance = async (data: Omit<AttendanceRecord, 'id'>) => {
        const recordData = { ...data, count: data.count || 1, period: data.period };
        
        setAttendanceRecords(prev => {
            const existingRecord = prev.find(r => r.studentId === data.studentId && r.date === data.date && r.period === data.period);
            let newState;
            if (existingRecord) {
                newState = prev.map(r => r.id === existingRecord.id ? { ...r, ...recordData } : r);
            } else {
                const newItem = { ...recordData, id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` };
                newState = [...prev, newItem];
            }
            localStorage.setItem('school_attendance', JSON.stringify(newState));
            return newState;
        });
    };

    const deleteAttendance = (id: string) => deleteInstance('attendance', id, setAttendanceRecords, 'school_attendance');

    // User-specific CRUD (Pure Local)
    const addUser = async (data: any, role: UserRole, table: string, setState: React.Dispatch<React.SetStateAction<any[]>>, localKey: string) => {
        const newItem = { 
            ...data, 
            id: `local-${role.substring(0,3)}-${Date.now()}`, 
            role, 
            isLocal: true,
            avatar: `https://ui-avatars.com/api/?name=${data.name.replace(/\s/g, '+')}&background=random` 
        };
        setState(prev => {
            const newState = [newItem, ...prev];
            localStorage.setItem(localKey, JSON.stringify(newState));
            return newState;
        });
    };

    const updateUserAvatar = async (userId: string, role: UserRole, avatar: string) => {
        let table = '';
        let localKey = '';
        let setState: React.Dispatch<React.SetStateAction<any[]>> | null = null;
        switch(role) {
            case UserRole.CAMPUS_ADMIN: table = 'admins'; localKey = 'school_admins'; setState = setAdmins; break;
            case UserRole.TEACHER: table = 'teachers'; localKey = 'school_teachers'; setState = setTeachers; break;
            case UserRole.STUDENT: case UserRole.PARENT: table = 'students'; localKey = 'school_students'; setState = setStudents; break;
        }
        if (table && setState) {
            await updateInstance(table, userId, { avatar }, setState, localKey);
        }
    };

    const assignTemporaryPassword = async (userId: string, role: UserRole, tempPass: string) => {
        let table = '';
        let localKey = '';
        let setState: React.Dispatch<React.SetStateAction<any[]>> | null = null;
        switch(role) {
            case UserRole.CAMPUS_ADMIN: table = 'admins'; localKey = 'school_admins'; setState = setAdmins; break;
            case UserRole.TEACHER: table = 'teachers'; localKey = 'school_teachers'; setState = setTeachers; break;
            case UserRole.STUDENT: case UserRole.PARENT: table = 'students'; localKey = 'school_students'; setState = setStudents; break;
        }
        if (table && setState) {
            // Store as tempPassword in local storage object
            await updateInstance(table, userId, { tempPassword: tempPass }, setState, localKey);
        }
    };

    const addAdmin = (data: any) => addUser(data, UserRole.CAMPUS_ADMIN, 'admins', setAdmins, 'school_admins');
    const updateAdmin = (id: string, data: any) => updateInstance('admins', id, data, setAdmins, 'school_admins');
    const deleteAdmin = (id: string) => deleteInstance('admins', id, setAdmins, 'school_admins');

    const addTeacher = (data: any) => addUser(data, UserRole.TEACHER, 'teachers', setTeachers, 'school_teachers');
    const updateTeacher = (id: string, data: any) => updateInstance('teachers', id, data, setTeachers, 'school_teachers');
    const deleteTeacher = (id: string) => deleteInstance('teachers', id, setTeachers, 'school_teachers');

    const addStudent = async (data: Omit<Student, 'id'|'role'|'avatar'|'rollNumber'>) => {
        let dataToAdd = {...data};
        if (dataToAdd.campusId && !dataToAdd.campusName) {
             const campus = campuses.find(c => c.id === dataToAdd.campusId);
             if (campus) dataToAdd.campusName = campus.name;
        }

        const newItem = { 
            ...dataToAdd, 
            id: `local-stu-${Date.now()}`, 
            role: UserRole.STUDENT, 
            isLocal: true,
            avatar: `https://ui-avatars.com/api/?name=${data.name.replace(/\s/g, '+')}&background=random`,
            rollNumber: `${data.class.replace(/\D/g, '')}${data.section}${Math.floor(Math.random()*50)+1}`
        };
        
        setStudents(prev => {
            const newState = [newItem, ...prev];
            localStorage.setItem('school_students', JSON.stringify(newState));
            return newState;
        });
    };
    const updateStudent = (id: string, data: any) => updateInstance('students', id, data, setStudents, 'school_students');
    const deleteStudent = (id: string) => deleteInstance('students', id, setStudents, 'school_students');


    const value = {
        isLoading, campuses, admins, teachers, students, grades, communications, schedules, exams, events, assignments, cancellations, homeroomAssignments, attendanceRecords,
        setCampuses, setAdmins, setTeachers, setStudents,
        setHomeroomAssignments,
        addCampus, updateCampus, deleteCampus, addAdmin, updateAdmin, deleteAdmin, addTeacher, updateTeacher, deleteTeacher,
        addStudent, updateStudent, deleteStudent, addGrade, updateGrade, deleteGrade, addCommunication, updateCommunication, deleteCommunication,
        addExam, updateExam, deleteExam, addSchedule, updateSchedule, deleteSchedule, addAssignment, updateAssignment, deleteAssignment,
        addEvent, updateEvent, deleteEvent,
        updateUserAvatar, saveAttendance, deleteAttendance,
        assignTemporaryPassword
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
