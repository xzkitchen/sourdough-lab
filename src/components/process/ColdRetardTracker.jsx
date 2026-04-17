import React from 'react';
import { Snowflake, Flame, Clock, Undo2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, Button, Slider, Divider } from '../primitives/index.js';

/**
 * ColdRetardTracker — 冷发酵时间追踪
 *
 * 关键改进：
 *   - 滑杆 8-24h（带 12/14/16/18/20 刻度），替代旧的两档按钮
 *   - 记录放入时间 → 自动算预热 + 开烤时间
 *
 * Props:
 *   savedTime      ISO string or null
 *   savedDuration  hours (8-24)
 *   onSetTime()    现在放入冰箱
 *   onSetDuration(h)
 *   onReset()      清除时间
 */
export function ColdRetardTracker({
  savedTime,
  savedDuration,
  onSetTime,
  onSetDuration,
  onReset,
  className,
}) {
  const duration = savedDuration || 16;

  if (!savedTime) {
    return (
      <Card variant="sunken" padding="lg" className={cn('text-center', className)}>
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint font-body mb-3">
          <Snowflake size={11} strokeWidth={1.5} />
          <span>Cold Retard</span>
        </div>
        <p className="text-sm text-muted font-body mb-5">
          所有面团已放入冰箱？点击记录时间，我帮你算预热和开烤点
        </p>
        <Button
          variant="primary"
          size="md"
          icon={<Snowflake size={14} strokeWidth={1.5} />}
          onClick={onSetTime}
        >
          记录放入时间
        </Button>
      </Card>
    );
  }

  const startTime = new Date(savedTime);
  const preheatTime = new Date(startTime.getTime() + (duration - 1) * 60 * 60 * 1000);
  const bakeTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  return (
    <Card variant="sunken" padding="lg" className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent-ink font-body">
          <Snowflake size={11} strokeWidth={1.5} />
          <span>智能时间表</span>
        </div>
        <span className="text-[10px] text-faint font-mono tabular-nums">
          {startTime.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
        </span>
      </div>

      {/* Row: 放入时间 */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted font-body">放入冰箱</span>
        <span className="font-mono text-lg tabular-nums text-ink">
          {startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <Divider variant="dashed" tone="soft" />

      {/* 时长滑杆 */}
      <Slider
        label="目标发酵时长"
        value={duration}
        onChange={onSetDuration}
        min={8}
        max={24}
        step={1}
        format={(v) => `${v} 小时`}
        marks={[
          { value: 8,  label: '8' },
          { value: 12, label: '12' },
          { value: 14, label: '14' },
          { value: 16, label: '16' },
          { value: 20, label: '20' },
          { value: 24, label: '24' },
        ]}
        snap
      />

      <Divider variant="dashed" tone="soft" />

      {/* 预热与开烤时间 */}
      <div className="space-y-3">
        <TimeRow
          icon={<Flame size={14} strokeWidth={1.5} className="text-accent-ink" />}
          label="建议预热"
          hint={`满 ${duration}h 前 1 小时`}
          time={preheatTime}
          startDate={startTime}
          emphasis
        />
        <TimeRow
          icon={<Clock size={14} strokeWidth={1.5} className="text-muted" />}
          label="最佳开烤"
          hint={`满 ${duration}h`}
          time={bakeTime}
          startDate={startTime}
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 h-10 text-xs text-muted hover:text-ink border border-line hover:border-accent-line rounded-sm transition-colors ease-editorial duration-fast"
      >
        <Undo2 size={12} strokeWidth={1.5} />
        撤销 / 重新记录
      </button>
    </Card>
  );
}

function TimeRow({ icon, label, hint, time, startDate, emphasis }) {
  const isTomorrow = time.getDate() !== startDate.getDate();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span>{icon}</span>
        <div>
          <div className={cn('text-sm font-body', emphasis ? 'text-ink font-medium' : 'text-muted')}>
            {label}
          </div>
          <div className="text-[10px] text-faint font-body">{hint}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn(
          'font-mono tabular-nums',
          emphasis ? 'text-2xl text-ink' : 'text-base text-ink'
        )}>
          {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-[10px] text-faint font-body">
          {isTomorrow ? '次日' : '今日'}
        </div>
      </div>
    </div>
  );
}

export default ColdRetardTracker;
