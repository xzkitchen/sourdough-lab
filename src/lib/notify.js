/**
 * notify — 轻量通知工具
 *
 * 纯 PWA 场景：没有推送服务器，Notification 只在页面存活时触发
 * （计时 setInterval 跑在页面里）。权限被拒/不支持时静默降级，
 * 调用方应同时提供页面内的可见状态。
 */

const DEFAULT_TITLE = typeof document !== 'undefined' ? document.title : 'Bakery Ledger';

/** 请求通知权限（仅在用户主动启动计时时调用，不在加载时骚扰） */
export function ensureNotifyPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('unsupported');
  }
  if (Notification.permission === 'default') {
    try {
      return Notification.requestPermission();
    } catch {
      return Promise.resolve('denied');
    }
  }
  return Promise.resolve(Notification.permission);
}

/** 发送通知；权限不足时返回 null（调用方靠页面内状态兜底） */
export function notify(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, { body, icon: '/icon-192.png' });
    }
  } catch {
    /* iOS 非 standalone 等场景构造会 throw — 静默 */
  }
  return null;
}

/** 改写标签页标题（text 为空时恢复默认） */
export function setAppTitle(text) {
  if (typeof document === 'undefined') return;
  document.title = text ? `${text} — Bakery Ledger` : DEFAULT_TITLE;
}
