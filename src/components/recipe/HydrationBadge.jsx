import React from 'react';
import { Droplet } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Pill } from '../primitives/index.js';

/**
 * HydrationBadge — 水合度徽记
 *
 * Props:
 *   value         actual hydration (0-1)
 *   base          base recipe hydration (0-1)
 */
export function HydrationBadge({ value, base, className }) {
  const delta = value - base;
  const pct = Math.round(value * 1000) / 10;
  const isElevated = delta > 0.03;
  const isHigh = delta > 0.08;

  const tone = isHigh ? 'warn' : isElevated ? 'accent' : 'neutral';

  return (
    <Pill
      tone={tone}
      size="md"
      icon={<Droplet size={12} strokeWidth={1.5} />}
      className={className}
    >
      <span className="tabular-nums">{pct}%</span>
      {delta !== 0 && (
        <span
          className={cn(
            'ml-1 text-[10px] tabular-nums',
            isHigh ? 'text-warn' : 'text-accent-ink opacity-70'
          )}
        >
          {delta > 0 ? '+' : ''}
          {Math.round(delta * 1000) / 10}
        </span>
      )}
    </Pill>
  );
}

export default HydrationBadge;
