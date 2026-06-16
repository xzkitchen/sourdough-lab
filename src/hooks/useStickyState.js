import { useState, useEffect, useRef } from 'react';

/**
 * Schema version
 * 每次 storage shape 变更（新增必需字段、key 改名、值域变更）时 +1。
 * mismatch 时走 migrate()，迁移失败则清空该 key 回默认值。
 */
const SCHEMA_VERSION = 2;
const VERSION_KEY = 'sdl_schema_version';

/**
 * useStickyState — 持久化到 localStorage 的 useState 替代。
 *
 * 用法完全等同于 useState：setter 支持 value 或 updater function。
 *
 *   const [count, setCount] = useStickyState(0, 'count');
 *   setCount(5);
 *   setCount(prev => prev + 1);
 *
 * 区别于 useState：
 *   - 初始值从 localStorage 读取
 *   - 每次 set 自动写回 localStorage
 *   - schema version 不匹配时走迁移或清空
 */
export function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      // schema 版本检查
      const rawVer = localStorage.getItem(VERSION_KEY);
      const storedVer = rawVer !== null ? Number(rawVer) : 1; // 无版本 = v1 老用户

      if (storedVer < SCHEMA_VERSION) {
        // 升级：清老 keys（v1 的 sl_* 结构差异太大，不做字段级迁移）
        migrateLegacyKeys(storedVer);
        localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
      }

      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const parsed = JSON.parse(raw);
      // shape 校验：解析成功但类型与默认值不符 → 回退默认值（C35）
      return isShapeCompatible(parsed, defaultValue) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // 默认值快照：用 ref 固定，避免 inline []/{} 默认值导致 storage 监听每次渲染重绑
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded / private mode — silent */
    }
  }, [key, value]);

  // 跨标签页同步：另一个 tab 写同 key 时更新本 tab 状态（C36）
  // 'storage' 事件只在“其他” tab 触发，不会响应自己的写入 → 无 write→event→write 回环
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== key) return;        // 只关心本 key
      if (e.newValue === null) return;  // key 被移除/清空 → 不动当前编辑，保守处理
      try {
        const incoming = JSON.parse(e.newValue);
        if (isShapeCompatible(incoming, defaultRef.current)) setValue(incoming);
      } catch {
        /* 忽略损坏的跨 tab 写入 */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  // 直接把 React 的 setValue 返回出去 —— 天然支持 updater function
  return [value, setValue];
}

/**
 * shape 校验：localStorage 解析成功但类型与默认值不符（数组↔对象、对象↔基元等）→ 回退默认值。
 * 默认值的类型即“期望形状”：[] 期望数组，{} 期望对象，'x'/0/false 期望同类基元，null 不约束。
 */
function isShapeCompatible(value, fallback) {
  if (fallback === null || fallback === undefined) return true; // 无形状约束
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (typeof fallback === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  return typeof value === typeof fallback; // primitive：string/number/boolean 一致
}

/**
 * v1 -> v2 迁移：旧项目所有 key 都以 `sl_` 开头（sl_bread_type / sl_num / sl_flavor …）。
 * v2 起 key 前缀统一改为 `sdl_`（sourdough-lab），并且 recipe 结构接入 Modifier 系统。
 * 迁移策略：暂不自动迁移数据结构（差别过大），清理老 keys 让用户从默认值重新开始。
 */
function migrateLegacyKeys(fromVer) {
  if (fromVer < 2) {
    const legacyPrefix = 'sl_';
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(legacyPrefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }
}
