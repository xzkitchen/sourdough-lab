import { useState, useEffect, useCallback } from 'react';
import { ensureNotifyPermission, notify, setAppTitle } from '../lib/notify.js';

/**
 * useColdRetard — 冷藏后熟计时器的持久状态与到点提醒
 *
 * 挂在 App 层的原因：
 *   1. 启动后要在 Bake tab 顶部常驻显示（不能随步骤完成态消失）
 *   2. resetProgress 要能一并清掉计时器（之前是组件私有 localStorage，
 *      第二炉打开还是上一炉的过期状态）
 *
 * 重要：这个 hook 不持有每秒 tick 的 React 状态——那会让 App 每秒重渲染，
 * 并干扰 AnimatePresence mode="wait" 的 tab 切换（实测会卡死退出动画）。
 * 秒级显示由 ColdRetardTracker 组件内部自己 tick；
 * 到点提醒/标题倒计时用纯 setInterval 在 effect 里完成，不碰 state。
 */
export const WINDOW_OPTIONS = [12, 14, 16, 20, 24];
export const PREHEAT_MIN = 60; // 烤箱 + 铸铁锅预热 1 小时（与"预热烘烤"步骤描述一致）

export function useColdRetard(stepId, { minHours = 8, defaultMaxHours = 14 } = {}) {
  const key = `sdl.cold.${stepId}`;
  const winKey = `${key}.window`;
  const notifiedKey = `${key}.notified`;

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

  const start = useCallback(() => {
    const ts = Date.now();
    try {
      localStorage.setItem(key, String(ts));
      localStorage.removeItem(notifiedKey);
    } catch {}
    setStartedAt(ts);
    ensureNotifyPermission();
  }, [key, notifiedKey]);

  /** 清空（Reset 进度时由 App 调用；组件内确认后也走这里） */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(notifiedKey);
    } catch {}
    setStartedAt(null);
    setAppTitle(null);
  }, [key, notifiedKey]);

  const pickWindow = useCallback((h) => {
    setMaxHours(h);
    try {
      localStorage.setItem(winKey, String(h));
      // 窗口变了，预热/入炉时刻随之变 → 允许重新提醒
      localStorage.removeItem(notifiedKey);
    } catch {}
  }, [winKey, notifiedKey]);

  /** 校正起算时间（"其实 1 小时前就放进冰箱了"）：deltaMin 为负表示提早 */
  const adjustStart = useCallback((deltaMin) => {
    setStartedAt((prev) => {
      if (!prev) return prev;
      const next = Math.min(Date.now(), prev + deltaMin * 60000);
      try {
        localStorage.setItem(key, String(next));
        localStorage.removeItem(notifiedKey);
      } catch {}
      return next;
    });
  }, [key, notifiedKey]);

  // ─── 到点提醒 + 标签页标题：纯 interval，不触发 React 渲染 ───
  useEffect(() => {
    if (!startedAt) return undefined;

    const targetMs = maxHours * 3600000;
    const minMs = minHours * 3600000;
    const bakeAt = startedAt + targetMs;
    const preheatAt = bakeAt - PREHEAT_MIN * 60000;

    const readFlags = () => {
      try { return JSON.parse(localStorage.getItem(notifiedKey)) || {}; } catch { return {}; }
    };
    const markFlag = (k) => {
      try {
        localStorage.setItem(notifiedKey, JSON.stringify({ ...readFlags(), [k]: true }));
      } catch {}
    };

    const check = () => {
      const now = Date.now();
      const elapsed = now - startedAt;
      const remaining = Math.max(0, targetMs - elapsed);
      const flags = readFlags();

      if (elapsed >= minMs && !flags.window) {
        markFlag('window');
        notify('进入可烤窗口 · In window', `冷藏已满 ${minHours} 小时，随时可以安排预热和烘烤。`);
      }
      if (now >= preheatAt && !flags.preheat) {
        markFlag('preheat');
        notify('该预热烤箱了 · Preheat', `${PREHEAT_MIN} 分钟后入炉，现在开始预热烤箱和铸铁锅至 230°C。`);
      }
      if (now >= bakeAt && !flags.bake) {
        markFlag('bake');
        notify('冷藏完成，可以入炉 · Bake now', '取出面团，割包后入炉。');
      }

      const hh = Math.floor(remaining / 3600000);
      const mm = Math.floor((remaining % 3600000) / 60000);
      const text = elapsed > targetMs
        ? '冷藏已超时'
        : elapsed >= minMs
          ? `可烘烤 · 剩 ${hh}:${String(mm).padStart(2, '0')}`
          : `冷藏中 ${hh}:${String(mm).padStart(2, '0')}`;
      setAppTitle(text);
    };

    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, [startedAt, maxHours, minHours, notifiedKey]);

  // 卸载时恢复标题
  useEffect(() => () => setAppTitle(null), []);

  return {
    stepId,
    startedAt,
    maxHours,
    minHours,
    start,
    clear,
    pickWindow,
    adjustStart,
  };
}

export default useColdRetard;
