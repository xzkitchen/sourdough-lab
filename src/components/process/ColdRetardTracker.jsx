import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ColdRetardTracker — 冷藏后熟倒计时器
 *
 *   未启动: 显示目标小时数 (picker 选 16h → 大字显示 16:00)
 *   启动后: 倒计时 16:00 → 00:00
 *   到 0:   "Ready" 状态，超过显示 Overdue
 *
 * 编辑器 ledger 风格：Fraunces 斜体大字 + 小秒数 ticker 验证活性。
 *
 * Props:
 *   stepId        步骤 id（用作 storage key）
 *   minHours      推荐最短小时数（默认 8）
 *   maxHours      默认目标小时数（默认 14；用户可在 picker 里改）
 *   storageKey    可选自定义 key
 */
const WINDOW_OPTIONS = [12, 14, 16, 20, 24];

export function ColdRetardTracker({ stepId, minHours = 8, maxHours: defaultMaxHours = 14, storageKey }) {
  const key = storageKey || `sdl.cold.${stepId}`;
  const winKey = `${key}.window`;

  const [startedAt, setStartedAt] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? Number(raw) : null;
    } catch { return null; }
  });

  const [maxHours, setMaxHours] = useState(() => {
    try {
      const raw = localStorage.getItem(winKey);
      const n = raw ? Number(raw) : NaN;
      return WINDOW_OPTIONS.includes(n) ? n : defaultMaxHours;
    } catch { return defaultMaxHours; }
  });

  const [resetState, setResetState] = useState('idle');
  const resetTimerRef = useRef(null);

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

  const handleReset = useCallback(() => {
    if (!startedAt) return;
    if (resetState === 'idle') {
      setResetState('confirming');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setResetState('idle');
        resetTimerRef.current = null;
      }, 3000);
    } else {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      setResetState('idle');
      try { localStorage.removeItem(key); } catch {}
      setStartedAt(null);
    }
  }, [key, startedAt, resetState]);

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  const pickWindow = useCallback((h) => {
    setMaxHours(h);
    try { localStorage.setItem(winKey, String(h)); } catch {}
  }, [winKey]);

  // ─── 倒计时计算 ────────────────────────────────
  const targetMs = maxHours * 3600000;
  const minMs = minHours * 3600000;
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const remainingMs = startedAt ? Math.max(0, targetMs - elapsedMs) : targetMs;

  // 大字显示的内容：未启动 = 目标，启动后 = 剩余
  const displaySec = Math.floor(remainingMs / 1000);
  const dispHh = Math.floor(displaySec / 3600);
  const dispMm = Math.floor((displaySec % 3600) / 60);
  const dispSs = displaySec % 60;

  // 状态判断（基于 elapsed 而非 remaining）
  let status = 'idle';
  let statusEn = 'Standing by';
  let statusZh = '待启动';
  if (startedAt) {
    if (elapsedMs < minMs) {
      status = 'early';
      const toWindowH = Math.ceil((minMs - elapsedMs) / 3600000);
      statusEn = `Resting · ${toWindowH}h to window`;
      statusZh = `静置中 · 距下限 ${toWindowH}h`;
    } else if (elapsedMs <= targetMs) {
      status = 'window';
      statusEn = 'In window · ready to bake';
      statusZh = '可烤窗口';
    } else {
      status = 'over';
      const overH = Math.ceil((elapsedMs - targetMs) / 3600000);
      statusEn = `Overdue · ${overH}h past max`;
      statusZh = `已超过 ${overH}h`;
    }
  }

  const accentColor = status === 'window'
    ? 'var(--cold-window)'
    : status === 'over'
      ? 'var(--cold-over)'
      : 'var(--cold-rest)';

  const timeLabel = startedAt ? 'remaining · 剩余' : 'target · 目标';

  return (
    <div
      className="border-t-2 border-b-2 border-ink py-3 my-2"
      style={{ '--cold-window': '#5C7A3F', '--cold-over': '#b94a20', '--cold-rest': '#1A1715' }}
    >
      <style>{`
        .ldr-status::before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 6px; vertical-align: middle; background: var(--dot, #1A1715); border-radius: 9999px; }
      `}</style>

      {/* 顶部：标签 / 倒计时大字 */}
      <div className="flex justify-between items-baseline gap-3">
        <div className="min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            Cold retard · 冷藏后熟
          </div>
          <div className="font-mono text-2xs text-muted uppercase tracking-[0.18em] mt-0.5">
            Window {minHours}–{maxHours}h
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="font-display font-medium italic text-ink leading-none tabular-nums"
            style={{
              fontSize: 'clamp(28px, 8vw, 40px)',
              letterSpacing: '-0.02em',
              fontVariationSettings: "'opsz' 80, 'SOFT' 60, 'wght' 500",
            }}
          >
            {String(dispHh).padStart(2, '0')}
            <span className="text-faint">:</span>
            {String(dispMm).padStart(2, '0')}
          </div>
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] mt-1 tabular-nums">
            {startedAt ? `${String(dispSs).padStart(2, '0')}s · ${timeLabel}` : timeLabel}
          </div>
        </div>
      </div>

      {/* Window picker：仅在未启动时可见；启动后窗口已锁定 */}
      {!startedAt && (
        <div className="mt-3 pt-3 border-t border-line-soft">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] mb-1.5">
            Target window · 目标时长
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {WINDOW_OPTIONS.map(h => {
              const active = h === maxHours;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => pickWindow(h)}
                  className={[
                    'font-mono text-2xs uppercase tracking-[0.18em] px-2.5 py-1 border whitespace-nowrap transition-colors duration-fast',
                    active
                      ? 'border-ink bg-ink text-bg cursor-default'
                      : 'border-line-soft text-muted hover:border-ink hover:text-ink active:bg-sunken cursor-pointer',
                  ].join(' ')}
                >
                  {h}h
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 状态行 + 右侧动作按钮 */}
      <div className="flex justify-between items-center gap-3 mt-3 pt-2 border-t border-line-soft">
        <div className="min-w-0 flex-1">
          <div
            className="ldr-status font-mono text-2xs uppercase tracking-[0.18em] truncate"
            style={{ '--dot': accentColor, color: accentColor }}
          >
            <span className="text-ink">{statusEn}</span>
          </div>
          <div className="font-zh text-xs text-muted truncate mt-0.5">{statusZh}</div>
        </div>

        <div className="shrink-0">
          {!startedAt ? (
            <button
              type="button"
              onClick={start}
              className="px-3.5 py-1.5 bg-ink text-bg font-mono text-2xs uppercase tracking-[0.30em] cursor-pointer hover:bg-accent-ink active:bg-sunken transition-colors duration-fast whitespace-nowrap"
            >
              ▶ Start
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              aria-pressed={resetState === 'confirming'}
              className={[
                'font-mono text-2xs uppercase tracking-[0.24em] px-2.5 py-1.5 border whitespace-nowrap transition-colors duration-fast cursor-pointer',
                resetState === 'confirming'
                  ? 'border-accent bg-accent text-bg'
                  : 'border-ink text-ink hover:bg-ink hover:text-bg active:bg-sunken',
              ].join(' ')}
            >
              {resetState === 'confirming' ? '↻ Tap again' : '↻ Reset'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ColdRetardTracker;
