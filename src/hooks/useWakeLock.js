import { useEffect, useRef } from 'react';

/**
 * useWakeLock — 在 Bake tab 阻止屏幕息屏
 *
 * 厨房场景：手沾着面，半小时不碰手机，屏幕会息屏，回头还要解锁找步骤。
 * Screen Wake Lock API 在用户停留 Bake tab 时保持常亮；切走/隐藏自动释放。
 * 不支持（iOS 16.3 以下 Safari 等）时静默降级。
 *
 * @param {boolean} active 是否需要常亮（如 tab === 'bake'）
 */
export function useWakeLock(active) {
  const lockRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return undefined;

    let released = false;

    const acquire = async () => {
      try {
        lockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        /* 用户拒绝 / 低电量 / 不支持 — 静默 */
      }
    };

    // 页面从后台回前台时重新申请（系统会在隐藏时自动释放锁）
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !released) acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, [active]);
}

export default useWakeLock;
