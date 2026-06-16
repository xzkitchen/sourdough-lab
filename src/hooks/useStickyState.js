import { useState, useEffect } from 'react';

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
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded / private mode — silent */
    }
  }, [key, value]);

  // 直接把 React 的 setValue 返回出去 —— 天然支持 updater function
  return [value, setValue];
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
