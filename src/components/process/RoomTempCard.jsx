import React from 'react';
import { Thermometer } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, Slider } from '../primitives/index.js';

/**
 * RoomTempCard —— 厨房室温滑杆
 *
 * 18–32°C，每差 1°C 调整 ~5% 发酵时长。
 * 实际调整在 calculator.adjustStepsForTemp() 里生效。
 */
export function RoomTempCard({ roomTempC, onChange, className }) {
  const hint =
    roomTempC < 22
      ? '较冷：发酵时长自动延长'
      : roomTempC > 28
        ? '偏热：发酵时长自动缩短'
        : '标准室温';

  return (
    <Card variant="surface" padding="md" className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint font-body">
        <Thermometer size={12} strokeWidth={1.5} />
        <span>厨房室温 · Room temp</span>
      </div>
      <Slider
        value={roomTempC}
        onChange={onChange}
        min={18}
        max={32}
        step={1}
        format={(v) => `${v}°C`}
        marks={[
          { value: 18, label: '18' },
          { value: 24, label: '24' },
          { value: 28, label: '28' },
          { value: 32, label: '32' },
        ]}
        snap
      />
      <p className="text-[11px] text-faint font-body">{hint}</p>
    </Card>
  );
}

export default RoomTempCard;
