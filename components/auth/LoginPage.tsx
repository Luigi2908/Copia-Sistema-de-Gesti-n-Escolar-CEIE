
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Campus, Teacher, Student, User } from '../../types';
import Card from '../ui/Card';
import { EyeIcon, EyeSlashIcon, GoogleIcon } from '../icons';
import Footer from '../layout/Footer';

const DatabaseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('luissalberto26@gmail.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [schoolName, setSchoolName] = useState('Sistema Gestión Superior');
  const [schoolLogo, setSchoolLogo] = useState<string>('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHBsMGdhaWJpamQ0OGxuYm85N2pyZ2F3YWdycjR2Ymtza2s2dzJhYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7t3XLkAB0fX7WEFs0/giphy.gif');

  useEffect(() => {
      const hasLocalData = localStorage.getItem('school_campuses');
      if (hasLocalData) setShowDemoUsers(true);

      const globalSettings = localStorage.getItem('school_global_settings');
      if (globalSettings) {
          const settings = JSON.parse(globalSettings);
          if (settings.schoolName) setSchoolName(settings.schoolName);
          if (settings.schoolLogo) setSchoolLogo(settings.schoolLogo);
      }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingrese el correo electrónico y la contraseña.');
      return;
    }
    setError('');
    
    try {
        await login(email, password, role);
    } catch (err: any) {
        setError(err.message || 'Ocurrió un error al iniciar sesión.');
    }
  };
  
  const handleGoogleLogin = async () => {
    setError('');
    try {
      await login('luissalberto26@gmail.com', 'password', UserRole.SUPER_ADMIN);
    } catch (err: any) {
      setError(err.message || 'Error al intentar iniciar sesión con Google.');
    }
  };

  const generateSeedData = () => {
      const campusId = 'CAMP-01';
      const campusName = 'Campus Metropolitano';
      const campus = { id: campusId, name: campusName, address: 'Sector Universitario #1', admin: 'Luis Salberto', teachers: 5, students: 35 };
      
      const admin = { 
          id: 'ADM-01', name: 'Luis Salberto', email: 'admin@local.com', role: UserRole.CAMPUS_ADMIN, 
          campusId, campusName, status: 'active', avatar: 'https://ui-avatars.com/api/?name=Luis+Salberto&background=005A9C&color=fff' 
      };
      
      // 5 Profesores especialistas en Espacios Académicos específicos del PDF
      const teacherSpecs = [
          { name: 'Carlos Rodriguez', faculty: 'Innovación', program: 'Publicidad', subject: 'Técnicas de aprendizaje', email: 'carlos@local.com' },
          { name: 'Ana Martínez', faculty: 'Ingeniería', program: 'Ingenieria de Sistemas', subject: 'Matemáticas básicas', email: 'ana@local.com' },
          { name: 'Roberto Gómez', faculty: 'Innovación', program: 'Publicidad', subject: 'Excel nivel básico', email: 'roberto@local.com' },
          { name: 'Elena Pineda', faculty: 'Ingeniería', program: 'Ingenieria de Sistemas', subject: 'Sistemas operativos - linux', email: 'elena@local.com' },
          { name: 'Ricardo Serna', faculty: 'Ciencias Administrativas y Contables', program: 'Contaduría Pública', subject: 'Contabilidad I', email: 'profe@local.com' }
      ];

      const teachers = teacherSpecs.map((t, i) => ({
          id: `TEA-0${i+1}`,
          name: t.name,
          email: t.email,
          role: UserRole.TEACHER,
          campusId,
          campusName,
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${t.name.replace(' ', '+')}&background=random`,
          documentNumber: `100${i+1}`,
          subject: t.subject, // Este es el "Espacio Académico"
          phone: `300100000${i+1}`,
          observation: `Facultad de ${t.faculty} - ${t.program}`
      }));

      // Programas y Semestres para los 5 grupos de prueba
      const groups = [
          { program: 'Publicidad', semester: '1' },
          { program: 'Ingenieria de Sistemas', semester: '1' },
          { program: 'Contaduría Pública', semester: '1' },
          { program: 'Publicidad', semester: '2' },
          { program: 'Ingenieria de Sistemas', semester: '2' }
      ];

      const firstNames = ['Juan', 'Maria', 'Pedro', 'Lucia', 'Mateo', 'Sofia', 'Diego', 'Valentina', 'Andres', 'Camila', 'Luis', 'Elena', 'Jose', 'Paula', 'Gabriel', 'Isabella', 'Ricardo', 'Mariana', 'Javier', 'Daniela'];
      const lastNames = ['García', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'Sánchez', 'González', 'Gómez', 'Fernández', 'Díaz', 'Torres', 'Ramírez', 'Vargas', 'Castillo', 'Jiménez', 'Moreno', 'Rojas', 'Mendoza', 'Cruz', 'Ortiz'];

      const students: any[] = [];
      const parents: any[] = [];
      const assignments: any[] = [];
      const schedules: any[] = [];
      const gradesData: any[] = [];

      let studentCount = 1;
      groups.forEach((group, gIdx) => {
          // 7 Estudiantes por cada Programa/Semestre
          for (let sNum = 1; sNum <= 7; sNum++) {
              const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
              const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
              const fullName = `${fName} ${lName}`;
              const sId = `STU-${String(studentCount).padStart(3, '0')}`;
              
              students.push({
                  id: sId,
                  name: fullName,
                  email: `estudiante${studentCount}@local.com`,
                  role: UserRole.STUDENT,
                  campusId,
                  campusName,
                  status: 'active',
                  avatar: `https://ui-avatars.com/api/?name=${fName}+${lName}&background=random`,
                  documentNumber: `200${studentCount}`,
                  class: group.program, // Nombre del Programa
                  section: group.semester, // Número del Semestre
                  rollNumber: `${group.program.substring(0,3)}${group.semester}${String(sNum).padStart(2, '0')}`,
                  schoolPeriod: 'A',
                  schoolYear: 2025
              });

              if (sNum === 1) {
                  parents.push({
                      id: `PAR-${studentCount}`,
                      name: `Acudiente de ${fName}`,
                      email: `padre${studentCount}@local.com`,
                      role: UserRole.PARENT,
                      campusId,
                      campusName,
                      avatar: `https://ui-avatars.com/api/?name=Padre+${fName}&background=random`,
                      studentId: sId
                  });
              }
              studentCount++;
          }
      });

      // Generar Carga Académica (Asignaciones) y Horarios
      // Vinculamos profesores con los programas/semestres donde se dicta su materia según PDF
      teachers.forEach((teacher, tIdx) => {
          // Buscamos qué grupos (Programa/Semestre) deben ver esta materia
          const targetGroups = groups.filter(g => {
              if (teacher.subject === 'Técnicas de aprendizaje') return g.semester === '1'; // Común en 1er sem
              if (teacher.subject === 'Matemáticas básicas') return g.semester === '1';
              if (teacher.subject === 'Excel nivel básico') return g.semester === '1';
              return true; // Simplificación: los demás dictan en cualquier semestre de su área
          });

          targetGroups.forEach((group, tgIdx) => {
              const assId = `ASS-${teacher.id}-${group.program}-${group.semester}`;
              assignments.push({
                  id: assId,
                  teacherId: teacher.id,
                  subject: teacher.subject,
                  class: group.program,
                  section: group.semester,
                  jornada: 'Diurno',
                  intensidadHoraria: 4
              });

              // Horario (Lunes a Viernes)
              const day = ((tIdx + tgIdx) % 5) + 1;
              schedules.push({
                  id: `SCH-${assId}`,
                  teacherId: teacher.id,
                  dayOfWeek: day,
                  startTime: `${8 + tgIdx}:00`,
                  endTime: `${9 + tgIdx}:00`,
                  subject: teacher.subject,
                  class: group.program,
                  section: group.semester
              });
          });
      });

      // Generar Calificaciones (Notas)
      students.forEach(student => {
          const studentAssignments = assignments.filter(a => a.class === student.class && a.section === student.section);
          studentAssignments.forEach(ass => {
              gradesData.push({
                  id: `GRD-${student.id}-${ass.id}`,
                  studentId: student.id,
                  subject: ass.subject,
                  class: student.class,
                  assignmentTitle: 'Actividad de Clase',
                  score: 3.5 + (Math.random() * 1.5), 
                  percentage: 20,
                  date: new Date().toISOString().split('T')[0]
              });
          });
      });

      // Persistencia
      localStorage.setItem('school_campuses', JSON.stringify([campus]));
      localStorage.setItem('school_admins', JSON.stringify([admin]));
      localStorage.setItem('school_teachers', JSON.stringify(teachers));
      localStorage.setItem('school_students', JSON.stringify(students));
      localStorage.setItem('school_parents', JSON.stringify(parents)); 
      localStorage.setItem('teacher_assignments', JSON.stringify(assignments));
      localStorage.setItem('school_schedules', JSON.stringify(schedules));
      localStorage.setItem('school_grades', JSON.stringify(gradesData));
      localStorage.setItem('school_events', JSON.stringify([{ id: 'E-01', title: 'Inducción Académica 2025', date: '2025-02-15', campusId, description: 'Presentación de facultades y programas.' }]));

      setShowDemoUsers(true);
      alert('¡Entorno Académico Superior Generado!\n- Estructura: Facultad > Programa > Semestre\n- 5 Profesores con materias del documento.\n- 35 Estudiantes en 5 programas/semestres diferentes.\n- Horarios y notas cargados.');
      window.location.reload();
  };

  const quickLogin = (uEmail: string, uRole: UserRole) => {
      setEmail(uEmail);
      setPassword('123456');
      setRole(uRole);
      setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
              <div className="bg-white p-3 rounded-2xl shadow-lg inline-block mb-4 dark:bg-slate-800">
                <img 
                    src={schoolLogo} 
                    alt="Logo" 
                    className="w-20 h-20 object-contain" 
                />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-indigo-400 pb-1">{schoolName}</h1>
              <p className="text-text-secondary text-sm mt-2 dark:text-slate-400 font-medium">Gestión de Facultades y Programas</p>
          </div>
          <Card className="shadow-2xl border-none">
            <form onSubmit={handleLogin}>
              {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100 flex items-center gap-2">
                      <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {error}
                  </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider dark:text-slate-300" htmlFor="email">
                  Correo Institucional
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-gray-400"
                  placeholder="ejemplo@universidad.edu"
                />
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider dark:text-slate-300" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-gray-400 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider dark:text-slate-300" htmlFor="role">
                  Perfil de Acceso
                </label>
                <div className="relative">
                    <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="shadow-sm appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-pointer"
                    >
                    {Object.values(UserRole).map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                    </select>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <button
                  className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none shadow-lg hover:from-blue-700 hover:to-primary transition-all duration-300 text-sm"
                  type="submit"
                >
                  Iniciar Sesión
                </button>
              </div>
            </form>

            <div className="my-5 flex items-center before:flex-1 before:border-t before:border-gray-200 before:mt-0.5 after:flex-1 after:border-t after:border-gray-200 after:mt-0.5 dark:before:border-slate-700 dark:after:border-slate-700">
                <p className="text-center font-medium mx-4 mb-0 text-xs text-gray-400 dark:text-slate-500 uppercase">O</p>
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 dark:bg-slate-700 dark:text-white transition-all"
            >
                <GoogleIcon className="w-5 h-5 mr-3" />
                Acceso Institucional Google
            </button>
          </Card>
        </div>

        <div className="w-full max-w-4xl mt-10 p-6 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl text-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-2">Entorno de Pruebas Superior</h3>
            <p className="text-xs text-slate-500 mb-5 dark:text-slate-400">Genera 5 docentes y 35 estudiantes distribuidos en Programas y Semestres reales.</p>
            
            <button 
                onClick={generateSeedData} 
                className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl transition-all text-sm font-bold shadow-lg mx-auto"
            >
                <DatabaseIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {showDemoUsers ? 'Regenerar Base Académica' : 'Generar Entorno Superior (35 Est)'}
            </button>

            {showDemoUsers && (
                <div className="mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                        <div onClick={() => quickLogin('admin@local.com', UserRole.CAMPUS_ADMIN)} className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all text-primary">Admin Campus</div>
                        <div onClick={() => quickLogin('profe@local.com', UserRole.TEACHER)} className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all text-blue-600">Profesor Contaduría</div>
                        <div onClick={() => quickLogin('estudiante1@local.com', UserRole.STUDENT)} className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all text-orange-600">Estudiante Publicidad</div>
                        <div onClick={() => quickLogin('padre1@local.com', UserRole.PARENT)} className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all text-purple-600">Acudiente Sistemas</div>
                    </div>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
