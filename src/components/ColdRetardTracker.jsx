import React, { useState, useEffect } from 'react';
import { Icons } from '../utils/icons';

/**
 * 冷藏发酵追踪器
 * @param {string} savedTime - 保存的开始时间 (ISO string)
 * @param {number} savedDuration - 目标时长 (小时)
 * @param {function} onSetTime - 设置开始时间
 * @param {function} onSetDuration - 设置时长
 * @param {function} onReset - 重置
 */
export function ColdRetardTracker({ savedTime, savedDuration, onSetTime, onSetDuration, onReset }) {
  const [elapsed, setElapsed] = useState(0);
  
  // 计算已经过的时间
  useEffect(() => {
    if (!savedTime) return;
    
    const interval = setInterval(() => {
      const start = new Date(savedTime).getTime();
      const now = Date.now();
      const hours = (now - start) / (1000 * 60 * 60);
      setElapsed(hours);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [savedTime]);
  
  const progress = savedTime ? Math.min((elapsed / savedDuration) * 100, 100) : 0;
  const remaining = Math.max(savedDuration - elapsed, 0);
  const isReady = elapsed >= savedDuration;
  
  // 格式化时间显示
  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };
  
  // 格式化预计完成时间
  const getEndTime = () => {
    if (!savedTime) return '--:--';
    const start = new Date(savedTime);
    const end = new Date(start.getTime() + savedDuration * 60 * 60 * 1000);
    return end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="bg-neutral-800/50 rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icons.Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-neutral-300">冷藏追踪</span>
        </div>
        
        {/* 时长选择 */}
        <select
          value={savedDuration}
          onChange={(e) => onSetDuration(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-700 border border-white/10 rounded-lg px-2 py-1 text-xs text-neutral-300 cursor-pointer"
        >
          {[12, 14, 16, 18, 24, 36, 48].map(h => (
            <option key={h} value={h}>{h}小时</option>
          ))}
        </select>
      </div>
      
      {!savedTime ? (
        // 未开始状态
        <button
          onClick={onSetTime}
          className="w-full py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
        >
          开始冷藏计时
        </button>
      ) : (
        // 计时中状态
        <div>
          {/* 进度条 */}
          <div className="h-2 bg-neutral-700 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isReady 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-300' 
                  : 'bg-gradient-to-r from-blue-400 to-cyan-300'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* 时间信息 */}
          <div className="flex justify-between items-center text-xs mb-3">
            <span className="text-neutral-400">
              已过 <span className="text-white font-mono">{formatTime(elapsed)}</span>
            </span>
            <span className="text-neutral-400">
              {isReady ? (
                <span className="text-green-400 font-medium">✓ 可以烘烤了!</span>
              ) : (
                <>剩余 <span className="text-white font-mono">{formatTime(remaining)}</span></>
              )}
            </span>
          </div>
          
          {/* 预计时间 */}
          <div className="flex justify-between items-center text-[10px] text-neutral-500">
            <span>预计完成: {getEndTime()}</span>
            <button
              onClick={onReset}
              className="text-red-400/70 hover:text-red-400 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
