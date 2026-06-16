import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ensureNotifyPermission, notify, setAppTitle } from '../../lib/notify.js';

/**
 * StepTimer — 步骤内置倒计时（折叠间隔 / 静置 / 一发观察等）
 *
 * 之前 fold 1/2/3 写着"30 分钟后"却没有任何计时手段，全靠用户自己掐表。
 * 自包含 localStorage（sdl.steptimer.${stepId}），刷新/切 tab 不丢；
 * 到点发 Notification（权限在 Start 时请求）+ 页面内变色。
 *
 * Props:
 *   stepId    步骤 id（storage key）
 *   minutes   倒计时时长（分钟，已经过季节调整）
 *   title     步骤中文名（用于通知文案）
 */
const PREFIX = 'sdl.steptimer.';

/** Reset 进度时清掉所有步骤计时器（App.resetProgress 调用） */
export function clearAllStepTimers() {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export function StepTimer({ stepId, minutes, title }) {
  const key = `${PREFIX}${stepId}`;
  const notifiedKey = `${key}.notified`;

  const [startedAt, setStartedAt] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? Number(raw) : null;
    } catch { return null; }
  });
  const [now, setNow] = useState(() => Date.now());
  const [resetState, setResetState] = useState('idle');
  const resetTimerRef = useRef(null);

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const totalMs = minutes * 60000;
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const done = startedAt && remainingMs === 0;
  const overMin = done ? Math.floor((elapsedMs - totalMs) / 60000) : 0;

  // 到点：通知一次 + 标题提醒
  useEffect(() => {
    if (!done) return;
    try {
      if (!localStorage.getItem(notifiedKey)) {
        localStorage.setItem(notifiedKey, '1');
        notify(`${title} · 时间到`, `${minutes} 分钟计时结束，回来做下一个动作。`);
        setAppTitle(`${title} 时间到`);
      }
    } catch {}
  }, [done, title, minutes, notifiedKey]);

  const startTimer = useCallback(() => {
    const ts = Date.now();
    try {
      localStorage.setItem(key, String(ts));
      localStorage.removeItem(notifiedKey);
    } catch {}
    setStartedAt(ts);
    setNow(ts);
    ensureNotifyPermission();
  }, [key, notifiedKey]);

  const resetTimer = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(notifiedKey);
    } catch {}
    setStartedAt(null);
    setAppTitle(null);
  }, [key, notifiedKey]);

  // 二次确认清零：与 ProcessProgress / ColdRetardTracker 统一（点一次→确认→再点才清）
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
      resetTimer();
    }
  }, [startedAt, resetState, resetTimer]);

  // StepTimer 随步骤展开/收起 mount/unmount，卸载时清掉悬挂的确认计时
  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div
      className={[
        'mt-3 px-3 py-2 border border-dashed flex items-center justify-between gap-3',
        done ? 'border-accent' : 'border-line-soft',
      ].join(' ')}
    >
      <div className="min-w-0">
        <div className="font-mono text-2xs text-muted uppercase tracking-[0.24em]">
          Timer · 计时 {minutes} 分钟
        </div>
        <div className={`font-zh text-xs mt-0.5 ${done ? 'text-accent-ink font-medium' : 'text-muted'}`}>
          {!startedAt
            ? '到点会发提醒（首次需允许通知）'
            : done
              ? `时间到${overMin > 0 ? ` · 已超 ${overMin} 分钟` : ''}`
              : '计时中 · 可切去别的页面'}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {startedAt && (
          <div
            className={`font-mono text-lg font-semibold tabular-nums leading-none ${done ? 'text-accent-ink' : 'text-ink'}`}
          >
            {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
          </div>
        )}
        {!startedAt ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); startTimer(); }}
            className="px-3 py-2 bg-ink text-bg font-mono text-2xs uppercase tracking-[0.24em] cursor-pointer hover:bg-accent-ink transition-colors duration-fast whitespace-nowrap min-h-[40px]"
          >
            ▶ Start · 计时
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            aria-pressed={resetState === 'confirming'}
            className={[
              'font-mono text-2xs uppercase tracking-[0.20em] px-2.5 py-2 border cursor-pointer transition-colors duration-fast whitespace-nowrap min-h-[40px]',
              resetState === 'confirming'
                ? 'border-accent bg-accent text-bg'
                : 'border-line-soft text-muted hover:border-ink hover:text-ink',
            ].join(' ')}
          >
            {resetState === 'confirming' ? '↻ 再点一次确认' : '↻ 清零'}
          </button>
        )}
      </div>
    </div>
  );
}

export default StepTimer;
