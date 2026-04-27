import React from 'react';
import { MetaLine } from './MetaLine.jsx';

/**
 * ChapterHero — 每个 Tab 页的刊物式 hero
 *
 * 结构（桌面 3-6-3 栅格 / 移动：锚点 → 4 列 meta → 正文）：
 *   锚点（色球/进度环等，通过 `anchor` slot 传入）
 *   4 项 MetaLine
 *   Chapter 小字标签 + 巨型中文标题 + Latin 副标 + 描述段 + 可选 CTA
 *
 * Props:
 *   chapter          "Chapter I · Formula"
 *   title            "乡村酸种"          （大字中文）
 *   subtitle         "Country sourdough" （Fraunces italic 副标）
 *   description      段落正文
 *   meta             [{label, value, delta, big}]  —— 通常 4 项
 *   anchor           React node（色球、气泡球、进度环）—— 桌面右栏 / 移动顶部
 *   children         可选 CTA 按钮等
 */
export function ChapterHero({ chapter, title, subtitle, description, meta = [], anchor, children }) {
  return (
    <section className="grid grid-cols-12 gap-x-6 gap-y-8 pt-2">
      {/* 移动端：锚点置顶 */}
      {anchor && (
        <div className="col-span-12 md:hidden flex justify-center">
          {anchor}
        </div>
      )}

      {/* 左栏 meta */}
      <aside className="col-span-12 md:col-span-3 md:space-y-10">
        <div className="grid grid-cols-4 md:block gap-x-3 gap-y-5 md:space-y-5">
          {meta.map((m, i) => <MetaLine key={i} {...m} />)}
        </div>
      </aside>

      {/* 中栏 主文 */}
      <div className="col-span-12 md:col-span-6 md:order-2 space-y-5 md:space-y-6">
        <div className="space-y-3">
          {chapter && (
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">
              {chapter}
            </div>
          )}
          <h2
            className="font-display text-ink leading-[0.95] tracking-[-0.02em] break-words"
            style={{
              fontSize: 'clamp(44px, 9vw, 96px)',
              fontWeight: 400,
              fontVariationSettings: "'opsz' 96, 'SOFT' 60, 'wght' 380",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <div className="flex items-baseline gap-3 pt-1">
              <span className="h-px bg-ink/30 w-10" />
              <span
                className="font-display italic text-muted text-base sm:text-lg"
                style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}
              >
                {subtitle}
              </span>
            </div>
          )}
        </div>
        {description && (
          <p
            className="font-body text-[14px] sm:text-[15px] text-muted leading-[1.7] max-w-md"
            style={{ textWrap: 'pretty' }}
          >
            {description}
          </p>
        )}
        {children}
      </div>

      {/* 桌面右栏：锚点 */}
      {anchor && (
        <div className="hidden md:flex col-span-12 md:col-span-3 md:order-3 md:justify-end">
          {anchor}
        </div>
      )}
    </section>
  );
}

export default ChapterHero;
