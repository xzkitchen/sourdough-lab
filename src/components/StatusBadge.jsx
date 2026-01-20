import React from 'react';

/**
 * 状态徽章组件
 * @param {string} label - 标签
 * @param {string} value - 值
 * @param {string} type - 类型: 'neutral' | 'success' | 'warning'
 */
export function StatusBadge({ label, value, type = 'neutral' }) {
  const styles = {
    neutral: 'bg-neutral-800/80 border-white/10 text-neutral-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };
  
  return (
    <div className={`flex-1 px-4 py-3 rounded-xl border ${styles[type]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="font-mono font-bold text-lg">{value}</div>
    </div>
  );
}
