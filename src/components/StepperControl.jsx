import React from 'react';
import { Icons } from '../utils/icons';

/**
 * 数值步进控制器
 * @param {string} label - 标签
 * @param {number} value - 当前值
 * @param {function} onChange - 值改变回调
 * @param {number} min - 最小值
 * @param {number} step - 步进值
 */
export function StepperControl({ label, value, onChange, min = 1, step = 1 }) {
  const decrease = () => {
    if (value > min) {
      onChange(value - step);
    }
  };
  
  const increase = () => {
    onChange(value + step);
  };
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-400 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={decrease}
          disabled={value <= min}
          className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icons.Minus className="w-4 h-4" />
        </button>
        <span className="font-mono text-2xl font-bold text-white w-8 text-center">
          {value}
        </span>
        <button
          onClick={increase}
          className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
