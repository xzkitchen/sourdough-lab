import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ColdRetardTracker — 冷藏后熟计时器
 *
 * 编辑器 ledger 风格的"打卡条"：
 *   - 顶部：标签 + 推荐窗口 / Fraunces 斜体大号 HH:MM
 *   - 启动前：Window picker（12/14/16/20/24h）让用户决定目标小时数
 *   - 启动后：状态行（剩余时间提示）+ 右侧 Reset
 *
 * Props:
 *   stepId        步骤 id（用作 storage key 一部分）
 *   minHours      推荐最短小时数（默认 8）
 *   maxHours      推荐最长小时数 —— 默认 14，但用户可在 picker 里改成 12/16/20/24
 *   storageKey    可选：自定义 localStorage key（默认 sdl.cold.<stepId>）
 */
const WINDOW_OPTIONS = [12, 14, 16, 20, 24];

export function ColdRetardTracker({ stepId, minHours = 8, maxHours: defaultMaxHours = 14, storageKey }) {
  const key = storageKey || `sdl.cold.${stepId}`;
  const winKey = `${key}.window`;

  // 起始时间戳（ms）；null 表示未启动
  const [startedAt, setStartedAt] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? Number(raw) : null;
    } catch { return null; }
  });

  // 用户选择的目标 max 小时数（可在 picker 里调）
  const [maxHours, setMaxHours] = useState(() => {
    try {
      const raw = localStorage.getItem(winKey);
      const n = raw ? Number(raw) : NaN;
      return WINDOW_OPTIONS.includes(n) ? n : defaultMaxHours;
    } catch { return defaultMaxHours; }
  });

  // Reset 二步确认
  const [resetState, setResetState] = useState('idle');
  const resetTimerRef = useRef(null);

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

  // 计算 elapsed 与状态
  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  const totalMin = Math.floor(elapsed / 60000);
  const totalSec = Math.floor(elapsed / 1000) % 60;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;

  let status = 'idle';
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
      style={{ '--cold-window': '#5C7A3F', '--cold-over': '#b94a20', '--cold-rest': '#1A1715' }}
    >
      <style>{`
        .ldr-status::before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 6px; vertical-align: middle; background: var(--dot, #1A1715); border-radius: 9999px; }
      `}</style>

      {/* 顶部：标签 / 时间（Fraunces 斜体，3xl，更编辑器、不死板） */}
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
            {String(hh).padStart(2, '0')}
            <span className="text-faint">:</span>
            {String(mm).padStart(2, '0')}
          </div>
          {/* 副行：未启动时不显示，启动后显示秒数（验证计时确实在跑） */}
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] mt-1 tabular-nums">
            {startedAt ? `${String(totalSec).padStart(2, '0')}s · elapsed` : 'elapsed'}
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

        {/* 右侧：未启动 → Start；启动后 → Reset（两步确认）*/}
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
