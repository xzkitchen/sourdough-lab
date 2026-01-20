import React from 'react';
import { Icons } from '../utils/icons';
import { Badge, MixerStage } from './index';

export function StepCard({ step, isDone, onToggle, children }) {
  const accents = {
    prep: 'from-amber-400 to-orange-500',
    mix: 'from-orange-400 to-rose-500',
    bulk: 'from-rose-400 to-pink-600',
    shape: 'from-fuchsia-500 to-purple-600',
    cold: 'from-sky-500 to-blue-600',
    bake: 'from-red-500 to-orange-600',
  }[step.phase] || 'from-neutral-400 to-neutral-600';

  return (
    <div 
      onClick={onToggle}
      className={`relative rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer group
        ${isDone 
          ? 'opacity-40 grayscale bg-neutral-900/30 border border-white/5' 
          : 'bg-neutral-900/60 backdrop-blur-md border border-white/10 hover:border-white/20 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]'
        }
      `}
    >
      {!isDone && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${accents}`} />
      )}
      {!isDone && (
        <div className={`absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-full opacity-10 bg-gradient-to-r ${accents} blur-xl group-hover:opacity-20 transition-opacity`} />
      )}

      <div className="p-6 pl-8 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg tracking-tight ${isDone ? 'text-neutral-600 line-through' : 'text-white group-hover:text-orange-100 transition-colors'}`}>
              {step.title}
            </h3>
            <div className="text-sm text-neutral-500 font-medium mt-0.5">{step.subtitle}</div>
          </div>
          
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isDone ? 'bg-neutral-800 border-neutral-800 text-neutral-500' : 'border-neutral-700 text-transparent group-hover:border-neutral-500'
          }`}>
            {isDone && <Icons.Check className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mb-5">
          <Badge text={step.action} className={!isDone ? `bg-gradient-to-r ${accents} text-white shadow-lg shadow-black/20` : 'bg-neutral-800 text-neutral-500'} />
          <Badge text={`${step.timeValue} ${step.timeUnit}`} className="bg-neutral-800 text-neutral-300 border border-white/5" />
          {step.warning && <Badge text={step.warning} icon={<Icons.Flame className="w-3 h-3" />} className="bg-rose-500/10 text-rose-400 border border-rose-500/20" />}
        </div>

        <div className={`grid gap-4 transition-all duration-500 overflow-hidden ${isDone ? 'max-h-0 opacity-0' : 'max-h-[1200px] opacity-100'}`}>
          {step.mixerParams && (
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 mb-3 uppercase tracking-widest">
                <Icons.Mixer className="w-3.5 h-3.5" /> 厨师机
              </div>
              <div className={`grid ${step.mixerParams.stage2 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {step.mixerParams.stage1 && <MixerStage label={step.mixerParams.stage2 ? "阶段一" : "操作参数"} data={step.mixerParams.stage1} />}
                {step.mixerParams.stage2 && <MixerStage label="阶段二" data={step.mixerParams.stage2} />}
              </div>
            </div>
          )}
          
          {step.ingredients?.length > 0 && (
            <div className="flex flex-wrap gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
              {step.ingredients.map((ing, i) => (
                <div key={i} className="bg-neutral-800/50 px-3 py-2 rounded-xl border border-white/5 flex items-baseline gap-2">
                  <span className="text-xs text-neutral-400 font-bold">{ing.name}</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {ing.value}<span className="text-[10px] text-neutral-500 ml-0.5 font-normal">{ing.unit || 'g'}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {step.tips && (
            <ul className="mt-1 space-y-3">
              {step.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-neutral-200 font-medium leading-relaxed">
                  <span className="block w-1.5 h-1.5 rounded-full bg-neutral-600 mt-2.5 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
