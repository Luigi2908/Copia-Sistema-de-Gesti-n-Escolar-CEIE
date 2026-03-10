
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: string;
  trendColor?: 'green' | 'red';
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, trendColor = 'green', color }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/60 flex items-center justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 duration-300 group">
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
            {trend && (
                <span className={`text-[10px] font-bold mt-2 inline-block ${trendColor === 'green' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-md' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-1 rounded-md'}`}>
                    {trend}
                </span>
            )}
        </div>
        <div 
            className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm" 
            style={{ backgroundColor: `${color}15`, color: color }}
        >
            {icon}
        </div>
    </div>
  );
};

export default StatCard;
