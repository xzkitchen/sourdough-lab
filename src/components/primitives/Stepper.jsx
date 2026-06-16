import React, { useState, useRef, useEffect } from 'react';

/**
 * Stepper — 大号 ± 步进器（编辑器风：1px 实线 + 大号 mono 数字）
 *
 * 从 FeedPanel 抽出的共享 primitive，Formula（面包数量）和
 * Starter（数量/旧种）两个 Tab 共用。
 *
 * 数字可点按直接键入（editable 默认 true）——旧种从 60 调到 200
 * 不用点几十次 +。键入值按 min/max clamp，blur/回车提交。
 *
 * Props:
 *   value / onChange
 *   step          步进量（默认 1）
 *   min / max     边界（默认 1 / Infinity）
 *   editable      数字是否可点按键入（默认 true）
 *   suffix        数字后缀（如 'g'）
 *   labelEn / labelZh
 *   ariaLabel     组的无障碍名称
 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 1,
  max = Infinity,
  editable = true,
  suffix,
  labelEn,
  labelZh,
  ariaLabel,
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    if (!editable) return;
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    const n = Number(draft);
    if (Number.isFinite(n)) {
      onChange(Math.max(min, Math.min(max, Math.round(n))));
    }
    setEditing(false);
  };

  return (
    <div
      className="grid border border-ink bg-surface grid-cols-[48px_1fr_48px] sm:grid-cols-[56px_1fr_56px]"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={`减少${ariaLabel || ''}`}
        className="font-display text-2xl text-ink border-r border-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[48px] disabled:text-faint disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        −
      </button>
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            aria-label={`输入${ariaLabel || ''}`}
            className="font-display font-medium text-3xl sm:text-4xl text-ink leading-none tabular-nums bg-transparent border-b-2 border-accent outline-none w-[3.5ch] p-0"
            style={{ letterSpacing: '-0.04em' }}
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            aria-label={editable ? `点按输入${ariaLabel || ''}` : undefined}
            tabIndex={editable ? 0 : -1}
            className={[
              'font-display font-medium text-3xl sm:text-4xl text-ink leading-none tabular-nums text-left',
              editable ? 'cursor-text hover:text-accent-ink transition-colors duration-fast' : 'cursor-default',
            ].join(' ')}
            style={{ letterSpacing: '-0.04em' }}
          >
            {value}
            {suffix && (
              <span className="font-mono text-sm sm:text-base text-faint ml-1 sm:ml-1.5">{suffix}</span>
            )}
          </button>
        )}
        <div className="text-right min-w-0">
          {labelEn && (
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] sm:tracking-[0.24em] truncate">
              {labelEn}
            </div>
          )}
          {labelZh && (
            <div className="font-zh text-xs text-muted mt-0.5 truncate">{labelZh}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={`增加${ariaLabel || ''}`}
        className="font-display text-2xl text-ink border-l border-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[48px] disabled:text-faint disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        +
      </button>
    </div>
  );
}

export default Stepper;
