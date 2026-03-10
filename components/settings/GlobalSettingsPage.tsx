
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { InformationCircleIcon, AcademicCapIcon, PaintBrushIcon, ExclamationTriangleIcon, UploadIcon, CalendarIcon, CheckIcon, ClipboardDocumentListIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Campus } from '../../types';
import { useData } from '../../context/DataContext';

interface GlobalSettings {
    schoolName: string;
    schoolLogo: string; 
    rector: string;
    secretary: string;
    address: string;
    city: string;
    contactEmail: string;
    contactPhone: string;
    schoolPeriod: string; 
    schoolDay: number;
    schoolMonth: number;
    schoolYear: number;
    primaryColor: string;
    secondaryColor: string;
    maintenanceMode: boolean;
    numberOfPeriods: number;
    academicRegistry: string;
    periodDates?: { startDate: string; endDate: string; }[];
}

const bimonthlyPeriods = [
    { value: '1', label: '1. Feb - Mar' },
    { value: '2', label: '2. Abr - May' },
    { value: '3', label: '3. Jun - Jul' },
    { value: '4', label: '4. Ago - Sep' },
    { value: '5', label: '5. Oct - Nov' },
    { value: '6', label: '6. Dic - Ene' },
];

const defaultSettings: GlobalSettings = {
    schoolName: 'Sistema de Gestión CEIE',
    schoolLogo: 'https://i.ibb.co/3ym3z0g/Captura-de-pantalla-2025-03-09-174823.png',
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
    numberOfPeriods: 3,
    academicRegistry: 'Resolución No. 12345 de MinEducación',
    periodDates: Array(3).fill({ startDate: '', endDate: '' }),
};

const GlobalSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { campuses } = useData();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
    const [selectedConfigId, setSelectedConfigId] = useState(''); 
    const [notification, setNotification] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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
        
        const savedSettingsRaw = localStorage.getItem(storageKey) || localStorage.getItem('school_global_settings');
        let loadedSettings = savedSettingsRaw ? { ...defaultSettings, ...JSON.parse(savedSettingsRaw) } : defaultSettings;

        const numPeriods = loadedSettings.numberOfPeriods || 3;
        const currentDates = loadedSettings.periodDates || [];
        loadedSettings.periodDates = Array.from({ length: numPeriods }, (_, i) => currentDates[i] || { startDate: '', endDate: '' });

        setSettings(loadedSettings);
    }, [user, selectedConfigId]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        let storageKey = 'school_global_settings';
        if (user?.role === UserRole.CAMPUS_ADMIN && user.campusId) {
            storageKey = `school_settings_${user.campusId}`;
        } else if (user?.role === UserRole.SUPER_ADMIN && selectedConfigId !== 'global') {
            storageKey = `school_settings_${selectedConfigId}`;
        }
        
        localStorage.setItem(storageKey, JSON.stringify(settings));
        
        setNotification('¡Configuración guardada exitosamente!');
        setIsSaving(false);
        
        setTimeout(() => setNotification(''), 4000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'numberOfPeriods') {
            const num = Number(value);
            setSettings(prev => ({
                ...prev, 
                numberOfPeriods: num,
                periodDates: Array.from({ length: num }, (_, i) => prev.periodDates?.[i] || { startDate: '', endDate: '' })
            }));
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

    const inputClasses = "w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:bg-slate-800 dark:text-white dark:border-slate-700 text-sm";
    const labelClasses = "block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300";

    const isFormDisabled = user?.role === UserRole.SUPER_ADMIN && !selectedConfigId;

    return (
        <>
            {notification && (
                <div className="fixed bottom-10 right-10 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-in-up flex items-center gap-3">
                    <CheckIcon className="w-6 h-6"/>
                    <span className="font-bold text-sm tracking-tight">{notification}</span>
                </div>
            )}

            <Card className="min-h-[calc(100vh-120px)] flex flex-col p-0 overflow-hidden border-none shadow-none bg-transparent">
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-[2.5rem]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Configuración Superior</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Parámetros institucionales y de gestión académica.</p>
                        </div>
                        {user?.role === UserRole.SUPER_ADMIN && (
                            <select value={selectedConfigId} onChange={e => setSelectedConfigId(e.target.value)} className="w-full md:w-72 p-3.5 border rounded-2xl bg-slate-50 text-slate-700 font-black focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none cursor-pointer appearance-none shadow-inner text-sm">
                                <option value="" disabled>Seleccionar Campus...</option>
                                <option value="global">Ecosistema Global</option>
                                {campuses.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide border-b dark:border-slate-800">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'} flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap`}>
                                {React.cloneElement(tab.icon as React.ReactElement<{className?: string}>, { className: "w-5 h-5" })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 px-8 py-10 border-x border-slate-100 dark:border-slate-800">
                    <fieldset disabled={isFormDisabled || isSaving} className="h-full space-y-8 animate-fade-in">
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="relative group shrink-0">
                                        <img src={settings.schoolLogo} alt="Logo" className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800" />
                                        <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <UploadIcon className="text-white w-10 h-10" />
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-xl font-black text-slate-800 dark:text-white">Escudo Oficial</h4>
                                        <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">Identidad visual para carnets, certificados y reportes.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Razón Social Institucional</label>
                                        <input type="text" name="schoolName" value={settings.schoolName} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div><label className={labelClasses}>Rector / Director</label><input type="text" name="rector" value={settings.rector} onChange={handleChange} className={inputClasses} /></div>
                                    <div><label className={labelClasses}>Ciudad</label><input type="text" name="city" value={settings.city} onChange={handleChange} className={inputClasses} /></div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'academic' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelClasses}>Ciclo Académico Actual</label>
                                        <select name="schoolPeriod" value={settings.schoolPeriod} onChange={handleChange} className={inputClasses}>
                                            {bimonthlyPeriods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Periodos Evaluativos</label>
                                        <select name="numberOfPeriods" value={settings.numberOfPeriods} onChange={handleChange} className={inputClasses}>
                                            <option value={3}>Trimestral (3 Periodos)</option>
                                            <option value={4}>Bimestral (4 Periodos)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                                    <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5"/> Cronograma de Cortes
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Array.from({ length: settings.numberOfPeriods }).map((_, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-50 dark:border-indigo-900/50 shadow-sm">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase block mb-3">Periodo {i + 1}</span>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="date" value={settings.periodDates?.[i]?.startDate || ''} onChange={(e) => handlePeriodDateChange(i, 'startDate', e.target.value)} className="w-full p-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700"/>
                                                    <input type="date" value={settings.periodDates?.[i]?.endDate || ''} onChange={(e) => handlePeriodDateChange(i, 'endDate', e.target.value)} className="w-full p-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700"/>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'customization' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                    <label className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-400">Color Primario</label>
                                    <div className="w-32 h-32 rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-slate-900 mb-6 cursor-pointer relative overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
                                        <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"/>
                                    </div>
                                    <input type="text" name="primaryColor" value={settings.primaryColor} onChange={handleChange} className="w-full text-center p-3 font-mono text-xs border rounded-2xl dark:bg-slate-950 dark:text-white uppercase font-bold" maxLength={7} />
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                    <label className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-400">Color Secundario</label>
                                    <div className="w-32 h-32 rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-slate-900 mb-6 cursor-pointer relative overflow-hidden" style={{ backgroundColor: settings.secondaryColor }}>
                                        <input type="color" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"/>
                                    </div>
                                    <input type="text" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} className="w-full text-center p-3 font-mono text-xs border rounded-2xl dark:bg-slate-950 dark:text-white uppercase font-bold" maxLength={7} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div className="flex justify-center py-6">
                                <div className="max-w-xl w-full bg-rose-50 dark:bg-rose-950/20 p-10 rounded-[3rem] border border-rose-100 dark:border-rose-900/50 text-center">
                                    <ExclamationTriangleIcon className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Modo Mantenimiento</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">Active esta opción para restringir el acceso a estudiantes y padres mientras realiza ajustes técnicos importantes.</p>
                                    <label className="relative inline-flex items-center cursor-pointer group">
                                        <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer"/>
                                        <div className="w-20 h-10 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5px] after:left-[5px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-rose-600"></div>
                                        <span className="ml-5 text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                            {settings.maintenanceMode ? 'SISTEMA CERRADO' : 'SISTEMA ABIERTO'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </fieldset>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-b-[2.5rem] flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={isFormDisabled || isSaving} 
                        className="px-12 py-4 bg-primary text-white rounded-[1.2rem] font-black shadow-2xl shadow-primary/30 hover:bg-blue-700 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSaving ? 'Procesando...' : 'Aplicar Cambios'}
                    </button>
                </div>
            </Card>
        </>
    );
};

export default GlobalSettingsPage;
