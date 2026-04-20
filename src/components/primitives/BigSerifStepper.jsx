import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { SmallCaps } from './SmallCaps.jsx';

/**
 * BigSerifStepper — Ledger V2 的刊物式数量器
 *
 * 结构：`[-] [huge Fraunces 数字 + (EN 小字 / zh 小字)] [+]`
 *   外层 hairline 盒子，`-` / `+` 按钮各 56px 方块，hairline 左右分隔，ghost
 *   主数字 Fraunces (stepper-num clamp 72–120px)，tabular
 *
 * Props:
 *   value, onChange, min=1, max=99, step=1
 *   labelEn    "LOAVES"
 *   labelZh    "个"
 *   unit       可选（如 "g"），追加在数字旁
 *   className
 */
export function BigSerifStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  labelEn,
  labelZh,
  unit,
  className,
}) {
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const dec = () => onChange(clamp(value - step));
  const inc = () => onChange(clamp(value + step));

  return (
    <div
      className={cn(
        'grid items-stretch border border-line bg-surface',
        className
      )}
      style={{ gridTemplateColumns: '56px 1fr 56px' }}
    >
      <StepperButton onClick={dec} disabled={value <= min} ariaLabel="减少">
        <Minus size={16} strokeWidth={1.5} />
      </StepperButton>

      {/* 主数字 + 标签（居中） */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-l border-r border-line">
        <span
          className="font-display text-ink tabular-nums tracking-tight leading-none"
          style={{
            fontSize: 'clamp(56px, 16vw, 96px)',
            fontVariationSettings: "'opsz' 96, 'SOFT' 40, 'wght' 380",
          }}
        >
          {value}
          {unit && (
            <span className="ml-1 font-mono text-[0.28em] text-faint align-top">
              {unit}
            </span>
          )}
        </span>
        {(labelEn || labelZh) && (
          <div className="flex flex-col items-end gap-1 text-right shrink-0">
            {labelEn && <SmallCaps tone="muted">{labelEn}</SmallCaps>}
            {labelZh && <span className="text-[11px] text-faint font-body">{labelZh}</span>}
          </div>
        )}
      </div>

      <StepperButton onClick={inc} disabled={value >= max} ariaLabel="增加">
        <Plus size={16} strokeWidth={1.5} />
      </StepperButton>
    </div>
  );
}

function StepperButton({ onClick, disabled, ariaLabel, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center justify-center bg-surface text-ink',
        'transition-colors ease-editorial duration-fast',
        'hover:bg-sunken active:bg-sunken',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface'
      )}
    >
      {children}
    </button>
  );
}

export default BigSerifStepper;
