import React from 'react';

/**
 * 喂养卡片组件
 * @param {string} label - 标签
 * @param {number} value - 数值
 */
export function FeedCard({ label, value }) {
  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 text-center shadow-lg">
      <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="font-mono text-3xl font-bold text-white">
        {value}
        <span className="text-sm ml-1 text-neutral-500 font-medium">g</span>
      </div>
    </div>
  );
}
