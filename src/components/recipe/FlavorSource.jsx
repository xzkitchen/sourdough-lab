import React from 'react';

/**
 * FlavorSource — Formula tab 底部 source footer
 *
 * 显示当前 flavor 的来源（master 烘焙书 / 官方 URL / 成名博客）+ 中文 note。
 *
 * 古书 colophon（版权页）风：
 *   - 上方双线
 *   - "SOURCE · 出处" 小标
 *   - 来源名 + 作者（如有）
 *   - URL（可点）
 *   - 中文 note（小字、italic 模拟手写注解）
 *
 * Props:
 *   flavor   FLAVORS 中一项
 */
export function FlavorSource({ flavor }) {
  if (!flavor || !flavor.source) return null;
  const { name, author, url } = flavor.source;

  return (
    <div className="border-t-2 border-b-2 border-ink py-3">
      <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1.5">
        Source · 出处
      </div>
      <div className="font-display text-base text-ink leading-tight">
        {name}
      </div>
      {author && (
        <div className="font-serif italic text-sm text-muted mt-0.5">
          — {author}
        </div>
      )}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-2xs text-accent-ink uppercase tracking-[0.18em] mt-2 inline-block hover:text-accent transition-colors duration-fast"
        >
          ↗ visit
        </a>
      )}
      {flavor.note && (
        <p className="font-zh text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-line-soft">
          {flavor.note}
        </p>
      )}
    </div>
  );
}

export default FlavorSource;
