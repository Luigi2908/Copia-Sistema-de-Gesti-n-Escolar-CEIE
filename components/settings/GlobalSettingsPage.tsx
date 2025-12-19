
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { InformationCircleIcon, AcademicCapIcon, PaintBrushIcon, ExclamationTriangleIcon, UploadIcon, CalendarIcon, CheckIcon, ClipboardDocumentListIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Campus } from '../../types';
import { useData } from '../../context/DataContext';

// Define the type for our settings adapted for Higher Education
interface GlobalSettings {
    schoolName: string;
    schoolLogo: string; 
    rector: string;
    secretary: string;
    address: string;
    city: string;
    contactEmail: string;
    contactPhone: string;
    schoolPeriod: '1' | '2'; // Representing 2025-1, 2025-2
    schoolDay: number;
    schoolMonth: number;
    schoolYear: number;
    primaryColor: string;
    secondaryColor: string;
    maintenanceMode: boolean;
    numberOfPeriods: number;
    academicRegistry: string; // Resolution or Ministry Registry
    periodDates?: { startDate: string; endDate: string; }[];
}

const defaultSettings: GlobalSettings = {
    schoolName: 'Sistema de Gestión Superior',
    schoolLogo: 'https://media.giphy.com/media/cG2vQVd3MHIlmXlI99/giphy.gif',
    rector: 'Dr. Roberto Mendoza',
    secretary: 'Dra. Patricia Arango',
    address: 'Av. Universidad #45-12',
    city: 'Bogotá D.C.',
    contactEmail: 'admin@superior.edu.co',
    contactPhone: '3001234567',
    schoolPeriod: '1',
    schoolDay: 1,
    schoolMonth: 2,
    schoolYear: new Date().getFullYear(),
    primaryColor: '#005A9C',
    secondaryColor: '#FDB813',
    maintenanceMode: false,
    numberOfPeriods: 2, // Default to Semesters
    academicRegistry: 'Resolución No. 12345 de MinEducación',
    periodDates: Array(2).fill({ startDate: '', endDate: '' }),
};

const GlobalSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { campuses } = useData();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
    const [selectedConfigId, setSelectedConfigId] = useState(''); 
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (user?.role === UserRole.SUPER_ADMIN && !selectedConfigId) {
            setSettings(defaultSettings);
            return;
        }

        let storageKey = 'school_global_settings';
        if (user?.role === UserRole.CAMPUS_ADMIN && user.campusId) {
            storageKey = `school_settings_${user.campusId}`;
        } else if (user?.role === UserRole.SUPER_ADMIN) {
            if (selectedConfigId !== 'global') {
                storageKey = `school_settings_${selectedConfigId}`;
            }
        }
        
        let savedSettingsRaw = localStorage.getItem(storageKey);
        if (!savedSettingsRaw) {
            savedSettingsRaw = localStorage.getItem('school_global_settings');
        }

        let loadedSettings = defaultSettings;
        if (savedSettingsRaw) {
            loadedSettings = { ...defaultSettings, ...JSON.parse(savedSettingsRaw) };
        }

        const currentDates = loadedSettings.periodDates || [];
        const numPeriods = loadedSettings.numberOfPeriods;
        loadedSettings.periodDates = Array.from({ length: numPeriods }, (_, i) => currentDates[i] || { startDate: '', endDate: '' });

        setSettings(loadedSettings);

    }, [user, selectedConfigId]);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        let storageKey = 'school_global_settings';
        if (user?.role === UserRole.CAMPUS_ADMIN && user.campusId) {
            storageKey = `school_settings_${user.campusId}`;
        } else if (user?.role === UserRole.SUPER_ADMIN && selectedConfigId !== 'global') {
            storageKey = `school_settings_${selectedConfigId}`;
        }
        
        localStorage.setItem(storageKey, JSON.stringify(settings));
        showNotification('¡Configuración superior guardada exitosamente!');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'numberOfPeriods') {
            const newNumberOfPeriods = Number(value);
            setSettings(prev => {
                const currentDates = prev.periodDates || [];
                const newDates = Array.from({ length: newNumberOfPeriods }, (_, i) => currentDates[i] || { startDate: '', endDate: '' });
                return { ...prev, numberOfPeriods: newNumberOfPeriods, periodDates: newDates };
            });
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePeriodDateChange = (index: number, field: 'startDate' | 'endDate', value: string) => {
        setSettings(prev => {
            const newDates = [...(prev.periodDates || [])];
            newDates[index] = { ...newDates[index], [field]: value };
            return { ...prev, periodDates: newDates };
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setSettings(prev => ({ ...prev, schoolLogo: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const tabs = [
        { id: 'general', label: 'Datos Institucionales', icon: <InformationCircleIcon /> },
        { id: 'academic', label: 'Estructura Académica', icon: <AcademicCapIcon /> },
        { id: 'customization', label: 'Imagen Corporativa', icon: <PaintBrushIcon /> },
        { id: 'maintenance', label: 'Mantenimiento', icon: <ExclamationTriangleIcon /> },
    ];

    const inputClasses = "w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:focus:ring-indigo-500/40 text-sm";
    const labelClasses = "block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300";

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="relative group shrink-0">
                                <img src={settings.schoolLogo} alt="Logo" className="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-white dark:border-slate-800" />
                                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <UploadIcon className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <div className="flex-1 w-full text-center sm:text-left">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Escudo Institucional</h4>
                                <p className="text-slate-500 text-sm mb-4 dark:text-slate-400">Identidad oficial para carnets y reportes académicos.</p>
                                <div className="relative overflow-hidden inline-block">
                                    <button className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors border border-indigo-200">Seleccionar Imagen</button>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClasses}>Nombre de la Institución de Educación Superior</label>
                                <input type="text" name="schoolName" value={settings.schoolName} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClasses}>Registro Calificado / Resolución Ministerial</label>
                                <input type="text" name="academicRegistry" value={settings.academicRegistry} onChange={handleChange} className={inputClasses} placeholder="Ej: Registro SNIES o Resolución No..." />
                            </div>
                            <div>
                                <label className={labelClasses}>Rector / Director General</label>
                                <input type="text" name="rector" value={settings.rector} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Secretario(a) Académico(a)</label>
                                <input type="text" name="secretary" value={settings.secretary} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Ciudad</label>
                                <input type="text" name="city" value={settings.city} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Teléfono PBX</label>
                                <input type="tel" name="contactPhone" value={settings.contactPhone} onChange={handleChange} className={inputClasses} maxLength={10} />
                            </div>
                        </div>
                    </div>
                );
            case 'academic':
                return (
                     <div className="space-y-8 animate-fade-in-up">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                                Ciclo Académico Superior
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div>
                                    <label className={labelClasses}>Periodo Vigente</label>
                                    <select name="schoolPeriod" value={settings.schoolPeriod} onChange={handleChange} className={inputClasses}>
                                        <option value="1">Periodo 1 (Ene - Jun)</option>
                                        <option value="2">Periodo 2 (Jul - Dic)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Corresponde al semestre actual de formación.</p>
                                </div>
                                <div>
                                    <label className={labelClasses}>Frecuencia de Evaluación</label>
                                    <select name="numberOfPeriods" value={settings.numberOfPeriods} onChange={handleChange} className={inputClasses}>
                                        <option value={2}>Semestral (2 Cortes)</option>
                                        <option value={3}>Cuatrimestral (3 Cortes)</option>
                                        <option value={4}>Bimestral (4 Cortes)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Define cuántos parciales se registran por espacio académico.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClasses}>Año Académico Base</label>
                                    <select name="schoolYear" value={settings.schoolYear} onChange={handleChange} className={inputClasses}>
                                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 w-full">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-2">
                                            <CheckIcon className="w-4 h-4"/> Nomenclatura activa: {settings.schoolYear}-{settings.schoolPeriod}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-500" />
                                Cronograma de Cortes de Calificación
                            </h4>
                            <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">Establezca los plazos máximos para que los docentes suban las notas de cada parcial o corte.</p>
                            
                            <div className="space-y-4">
                                {Array.from({ length: settings.numberOfPeriods }).map((_, i) => (
                                    <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="w-full md:w-40">
                                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg block text-center md:text-left">
                                                Corte / Parcial {i + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 w-full grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Apertura</label>
                                                <input type="date" value={settings.periodDates?.[i]?.startDate || ''} onChange={(e) => handlePeriodDateChange(i, 'startDate', e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500"/>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cierre de Sistema</label>
                                                <input type="date" value={settings.periodDates?.[i]?.endDate || ''} onChange={(e) => handlePeriodDateChange(i, 'endDate', e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'customization':
                 return (
                     <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Imagen Institucional</h3>
                            <p className="text-slate-500 mt-2 dark:text-slate-400">Personalización de los colores para el ecosistema digital.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
                                <label className="text-base font-bold mb-4 text-slate-700 dark:text-slate-200">Color de Facultad</label>
                                <div className="relative group cursor-pointer mb-4">
                                    <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white dark:border-slate-700" style={{ backgroundColor: settings.primaryColor }}></div>
                                    <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                                </div>
                                <input type="text" name="primaryColor" value={settings.primaryColor} onChange={handleChange} className="w-full text-center p-3 font-mono text-sm border rounded-xl dark:bg-slate-900 dark:text-white uppercase" maxLength={7} />
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
                                <label className="text-base font-bold mb-4 text-slate-700 dark:text-slate-200">Color Secundario</label>
                                <div className="relative group cursor-pointer mb-4">
                                    <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white dark:border-slate-700" style={{ backgroundColor: settings.secondaryColor }}></div>
                                    <input type="color" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                                </div>
                                <input type="text" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} className="w-full text-center p-3 font-mono text-sm border rounded-xl dark:bg-slate-900 dark:text-white uppercase" maxLength={7} />
                            </div>
                        </div>
                    </div>
                );
            case 'maintenance':
                return (
                    <div className="py-10 flex justify-center animate-fade-in-up">
                        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-center">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-rose-900/20">
                                <ExclamationTriangleIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Cierre de Plataforma</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Útil para periodos de actualización de base de datos o mantenimiento preventivo. Restringe el acceso a todos excepto administradores.</p>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer"/>
                                <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                                <span className="ml-4 text-base font-medium text-slate-700 dark:text-slate-300">
                                    {settings.maintenanceMode ? 'Sistema en Mantenimiento' : 'Sistema en Línea'}
                                </span>
                            </label>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const isFormDisabled = user?.role === UserRole.SUPER_ADMIN && !selectedConfigId;

    return (
        <>
            {notification && (
                <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in-up flex items-center gap-3">
                    <div className="bg-white/20 p-1 rounded-full"><CheckIcon className="w-5 h-5"/></div>
                    <div><p className="font-bold text-sm">Operación Exitosa</p><p className="text-xs opacity-90">{notification}</p></div>
                </div>
            )}
            <Card className="min-h-[calc(100vh-120px)] flex flex-col p-0 overflow-hidden border-none shadow-none bg-transparent">
                <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-3xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Configuración Académica Superior</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Gestión de facultades, semestres y cortes evaluativos.</p>
                        </div>
                        {user?.role === UserRole.SUPER_ADMIN && (
                            <div className="w-full md:w-auto">
                                <select value={selectedConfigId} onChange={e => setSelectedConfigId(e.target.value)} className="w-full md:w-64 p-3 border rounded-xl bg-slate-50 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:border-slate-700">
                                    <option value="" disabled>Seleccione Sede / Facultad...</option>
                                    <option value="global">Configuración Central</option>
                                    {campuses.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'} flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap`}>
                                {React.cloneElement(tab.icon as React.ReactElement, { className: "w-5 h-5" })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 p-6 md:p-8 border-x border-slate-100 dark:border-slate-800">
                    <fieldset disabled={isFormDisabled} className="h-full">
                        {renderContent()}
                    </fieldset>
                </div>

                <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-b-3xl flex justify-end gap-4">
                    <button type="button" disabled={isFormDisabled} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Restablecer</button>
                    <button onClick={handleSave} disabled={isFormDisabled} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl transition-all text-sm">Guardar Cambios Académicos</button>
                </div>
            </Card>
        </>
    );
};

export default GlobalSettingsPage;
