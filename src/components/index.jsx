import React from 'react';
import { Icons } from '../utils/icons';

// IngredientRow Component
export function IngredientRow({ name, weight, percent, note, accent }) {
  return (
    <div className="px-6 py-4.5 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group">
      <div>
        <div className={`font-medium text-[15px] flex items-center gap-2 ${accent ? 'text-orange-400' : 'text-neutral-200 group-hover:text-white'}`}>
          {accent && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
          {name}
        </div>
        {note && <div className="text-xs text-neutral-500 mt-1 pl-3.5 border-l-2 border-neutral-800">{note}</div>}
      </div>
      <div className="text-right">
        <div className="font-mono text-lg font-bold text-neutral-200 tabular-nums tracking-tight">
          {weight}<span className="text-xs text-neutral-500 ml-1 font-medium">g</span>
        </div>
        <div className="text-[11px] text-neutral-600 font-bold bg-neutral-900/80 px-1.5 py-0.5 rounded-md inline-block mt-1">{percent}%</div>
      </div>
    </div>
  );
}

// Stepper Control
export function StepperControl({ label, value, onChange, min = 0, step = 5 }) {
  const handleDecrement = () => onChange(Math.max(min, value - step));
  const handleIncrement = () => onChange(value + step);

  return (
    <div className="relative">
      <label className="block text-[11px] text-neutral-500 mb-2 ml-1 tracking-wider font-bold uppercase">{label}</label>
      <div className="flex items-center bg-neutral-900/50 rounded-2xl border border-white/10 p-1">
        <button 
          onClick={handleDecrement}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <Icons.Minus className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <div className="font-mono text-2xl font-bold text-white tabular-nums">{value}</div>
        </div>
        <button 
          onClick={handleIncrement}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <Icons.Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Status Badge
export function StatusBadge({ label, value, type }) {
  const styles = {
    warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)]',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-neutral-800/50 text-neutral-400 border-white/5'
  };
  return (
    <div className={`flex-1 p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 ${styles[type]} backdrop-blur-md`}>
      <div className="text-[10px] opacity-70 uppercase tracking-widest font-bold">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}

// Feed Card
export function FeedCard({ label, value }) {
  return (
    <div className="bg-neutral-900/40 rounded-3xl p-6 text-center border border-white/5 flex flex-col items-center justify-center gap-1 shadow-lg backdrop-blur-sm group hover:border-white/10 transition-all">
      <div className="text-[11px] text-neutral-500 font-bold tracking-wider uppercase mb-2">{label}</div>
      <div className="font-mono text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 tracking-tighter group-hover:scale-110 transition-transform duration-300">{value}</div>
      <div className="text-xs text-neutral-600 font-medium mt-1">Grams</div>
    </div>
  );
}

// Badge
export function Badge({ text, icon, className }) {
  return (
    <span className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 tracking-wide shadow-sm ${className}`}>
      {icon}
      {text}
    </span>
  );
}

// Mixer Stage
export function MixerStage({ label, data }) {
  return (
    <div className="bg-neutral-900/80 rounded-xl p-3.5 border border-white/5 shadow-inner">
      <div className="text-neutral-500 text-[10px] mb-2 uppercase tracking-widest font-bold">{label}</div>
      <div className="font-mono text-white text-base font-bold flex items-baseline gap-2">
        <span>{data.speed}档</span>
        <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
        <span>{data.time}</span>
      </div>
      <div className="text-[11px] text-neutral-500 mt-1 font-medium">{data.goal}</div>
    </div>
  );
}
