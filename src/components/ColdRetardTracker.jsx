import React from 'react';
import { Icons } from '../utils/icons';

export function ColdRetardTracker({ savedTime, savedDuration, onSetTime, onSetDuration, onReset }) {
  const currentDuration = savedDuration || 16;

  if (!savedTime) {
    return (
      <div className="mb-6 p-6 rounded-3xl bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-xl text-center">
        <div className="text-neutral-400 mb-4 text-sm font-medium">所有面团已放入冰箱？</div>
        <button 
          onClick={onSetTime}
          className="w-full py-4 bg-white text-neutral-950 rounded-2xl font-bold hover:bg-neutral-200 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Icons.Snowflake className="w-5 h-5 text-blue-500" />
          点击记录放入时间
        </button>
      </div>
    );
  }

  const startTime = new Date(savedTime);
  const preheatTime = new Date(startTime.getTime() + (currentDuration - 1) * 60 * 60 * 1000);
  const bakeTime = new Date(startTime.getTime() + currentDuration * 60 * 60 * 1000);

  return (
    <div className="p-1 rounded-3xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="bg-neutral-900/90 backdrop-blur-xl rounded-[22px] p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 text-orange-200/80 font-bold text-xs uppercase tracking-widest">
            <Icons.Timer className="w-4 h-4" />
            <span>智能时间表</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <span className="text-neutral-500 font-medium">放入冰箱</span>
            <span className="font-mono text-white font-bold text-lg">
              {startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="py-2">
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-3">目标发酵时长</div>
            <div className="grid grid-cols-2 gap-3">
              {[12, 16].map((h) => (
                <button
                  key={h}
                  onClick={(e) => { e.stopPropagation(); onSetDuration(h); }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                    currentDuration === h 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' 
                      : 'bg-neutral-800 text-neutral-400 border-white/5 hover:bg-neutral-700'
                  }`}
                >
                  {h} 小时
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {h === 12 ? '标准' : '推荐'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-orange-400 font-bold text-lg">
                <Icons.Flame className="w-5 h-5" />
                建议预热
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">满{currentDuration}h前1小时</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-3xl font-bold text-white tracking-tight">
                {preheatTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-neutral-500 font-medium mt-1">
                {preheatTime.getDate() !== startTime.getDate() ? '次日' : '今日'}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center border border-white/5">
            <span className="text-neutral-400 text-xs font-medium">最佳开烤时间 (满{currentDuration}h)</span>
            <span className="font-mono text-neutral-200 font-bold">
              {bakeTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <button 
            onClick={onReset} 
            className="w-full mt-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold flex items-center justify-center gap-2 group"
          >
            <Icons.Undo className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
            撤销 / 重新记录
          </button>
        </div>
      </div>
    </div>
  );
}
