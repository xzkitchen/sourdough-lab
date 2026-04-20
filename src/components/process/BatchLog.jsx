import React, { useState } from 'react';
import { Check, Archive, Trash2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, Button } from '../primitives/index.js';
import { SectionHeader } from '../recipe/index.js';

/**
 * BatchLog —— 批次历史 + 完成后保存入口
 *
 * Props:
 *   batches               Array<{id, savedAt, flavorName, numUnits, hydration, rating, note}>
 *   onSave(batch)         保存新批次
 *   onDelete(id)          删除某条
 *   canSave               是否"所有步骤完成"（触发保存提示）
 *   currentBatchDraft     { flavorName, numUnits, hydration, roomTempC, coldDuration }
 */
export function BatchLog({ batches = [], onSave, onDelete, canSave, currentBatchDraft, className }) {
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave({
      id: `batch-${Date.now()}`,
      savedAt: new Date().toISOString(),
      ...currentBatchDraft,
      rating,
      note: note.trim(),
    });
    setSaving(false);
    setRating(4);
    setNote('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 完成后保存入口 */}
      {canSave && !saving && (
        <Card variant="surface" padding="md" className="border-accent space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent-ink font-body">
            <Check size={12} strokeWidth={1.5} />
            <span>本次烘烤完成 · Bake complete</span>
          </div>
          <p className="text-sm text-ink font-body">
            保存这次批次？方便以后对比调整。
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setSaving(true)}>
              保存批次
            </Button>
            <Button variant="text" size="sm" onClick={() => { /* noop = skip save */ }}>
              跳过
            </Button>
          </div>
        </Card>
      )}

      {/* 保存表单 */}
      {saving && (
        <Card variant="surface" padding="md" className="space-y-4">
          <SectionHeader title="保存批次" latin="Save Batch" />

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-body">
              评分
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={cn(
                    'w-8 h-8 rounded-sm border font-mono text-sm transition-colors ease-editorial duration-fast',
                    n <= rating
                      ? 'bg-accent border-accent text-white'
                      : 'border-line text-muted hover:border-accent-line'
                  )}
                  aria-label={`${n} 星`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-body">
              备注
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="气孔 / 酸度 / 外壳 / 下次要调整的地方…"
              rows={3}
              className="w-full px-3 py-2 rounded-sm border border-line bg-surface text-ink font-body text-sm resize-none focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="text" size="sm" onClick={() => setSaving(false)}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              保存
            </Button>
          </div>
        </Card>
      )}

      {/* 历史列表 */}
      {batches.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="批次历史"
            latin="Bake Log"
            right={
              <span className="text-[11px] text-faint font-mono tabular-nums">
                {batches.length} 批
              </span>
            }
          />
          <ul className="space-y-2.5">
            {batches
              .slice()
              .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
              .slice(0, 10)
              .map((b) => (
                <BatchRow key={b.id} batch={b} onDelete={onDelete} />
              ))}
          </ul>
        </section>
      )}

      {batches.length === 0 && !canSave && !saving && (
        <div className="flex items-start gap-2.5 px-3 py-3 rounded-md bg-sunken border border-line-soft">
          <Archive
            size={12}
            strokeWidth={1.5}
            className="text-muted shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="text-xs text-muted font-body leading-relaxed">
            完成一次烘烤后可保存批次，形成你自己的配方实测数据库。
          </p>
        </div>
      )}
    </div>
  );
}

function BatchRow({ batch, onDelete }) {
  const date = new Date(batch.savedAt);
  const dateStr = date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <li className="flex items-start gap-3 px-4 py-3 rounded-md bg-surface border border-line-soft">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-body text-sm text-ink">{batch.flavorName}</span>
          <span className="text-[10px] font-mono text-faint tabular-nums">{dateStr}</span>
        </div>
        <div className="flex items-baseline gap-3 text-[11px] text-muted font-body">
          <span>{batch.numUnits} 条</span>
          <span className="text-faint">·</span>
          <span className="tabular-nums">{Math.round(batch.hydration * 100)}%</span>
          {batch.rating && (
            <>
              <span className="text-faint">·</span>
              <span className="text-accent-ink">{'★'.repeat(batch.rating)}{'☆'.repeat(5 - batch.rating)}</span>
            </>
          )}
        </div>
        {batch.note && (
          <p className="text-xs text-muted font-body leading-relaxed mt-1">
            {batch.note}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => { if (window.confirm('删除此批次记录？')) onDelete(batch.id); }}
        aria-label="删除"
        className="text-faint hover:text-warn shrink-0 transition-colors"
      >
        <Trash2 size={12} strokeWidth={1.5} />
      </button>
    </li>
  );
}

export default BatchLog;
