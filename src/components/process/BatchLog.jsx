import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button, SmallCaps, LedgerRule } from '../primitives/index.js';
import { MemoBlock } from '../editorial/MemoBlock.jsx';

/**
 * BatchLog —— Ledger V2 扁平化批次记录
 *
 * 去掉 Card 包装，全部用 hairline 盒子；保存表单 + 历史表沿用原逻辑。
 */
export function BatchLog({
  batches = [],
  onSave,
  onDelete,
  canSave,
  currentBatchDraft,
  className,
}) {
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
    <div className={cn('space-y-5', className)}>
      {/* 完成后保存入口 */}
      {canSave && !saving && (
        <MemoBlock tone="warn" label="Bake Complete · 烘烤完成">
          <p>保存这次批次？方便以后对比调整。</p>
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" onClick={() => setSaving(true)}>
              保存批次
            </Button>
            <Button variant="text" size="sm" onClick={() => {}}>
              跳过
            </Button>
          </div>
        </MemoBlock>
      )}

      {/* 保存表单（hairline 扁平） */}
      {saving && (
        <div className="border border-line p-5 space-y-4">
          <SmallCaps tone="ink">Save Batch · 保存批次</SmallCaps>

          <div className="space-y-2">
            <SmallCaps tone="muted">Rating 评分</SmallCaps>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={cn(
                    'w-9 h-9 border font-mono text-sm transition-colors ease-editorial duration-fast',
                    n <= rating
                      ? 'bg-ink border-ink text-surface'
                      : 'border-line text-muted hover:border-ink'
                  )}
                  aria-label={`${n} 星`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <SmallCaps tone="muted">Note 备注</SmallCaps>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="气孔 / 酸度 / 外壳 / 下次要调整的地方…"
              rows={3}
              className="w-full px-3 py-2 border border-line bg-surface text-ink font-body text-sm resize-none focus:outline-none focus:border-ink"
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
        </div>
      )}

      {/* 历史 ledger 表 */}
      {batches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <SmallCaps tone="faint">Bake Log</SmallCaps>
              <span className="font-body text-[11px] text-faint">批次历史</span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-faint">
              {batches.length} 批
            </span>
          </div>

          <LedgerRule />

          {/* Table header */}
          <div
            className="grid items-baseline pb-2 border-b border-line"
            style={{ gridTemplateColumns: '64px 1fr auto auto' }}
          >
            <SmallCaps tone="faint">Date</SmallCaps>
            <SmallCaps tone="faint">Flavor</SmallCaps>
            <SmallCaps tone="faint" className="text-right pr-4">Loaves</SmallCaps>
            <SmallCaps tone="faint" className="text-right">Rating</SmallCaps>
          </div>

          <ul>
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
        <MemoBlock tone="muted" label="Archive · 批次档案">
          <p className="text-xs text-muted">
            完成一次烘烤后可保存批次，形成你自己的配方实测数据库。
          </p>
        </MemoBlock>
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
    <li
      className="grid items-baseline py-3 border-b border-dotted border-line-soft"
      style={{ gridTemplateColumns: '64px 1fr auto auto' }}
    >
      <span className="font-mono text-[11px] tabular-nums text-faint">
        {dateStr}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
        <span className="font-body text-sm text-ink truncate">{batch.flavorName}</span>
        {batch.note && (
          <span className="text-[11px] text-muted font-body truncate">{batch.note}</span>
        )}
      </div>
      <span className="font-mono text-[12px] tabular-nums text-ink pr-4">
        {batch.numUnits}
        <span className="text-[10px] text-faint ml-0.5">条</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tabular-nums text-warn">
          {batch.rating ? '★'.repeat(batch.rating) : '—'}
        </span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('删除此批次记录？')) onDelete(batch.id);
          }}
          aria-label="删除"
          className="text-faint hover:text-warn shrink-0 transition-colors"
        >
          <Trash2 size={12} strokeWidth={1.5} />
        </button>
      </div>
    </li>
  );
}

export default BatchLog;
