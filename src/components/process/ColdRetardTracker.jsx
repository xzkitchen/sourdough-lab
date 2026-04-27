import React, { useState, useEffect, useCallback } from 'react';

/**
 * ColdRetardTracker — 冷藏后熟计时器
 *
 * 风格：编辑器 ledger，等同于一张"打卡条"
 *   - 上方双线
 *   - 大号 mono 时间（HH:MM）+ 推荐区间提示
 *   - Start / Reset 按钮
 *   - localStorage 持久化（key 由 props 传入）
 *
 * Props:
 *   stepId        步骤 id（用作 storage key 一部分）
 *   minHours      推荐最短小时数（默认 8）
 *   maxHours      推荐最长小时数（默认 14）
 *   storageKey    可选：自定义 localStorage key（默认 sdl.cold.<stepId>）
 */
export function ColdRetardTracker({ stepId, minHours = 8, maxHours = 14, storageKey }) {
  const key = storageKey || `sdl.cold.${stepId}`;

  // 起始时间戳（ms）；null 表示未启动
  const [startedAt, setStartedAt] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? Number(raw) : null;
    } catch { return null; }
  });

  // 1s tick
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const start = useCallback(() => {
    const ts = Date.now();
    try { localStorage.setItem(key, String(ts)); } catch {}
    setStartedAt(ts);
    setNow(ts);
  }, [key]);

  const reset = useCallback(() => {
    if (startedAt && !window.confirm('清除冷藏计时？\nReset cold-retard timer?')) return;
    try { localStorage.removeItem(key); } catch {}
    setStartedAt(null);
  }, [key, startedAt]);

  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  const totalMin = Math.floor(elapsed / 60000);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;

  let status = 'idle';      // idle | early | window | over
  let statusEn = 'Standing by';
  let statusZh = '待启动';
  if (startedAt) {
    if (hh < minHours) {
      status = 'early';
      statusEn = `Resting · ${minHours - hh}h to window`;
      statusZh = `静置中 · 距下限 ${minHours - hh}h`;
    } else if (hh <= maxHours) {
      status = 'window';
      statusEn = 'In window · ready to bake';
      statusZh = '可烤窗口';
    } else {
      status = 'over';
      statusEn = `Overdue · ${hh - maxHours}h past max`;
      statusZh = `已超过 ${hh - maxHours}h`;
    }
  }

  const accentColor = status === 'window'
    ? 'var(--cold-window)'
    : status === 'over'
      ? 'var(--cold-over)'
      : 'var(--cold-rest)';

  return (
    <div
      className="border-t-2 border-b-2 border-ink py-3 my-2"
      style={{ '--cold-window': '#5C7A3F', '--cold-over': '#B85A3E', '--cold-rest': '#1A1715' }}
    >
      <style>{`
        .ldr-status::before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 6px; vertical-align: middle; background: var(--dot, #1A1715); border-radius: 9999px; }
      `}</style>

      <div className="flex justify-between items-baseline">
        <div>
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            Cold retard · 冷藏后熟
          </div>
          <div className="font-mono text-2xs text-muted uppercase tracking-[0.18em] mt-0.5">
            window {minHours}–{maxHours}h
          </div>
        </div>
        <div className="text-right">
          <div className="font-display font-medium text-4xl text-ink leading-none tabular-nums" style={{ letterSpacing: '-0.04em' }}>
            {String(hh).padStart(2, '0')}
            <span className="text-faint">:</span>
            {String(mm).padStart(2, '0')}
          </div>
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] mt-0.5">
            elapsed
          </div>
        </div>
      </div>

      {/* 状态行 */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-line-soft">
        <div className="ldr-status font-mono text-2xs uppercase tracking-[0.18em]" style={{ '--dot': accentColor, color: accentColor }}>
          <span className="text-ink">{statusEn}</span>
        </div>
        <div className="font-zh text-xs text-muted">{statusZh}</div>
      </div>

      {/* 按钮区 */}
      <div className="flex gap-2 mt-3">
        {!startedAt ? (
          <button
            type="button"
            onClick={start}
            className="px-3.5 py-1.5 bg-ink text-bg font-mono text-2xs uppercase tracking-[0.30em] cursor-pointer hover:bg-accent-ink transition-colors duration-fast"
          >
            ▶ Start
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="px-3.5 py-1.5 bg-transparent text-ink border border-ink font-mono text-2xs uppercase tracking-[0.30em] cursor-pointer hover:bg-ink hover:text-bg transition-colors duration-fast"
          >
            ↻ Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default ColdRetardTracker;
