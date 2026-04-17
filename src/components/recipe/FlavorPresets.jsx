import React, { useState } from 'react';
import { cn } from '../../lib/cn.js';
import { predictBreadColor } from '../../domain/breadColor.js';
import { buildGradientBackground } from '../../design/gradient.js';

/**
 * FlavorPresets — 创意预设网格
 *
 * 3 列网格，每单元：色球 + 中文名字 + 小 Latin。
 * 默认显示前 6 个，"更多 N" 按钮展开剩余。
 */
export function FlavorPresets({ base, flavors, selected, onApply, className }) {
  const [expanded, setExpanded] = useState(false);

  const activeFlavorId = flavors.find((f) => {
    if (f.modifiers.length !== selected.length) return false;
    return f.modifiers.every((m) => {
      const sel = selected.find((s) => s.id === m.id);
      if (!sel) return false;
      return Math.abs((sel.dose ?? 0) - (m.dose ?? 0)) < 0.0001 || sel.dose === undefined;
    });
  })?.id;

  const initialCount = 6;
  const visible = expanded ? flavors : flavors.slice(0, initialCount);
  const hiddenCount = flavors.length - visible.length;

  return (
    <section className={cn('space-y-3', className)}>
      <GrainFilter />

      <SectionHeader
        title="创意预设"
        latin="Chef's picks"
        right={
          hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[11px] text-muted hover:text-ink font-body transition-colors"
            >
              更多 {hiddenCount}
            </button>
          ) : expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-[11px] text-muted hover:text-ink font-body transition-colors"
            >
              收起
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-3 gap-3">
        {visible.map((f) => {
          const active = f.id === activeFlavorId;
          const prediction = predictBreadColor(base, f.modifiers);
          const gradientBg = buildGradientBackground(prediction, f.modifiers);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onApply(f)}
              aria-pressed={active}
              className={cn(
                'group flex flex-col items-center gap-2 py-3 rounded-md transition-colors ease-editorial duration-fast',
                active ? 'bg-surface' : 'hover:bg-surface/60'
              )}
            >
              <ColorOrb background={gradientBg} size={60} active={active} />
              <div className="text-center leading-tight px-1">
                <div
                  className={cn(
                    'font-body text-xs',
                    active ? 'text-accent-ink font-medium' : 'text-ink'
                  )}
                >
                  {f.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Section header — 极简双语 */
export function SectionHeader({ title, latin, right }) {
  return (
    <div className="flex items-baseline justify-between px-0.5">
      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-[15px] text-ink tracking-tight">
          {title}
        </span>
        {latin && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-faint font-body">
            {latin}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

/** ColorOrb — 色球 */
function ColorOrb({ background, size, active }) {
  return (
    <div
      className={cn(
        'relative transition-transform ease-editorial duration-base',
        active && 'scale-[1.04]'
      )}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full" style={{ background }} />
      <svg
        className="absolute inset-0 w-full h-full rounded-full mix-blend-overlay pointer-events-none"
        style={{ opacity: 0.5 }}
        aria-hidden
      >
        <rect width="100%" height="100%" filter="url(#orbGrain)" fill="#fff" />
      </svg>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: active
            ? 'inset 0 0 0 1.5px #B08968, 0 2px 8px rgba(176,137,104,0.18)'
            : 'inset 0 0 0 0.5px rgba(26,24,21,0.06)',
        }}
      />
    </div>
  );
}

function GrainFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id="orbGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="9" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1.6 -0.5"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

export default FlavorPresets;
