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
const PREHEAT_MIN = 60; // 烤箱 + 铸铁锅预热 1 小时（与 step 13"预热烘烤"描述一致）

/** 把时间戳格式化成 HH:MM */
function fmtClock(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "今日 / 明日 / 后天 / +Xd" */
function fmtDayHint(ts) {
  if (!ts) return '';
  const eventDay = new Date(ts); eventDay.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((eventDay - today) / 86400000);
  if (diff === 0) return '今日 · today';
  if (diff === 1) return '明日 · tmr';
  if (diff === 2) return '后天 · +2d';
  if (diff > 2) return `+${diff}d`;
  if (diff < 0) return `${diff}d`;
  return '';
}

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

  // 关键时刻（绝对时间）：开烤 = 起算 + 选定时长；预热 = 开烤前 PREHEAT_MIN 分钟
  const bakeAt = startedAt ? startedAt + targetMs : null;
  const preheatAt = bakeAt ? bakeAt - PREHEAT_MIN * 60000 : null;

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

      {/* Schedule · 时间表：启动后显示具体的预热 / 入炉时间点（绝对时间） */}
      {startedAt && (
        <div className="mt-3 pt-3 border-t border-line-soft">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] mb-2">
            Schedule · 时间表
          </div>
          <div className="space-y-2">
            {/* Preheat */}
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-2xs text-ink uppercase tracking-[0.18em]">
                  Preheat oven
                </div>
                <div className="font-zh text-[11px] text-muted mt-0.5">
                  预热烤箱 · 烤前 {PREHEAT_MIN} 分钟
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-base sm:text-lg font-semibold text-ink tabular-nums leading-none">
                  {fmtClock(preheatAt)}
                </div>
                <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] mt-1">
                  {fmtDayHint(preheatAt)}
                </div>
              </div>
            </div>

            {/* Bake */}
            <div className="flex items-baseline justify-between gap-3 pt-1.5 border-t border-line-soft border-dashed">
              <div className="min-w-0">
                <div className="font-mono text-2xs text-ink uppercase tracking-[0.18em]">
                  Start baking
                </div>
                <div className="font-zh text-[11px] text-muted mt-0.5">
                  开始烘烤 · 入炉时间
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-base sm:text-lg font-semibold text-ink tabular-nums leading-none">
                  {fmtClock(bakeAt)}
                </div>
                <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] mt-1">
                  {fmtDayHint(bakeAt)}
                </div>
              </div>
            </div>
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
