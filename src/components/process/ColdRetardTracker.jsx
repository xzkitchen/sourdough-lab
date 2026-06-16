import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WINDOW_OPTIONS, PREHEAT_MIN } from '../../hooks/useColdRetard.js';
import { colors } from '../../design/tokens.js';

/**
 * ColdRetardTracker — 冷藏后熟倒计时器（纯 UI）
 *
 * 状态全部来自 useColdRetard hook（在 App 层创建并共享）：
 *   - 未启动时渲染在第 12 步展开区里
 *   - 启动后由 App 提升到 Bake tab 顶部常驻，不随步骤完成态消失
 *
 * 启动后窗口时长仍可改（预热/入炉时刻随之重算），
 * 并提供"校正起算时间"（±30 分钟）补记实际放入冰箱的时刻。
 */

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

export function ColdRetardTracker({ tracker }) {
  const {
    startedAt, maxHours, minHours,
    start, clear, pickWindow, adjustStart,
  } = tracker;

  // 秒级显示的 tick 留在组件内部（不进 App 层，避免全局每秒重渲染）
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const targetMs = maxHours * 3600000;
  const minMs = minHours * 3600000;
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const remainingMs = startedAt ? Math.max(0, targetMs - elapsedMs) : targetMs;
  const bakeAt = startedAt ? startedAt + targetMs : null;
  const preheatAt = bakeAt ? bakeAt - PREHEAT_MIN * 60000 : null;
  const status = !startedAt
    ? 'idle'
    : elapsedMs < minMs ? 'early' : elapsedMs <= targetMs ? 'window' : 'over';

  const [resetState, setResetState] = useState('idle');
  const resetTimerRef = useRef(null);

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
      clear();
    }
  }, [startedAt, resetState, clear]);

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  const displaySec = Math.floor(remainingMs / 1000);
  const dispHh = Math.floor(displaySec / 3600);
  const dispMm = Math.floor((displaySec % 3600) / 60);
  const dispSs = displaySec % 60;

  let statusEn = 'Standing by';
  let statusZh = '待启动';
  if (startedAt) {
    if (status === 'early') {
      const toWindowH = Math.ceil((minMs - elapsedMs) / 3600000);
      statusEn = `Resting · ${toWindowH}h to window`;
      statusZh = `静置中 · 距下限 ${toWindowH}h`;
    } else if (status === 'window') {
      statusEn = 'In window · ready to bake';
      statusZh = '可烤窗口 · 随时可烤';
    } else {
      statusEn = 'Overdue · past max';
      statusZh = '已超过目标时长';
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
      className="border-t-2 border-b-2 border-ink py-3 my-2 bg-bg"
      style={{ '--cold-window': colors.ok, '--cold-over': colors.accent, '--cold-rest': colors.ink }}
    >
      <style>{`
        .ldr-status::before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 6px; vertical-align: middle; background: var(--dot, ${colors.ink}); border-radius: 9999px; }
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
          <div className="font-mono text-2xs text-muted uppercase tracking-[0.20em] mt-1 tabular-nums">
            {startedAt ? `${String(dispSs).padStart(2, '0')}s · ${timeLabel}` : timeLabel}
          </div>
        </div>
      </div>

      {/* Window picker：启动前后都可改；启动后改动会重算预热/入炉时刻 */}
      <div className="mt-3 pt-3 border-t border-line-soft">
        <div className="font-mono text-2xs text-muted uppercase tracking-[0.20em] mb-1.5">
          Target window · 目标时长{startedAt ? '（可随时改，时间表自动重算）' : ''}
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
                  'font-mono text-xs uppercase tracking-[0.18em] px-3 py-2 border whitespace-nowrap transition-colors duration-fast min-h-[40px]',
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

      {/* Schedule · 时间表：启动后显示预热 / 入炉绝对时刻 + 起算校正 */}
      {startedAt && (
        <div className="mt-3 pt-3 border-t border-line-soft">
          <div className="font-mono text-2xs text-muted uppercase tracking-[0.20em] mb-2">
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
                <div className="font-mono text-2xs text-muted uppercase tracking-[0.18em] mt-1">
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
                <div className="font-mono text-2xs text-muted uppercase tracking-[0.18em] mt-1">
                  {fmtDayHint(bakeAt)}
                </div>
              </div>
            </div>

            {/* 起算校正：补记"其实早就放进冰箱了" */}
            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-line-soft border-dashed">
              <div className="min-w-0">
                <div className="font-mono text-2xs text-ink uppercase tracking-[0.18em]">
                  Started at {fmtClock(startedAt)}
                </div>
                <div className="font-zh text-[11px] text-muted mt-0.5">
                  起算时间 · 放早/放晚了可校正
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => adjustStart(-30)}
                  className="font-mono text-xs px-3 py-2 border border-line-soft text-muted hover:border-ink hover:text-ink active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[40px] whitespace-nowrap"
                >
                  −30min
                </button>
                <button
                  type="button"
                  onClick={() => adjustStart(30)}
                  className="font-mono text-xs px-3 py-2 border border-line-soft text-muted hover:border-ink hover:text-ink active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[40px] whitespace-nowrap"
                >
                  +30min
                </button>
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
              className="px-4 py-2.5 bg-ink text-bg font-mono text-xs uppercase tracking-[0.30em] cursor-pointer hover:bg-accent-ink active:bg-sunken transition-colors duration-fast whitespace-nowrap min-h-[44px]"
            >
              ▶ Start · 开始计时
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              aria-pressed={resetState === 'confirming'}
              className={[
                'font-mono text-xs uppercase tracking-[0.24em] px-3 py-2.5 border whitespace-nowrap transition-colors duration-fast cursor-pointer min-h-[44px]',
                resetState === 'confirming'
                  ? 'border-accent bg-accent text-bg'
                  : 'border-ink text-ink hover:bg-ink hover:text-bg active:bg-sunken',
              ].join(' ')}
            >
              {resetState === 'confirming' ? '↻ 再点一次确认' : '↻ Reset · 清零'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ColdRetardTracker;
