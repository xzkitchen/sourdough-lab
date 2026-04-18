import React, { useState } from 'react';
import { Clock, Snowflake, Flame, ChefHat, X, Thermometer } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, Button, Slider } from '../primitives/index.js';

/**
 * ScheduleHeader —— 目标出炉时间 + 时间轴关键节点
 *
 * Props:
 *   targetBakeTime  ISO 字符串 | null
 *   onSetTarget(iso)
 *   schedule        calculateSchedule() 返回对象 | null
 */
export function ScheduleHeader({
  targetBakeTime,
  onSetTarget,
  schedule,
  roomTempC,
  onRoomTempChange,
  className,
}) {
  const [editing, setEditing] = useState(!targetBakeTime);

  const handleSubmit = (e) => {
    const v = e.target.value;
    if (v) {
      onSetTarget(new Date(v).toISOString());
      setEditing(false);
    }
  };

  const clear = () => {
    onSetTarget(null);
    setEditing(true);
  };

  // datetime-local 需要 local-time 字符串 "yyyy-MM-ddTHH:mm"
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 默认建议时间：明天下午 3 点
  const defaultSuggestion = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(15, 0, 0, 0);
    return toLocalInput(d.toISOString());
  };

  if (!targetBakeTime || editing) {
    return (
      <Card variant="surface" padding="md" className={cn('space-y-3 overflow-hidden', className)}>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint font-body">
          <Clock size={12} strokeWidth={1.5} />
          <span>Schedule · 目标出炉</span>
        </div>
        <p className="text-xs text-muted font-body leading-relaxed">
          输入想要出炉的时间，自动反推每一步的起始时刻。
        </p>
        <input
          type="datetime-local"
          defaultValue={toLocalInput(targetBakeTime) || defaultSuggestion()}
          onChange={handleSubmit}
          className="block h-11 px-3 rounded-sm border border-line bg-surface text-ink font-body tabular-nums"
          style={{
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
            boxSizing: 'border-box',
            fontSize: '16px',   // 防 iOS auto-zoom
            colorScheme: 'light',
          }}
        />
        {targetBakeTime && (
          <Button variant="text" size="sm" onClick={() => setEditing(false)}>
            取消编辑
          </Button>
        )}
      </Card>
    );
  }

  if (!schedule) return null;

  const { feedStart, coldStart, preheatTime, bakeEnd } = schedule;

  return (
    <Card variant="surface" padding="md" className={cn('space-y-4', className)}>
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint font-body">
          <Clock size={12} strokeWidth={1.5} />
          <span>Schedule · 时间表</span>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[11px] text-muted hover:text-ink font-body transition-colors"
        >
          编辑
        </button>
      </div>

      <div className="space-y-3">
        <Timeline
          icon={<ChefHat size={12} strokeWidth={1.5} />}
          label="开始喂种"
          time={feedStart}
        />
        {coldStart && (
          <Timeline
            icon={<Snowflake size={12} strokeWidth={1.5} />}
            label="放入冰箱"
            time={coldStart}
          />
        )}
        {preheatTime && (
          <Timeline
            icon={<Flame size={12} strokeWidth={1.5} />}
            label="预热烤箱"
            time={preheatTime}
            emphasis
          />
        )}
        <Timeline
          icon={<ChefHat size={12} strokeWidth={1.5} className="text-accent-ink" />}
          label="面包出炉"
          time={bakeEnd}
          highlight
        />
      </div>

      {/* 室温补偿 */}
      {typeof roomTempC === 'number' && onRoomTempChange && (
        <div className="pt-3 border-t border-line-soft">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint font-body mb-2">
            <Thermometer size={11} strokeWidth={1.5} />
            <span>厨房室温 · Room temp</span>
          </div>
          <Slider
            value={roomTempC}
            onChange={onRoomTempChange}
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
          <p className="text-[10px] text-faint font-body leading-relaxed mt-2">
            {roomTempC < 22
              ? '较冷：发酵时长自动延长'
              : roomTempC > 28
                ? '偏热：发酵时长自动缩短'
                : '标准室温'}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={clear}
        className="w-full text-[11px] text-faint hover:text-muted font-body flex items-center justify-center gap-1 transition-colors"
      >
        <X size={10} strokeWidth={1.5} />
        清除时间表
      </button>
    </Card>
  );
}

function Timeline({ icon, label, time, emphasis, highlight }) {
  const now = new Date();
  const isSame = isSameDay(time, now);
  const isTomorrow = isNextDay(time, now);
  const isYesterday = isPrevDay(time, now);
  const dayLabel = isSame ? '今日' : isTomorrow ? '明日' : isYesterday ? '昨日' : formatDate(time);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-1',
        highlight && 'pt-2 border-t border-line-soft'
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-muted">{icon}</span>
        <span
          className={cn(
            'font-body text-sm',
            highlight ? 'text-accent-ink font-medium' : emphasis ? 'text-ink' : 'text-muted'
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-mono tabular-nums',
            highlight ? 'text-xl text-ink' : 'text-base text-ink'
          )}
        >
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-faint font-body w-8 text-right">{dayLabel}</span>
      </div>
    </div>
  );
}

function formatTime(d) {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(d) {
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isNextDay(a, b) {
  const next = new Date(b);
  next.setDate(next.getDate() + 1);
  return isSameDay(a, next);
}

function isPrevDay(a, b) {
  const prev = new Date(b);
  prev.setDate(prev.getDate() - 1);
  return isSameDay(a, prev);
}

export default ScheduleHeader;
