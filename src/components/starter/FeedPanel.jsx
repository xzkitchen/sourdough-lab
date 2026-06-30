import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SecHead } from '../ledger/index.js';
import { DISCARD_RECIPES } from '../../domain/discard-recipes.js';
import { planRevival, planTimedFeed } from '../../domain/feeding.js';
import { STARTER_STATES } from '../../domain/starter-states.js';
import { useStickyState } from '../../hooks/useStickyState.js';

/**
 * Stepper — 大号 ± 步进器（编辑器风：1px 实线 + 大号数字）
 *
 * 交互：
 *   - 点 ± 走一步（step）
 *   - 长按 ± 连续递增并加速（400ms 后开始，间隔 150→50ms 收紧）
 *   - 中间数字可点击直接输入跳到任意值（聚焦即全选，回车/失焦提交，按 min/max clamp）
 *   - 键盘：按钮聚焦后 Enter / Space 走一步
 */
function Stepper({ value, onChange, step = 1, min = 1, max, suffix, labelEn, labelZh, ariaLabel }) {
  const clamp = useCallback(
    (v) => {
      let n = v;
      if (typeof min === 'number') n = Math.max(min, n);
      if (typeof max === 'number') n = Math.min(max, n);
      return n;
    },
    [min, max]
  );

  // ref 跟踪最新值：避免长按定时器闭包里的 stale value；乐观更新让连击稳定累加
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const bump = useCallback(
    (dir) => {
      const next = clamp(valueRef.current + dir * step);
      valueRef.current = next;
      onChange(next);
    },
    [clamp, step, onChange]
  );

  // 长按连续递增（加速）
  const holdRef = useRef(null);
  const heldRef = useRef(false);
  const ticksRef = useRef(0);
  const stopHold = useCallback(() => {
    heldRef.current = false;
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    ticksRef.current = 0;
  }, []);
  const startHold = useCallback(
    (dir) => {
      heldRef.current = true;
      bump(dir); // 立即走一步（也覆盖单击 / 单触）
      ticksRef.current = 0;
      const tick = () => {
        if (!heldRef.current) return; // 松开后即便有残留定时器也不再 bump
        bump(dir);
        ticksRef.current += 1;
        const delay = Math.max(50, 150 - ticksRef.current * 12);
        holdRef.current = setTimeout(tick, delay);
      };
      holdRef.current = setTimeout(tick, 400); // 先停顿 400ms 再连发
    },
    [bump]
  );
  useEffect(() => stopHold, [stopHold]); // 卸载时清定时器

  // 中间数字直接编辑
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const onInputChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setDraft(raw);
    if (raw !== '') onChange(clamp(parseInt(raw, 10)));
  };
  const onInputBlur = () => {
    const parsed = parseInt(draft, 10);
    onChange(Number.isFinite(parsed) ? clamp(parsed) : min);
    setEditing(false);
  };

  const btnBase =
    'font-display text-2xl text-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[48px] select-none touch-none';
  const holdProps = (dir) => ({
    type: 'button',
    onPointerDown: () => startHold(dir),
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bump(dir);
      }
    },
  });

  const shown = editing ? draft : String(value);

  return (
    <div
      className="grid border border-ink bg-surface grid-cols-[48px_1fr_48px] sm:grid-cols-[56px_1fr_56px]"
      role="group"
      aria-label={ariaLabel}
    >
      <button {...holdProps(-1)} aria-label="decrease" className={`${btnBase} border-r border-ink`}>
        −
      </button>
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
        <div
          className="font-display font-medium text-3xl sm:text-4xl text-ink leading-none tabular-nums flex items-baseline min-w-0"
          style={{ letterSpacing: '-0.04em' }}
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={ariaLabel}
            value={shown}
            onFocus={(e) => {
              setEditing(true);
              setDraft(String(value));
              e.target.select();
            }}
            onChange={onInputChange}
            onBlur={onInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            className="bg-transparent outline-none border-0 p-0 m-0 font-display font-medium text-3xl sm:text-4xl text-ink tabular-nums caret-accent"
            style={{ width: `${Math.max(1, shown.length)}ch`, letterSpacing: '-0.04em' }}
          />
          {suffix && (
            <span className="font-mono text-sm sm:text-base text-faint ml-1 sm:ml-1.5">{suffix}</span>
          )}
        </div>
        <div className="text-right min-w-0">
          {labelEn && (
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] sm:tracking-[0.24em] truncate">
              {labelEn}
            </div>
          )}
          {labelZh && (
            <div className="font-zh text-xs text-muted mt-0.5 truncate">{labelZh}</div>
          )}
        </div>
      </div>
      <button {...holdProps(1)} aria-label="increase" className={`${btnBase} border-l border-ink`}>
        +
      </button>
    </div>
  );
}

/** 模式切换分段控件（喂养 / 复活） */
function ModeToggle({ revivalMode, onChange }) {
  const btn = (active) => [
    'font-mono text-2xs uppercase tracking-[0.18em] px-2 py-1 transition-colors duration-fast leading-none whitespace-nowrap',
    active ? 'bg-ink text-bg cursor-default' : 'bg-bg text-muted hover:bg-sunken active:bg-sunken cursor-pointer',
  ].join(' ');
  return (
    <div className="flex border border-ink">
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!revivalMode}
        className={btn(!revivalMode)}
      >
        Feed
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={revivalMode}
        className={`${btn(revivalMode)} border-l border-ink`}
      >
        Revive
      </button>
    </div>
  );
}

const SEED_BUFFER_G = 20; // 喂养后留作下次种
const MAINTAIN_TARGET_G = 60; // 「只维持」时的目标小种总量

function windowHoursFromTimes(feedTime, targetTime) {
  const parseClock = (value) => {
    if (typeof value !== 'string') return null;
    const parts = value.split(':');
    if (parts.length !== 2) return null;
    const [h, m] = parts.map(Number);
    if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return { h, m };
  };
  const feedClock = parseClock(feedTime);
  const targetClock = parseClock(targetTime);
  if (!feedClock || !targetClock) return null;

  let mins = targetClock.h * 60 + targetClock.m - (feedClock.h * 60 + feedClock.m);
  if (mins <= 0) mins += 24 * 60; // 跨午夜
  return mins / 60;
}

/** 结果三栏卡（取 / 加粉 / 加水）*/
function FeedCards({ items }) {
  return (
    <div
      className="grid border border-ink"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((x, i) => (
        <div key={x.label} className={`p-3 sm:p-4 bg-surface ${i > 0 ? 'border-l border-ink' : ''}`}>
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em]">{x.label}</div>
          <div className="font-zh text-xs text-muted">{x.zh}</div>
          <div
            className="font-display font-medium text-3xl sm:text-4xl text-ink leading-none mt-2 tabular-nums"
            style={{ letterSpacing: '-0.03em' }}
          >
            {x.v}
            <span className="font-mono text-sm text-faint ml-1">g</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 定时喂养 —— 按「几点喂 / 几点要 / 目标」算 取/加/弃 + 达峰 */
function TimedFeed({ feed, seedStarter, roomTempC = 24 }) {
  const [feedTime, setFeedTime] = useStickyState('22:00', 'sdlv2_feed_time');
  const [targetTime, setTargetTime] = useStickyState('06:00', 'sdlv2_target_time');
  const [maintainOnly, setMaintainOnly] = useStickyState(false, 'sdlv2_maintain_only');

  const windowHours = windowHoursFromTimes(feedTime, targetTime);
  const targetRipe = maintainOnly ? MAINTAIN_TARGET_G : feed.needed + SEED_BUFFER_G;
  const plan = planTimedFeed({ targetRipe, windowHours, roomTempC, availableGrams: seedStarter });
  const windowLabel = plan.timing.inputValid ? `${plan.timing.targetWindowHours}h` : '—';
  const targetLabel = targetTime || '—';
  const b = (v) => <strong className="font-mono text-ink font-semibold">{v}</strong>;

  return (
    <div className="space-y-4">
      {/* 几点喂 / 几点要 */}
      <div className="flex gap-3">
        <label className="flex-1 block">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em]">Feed at</div>
          <div className="font-zh text-xs text-muted mb-1">几点喂</div>
          <input
            type="time"
            value={feedTime}
            onChange={(e) => setFeedTime(e.target.value)}
            className="w-full bg-sunken border border-ink px-3 py-2 font-mono text-lg text-ink tabular-nums outline-none"
          />
        </label>
        <label className="flex-1 block">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em]">Ready by</div>
          <div className="font-zh text-xs text-muted mb-1">几点要</div>
          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full bg-sunken border border-ink px-3 py-2 font-mono text-lg text-ink tabular-nums outline-none"
          />
        </label>
      </div>

      {/* 只维持开关 */}
      <button
        type="button"
        onClick={() => setMaintainOnly(!maintainOnly)}
        aria-pressed={maintainOnly}
        className={`w-full flex items-center justify-between px-3 py-2 border border-ink transition-colors duration-fast cursor-pointer ${
          maintainOnly ? 'bg-ink text-bg' : 'bg-bg text-muted hover:bg-sunken active:bg-sunken'
        }`}
      >
        <span className="font-zh text-sm">只维持（不烤，养小种）</span>
        <span className="font-mono text-2xs uppercase tracking-[0.20em]">{maintainOnly ? 'ON' : 'OFF'}</span>
      </button>

      {/* 窗口 → 比例 + 达峰 */}
      <div className="flex items-baseline justify-between border-y border-line-soft py-2">
        <div className="font-zh text-sm text-muted">
          窗口 {b(windowLabel)} → 比例 {b(`1:${plan.ratio}:${plan.ratio}`)}
        </div>
        <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em]">
          ~{plan.expectedPeakHours}h peak
        </div>
      </div>

      {/* 取 / 加粉 / 加水 */}
      <FeedCards
        items={[
          { label: 'Keep', zh: '取旧种', v: plan.carryover },
          { label: 'Add flour', zh: '加 T65', v: plan.flour },
          { label: 'Add water', zh: '加 水', v: plan.water },
        ]}
      />

      <div className="px-3 py-2 border border-line-soft bg-bg">
        <p className="font-zh text-sm text-muted leading-relaxed">
          罐里现有旧种 {b(`${seedStarter}g`)}，本次只取 {b(`${plan.carryover}g`)} 做新种。
          {plan.discard > 0 ? <> 多出的 {b(`${plan.discard}g`)} 才是弃种。</> : ' 没有多余弃种。'}
        </p>
      </div>

      {/* domain 防呆：提前塌陷 / 达峰偏晚 / 旧种不足 */}
      {plan.warnings.length > 0 && (
        <div className="space-y-2">
          {plan.warnings.map((warning) => (
            <div key={warning} className="px-3 py-2 bg-warn-bg border border-line-soft">
              <p className="font-zh text-sm text-accent-ink leading-relaxed">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Memo */}
      <div className="px-4 py-3 bg-surface border border-line-soft border-l-[3px] border-l-accent">
        <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.30em] mb-1">Memo · 操作</div>
        <p className="font-zh text-sm text-muted leading-relaxed">
          {feedTime} 取 {b(`${plan.carryover}g`)} 旧种 + 加 {b(`${plan.flour}g`)} 粉 + {b(`${plan.water}g`)} 水
          （共 {plan.totalRipe}g，1:{plan.ratio}:{plan.ratio}），保温 ~{roomTempC}°C。目标 {targetLabel}，
          预计约 {plan.expectedPeakHours}h 达峰。
          {maintainOnly ? (
            ' 留作维持小种即可。'
          ) : (
            <> 舀 {b(`${feed.needed}g`)} 入面团，留 {b(`${SEED_BUFFER_G}g`)} 当下次种。</>
          )}
          {plan.discard > 0 && <> 罐里多出的 {b(`${plan.discard}g`)} → 弃种食谱（下方）。</>}
        </p>
      </div>
    </div>
  );
}

/** 复活喂养：按状态卡生成多轮高稀释时间线 */
function RevivalFeed({ seedStarter }) {
  const [stateId, setStateId] = useStickyState('wake', 'sdlv2_revival_state');
  const plan = planRevival({ stateId, availableGrams: seedStarter });
  const b = (v) => <strong className="font-mono text-ink font-semibold">{v}</strong>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 border border-ink">
        {STARTER_STATES.map((state, i) => {
          const active = state.id === stateId;
          return (
            <button
              key={state.id}
              type="button"
              onClick={() => setStateId(state.id)}
              aria-pressed={active}
              className={[
                'text-left p-3 min-w-0 transition-colors duration-fast cursor-pointer',
                i > 0 ? 'border-l border-ink' : '',
                active ? 'bg-ink text-bg' : 'bg-bg text-ink hover:bg-surface active:bg-sunken',
              ].join(' ')}
            >
              <div className={['font-mono text-2xs uppercase tracking-[0.18em]', active ? 'opacity-65' : 'text-faint'].join(' ')}>
                {state.order} · {state.nameEn}
              </div>
              <div className="font-zh text-sm font-medium mt-1">{state.name}</div>
              <div className={['font-zh text-xs mt-1 leading-snug', active ? 'opacity-80' : 'text-muted'].join(' ')}>
                {state.symptom}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-warn-bg border border-line-soft border-l-[3px] border-l-accent">
        <div className="font-mono text-2xs text-warn uppercase tracking-[0.24em] mb-1">
          Red line · 污染红线
        </div>
        <p className="font-zh text-sm text-accent-ink leading-relaxed">{plan.redline}</p>
      </div>

      {plan.notEnough && (
        <div className="px-3 py-2 bg-warn-bg border border-line-soft">
          <p className="font-zh text-sm text-accent-ink leading-relaxed">
            罐里少于 5g，可用量太低。先从罐壁刮取可见活种；如果已经发霉或腐臭，直接重做。
          </p>
        </div>
      )}

      <div className="border border-ink">
        <div className="p-4 bg-surface border-b border-ink">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            {plan.state.rounds} rounds · {plan.totalHours}h
          </div>
          <div className="font-zh text-sm text-muted mt-1 leading-relaxed">
            {plan.state.note} 目标：{plan.state.goal}
          </div>
        </div>

        {plan.rounds.map((round, i) => (
          <div key={round.n} className={i > 0 ? 'border-t border-line-soft' : ''}>
            <div className="p-3 flex items-baseline justify-between gap-3 bg-bg">
              <div>
                <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
                  Round {String(round.n).padStart(2, '0')}
                </div>
                <div className="font-zh text-xs text-muted mt-0.5">
                  1:{round.ratio}:{round.ratio} · {round.tempRange}
                </div>
              </div>
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em]">
                wait {round.waitHours}h
              </div>
            </div>
            <FeedCards
              items={[
                { label: 'Keep', zh: round.n === 1 ? '取旧种' : '取峰值种', v: round.carryover },
                { label: 'Add flour', zh: '加 T65', v: round.flour },
                { label: 'Add water', zh: '加 水', v: round.water },
              ]}
            />
            <div className="px-3 py-2 bg-surface">
              <p className="font-zh text-sm text-muted leading-relaxed">
                本轮共 {b(`${round.total}g`)}。{round.discard > 0 ? <>多出的 {b(`${round.discard}g`)} 丢弃或做弃种食谱。</> : '无多余弃种。'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-surface border border-line-soft border-l-[3px] border-l-accent">
        <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.30em] mb-1.5">Memo · 复活判断</div>
        <p className="font-zh text-sm text-muted leading-relaxed">
          每轮都只在达峰后进入下一轮。闻起来回到酸甜、能在 {b('4–8h')} 明显翻倍，再切回 Feed 做定时喂养。
        </p>
      </div>
    </div>
  );
}

/**
 * FeedPanel — 喂养 Tab
 *
 * 三段：
 *   №01 Quantity      面包数量
 *   №02 Available     罐里现有旧种
 *   №03 Feed          喂养方案（定时喂养 / 状态复活）
 *
 * Props:
 *   numUnits / onNumUnitsChange
 *   seedStarter / onSeedChange
 *   feed                    calculator.calculateFeed() 输出
 *   revivalMode             boolean
 *   onRevivalModeChange(b)
 */
export function FeedPanel({
  numUnits,
  onNumUnitsChange,
  seedStarter,
  onSeedChange,
  feed,
  roomTempC = 24,
  revivalMode = false,
  onRevivalModeChange,
}) {
  if (!feed) return null;

  // 弃种食谱手风琴：当前展开的 id（同一时间只展开一个）
  const [expandedDiscardId, setExpandedDiscardId] = useState(null);

  return (
    <div className="space-y-7">
      {/* №01 Quantity */}
      <section>
        <SecHead n={1} label="Quantity" zhLabel="面包数量" />
        <Stepper
          value={numUnits}
          onChange={onNumUnitsChange}
          step={1}
          min={1}
          labelEn="Loaves"
          labelZh="个"
          ariaLabel="面包数量"
        />
      </section>

      {/* №02 Available starter */}
      <section>
        <SecHead n={2} label="Available starter" zhLabel="罐里现有旧种" />
        <Stepper
          value={seedStarter}
          onChange={onSeedChange}
          step={5}
          min={5}
          suffix="g"
          labelEn="In jar"
          labelZh="库存"
          ariaLabel="罐里现有旧种"
        />
        <p className="font-zh text-xs text-muted mt-2 leading-relaxed italic">
          — 这里填罐里现在有多少旧种；下面的规划器会决定取多少、弃多少、够不够。
        </p>
      </section>

      {/* №03 Feed —— 模式切换：喂养(定时) / 复活 */}
      <section>
        <SecHead
          n={3}
          label={revivalMode ? 'Revival feed' : 'Feed · timed'}
          zhLabel={revivalMode ? '复活喂养 · 1:5:5' : '喂养 · 按时达峰'}
          right={<ModeToggle revivalMode={revivalMode} onChange={onRevivalModeChange} />}
        />
        {revivalMode ? (
          <RevivalFeed seedStarter={seedStarter} />
        ) : (
          <TimedFeed feed={feed} seedStarter={seedStarter} roomTempC={roomTempC} />
        )}
      </section>

      {/* №04 Discard recipes —— 手风琴：点行就地展开简版做法，原配方留底部链接 */}
      <section>
        <SecHead n={4} label="Discard" zhLabel="弃种处理" />
        <div className="border border-ink">
          {DISCARD_RECIPES.map((r, i) => {
            const isOpen = expandedDiscardId === r.id;
            return (
              <div key={r.id} className={i > 0 ? 'border-t border-line-soft' : ''}>
                {/* 行头：整行点击切换展开 */}
                <button
                  type="button"
                  onClick={() => setExpandedDiscardId(isOpen ? null : r.id)}
                  aria-expanded={isOpen}
                  className="block w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-surface active:bg-sunken transition-colors duration-fast cursor-pointer"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className="font-display text-base font-medium text-ink leading-tight truncate"
                        style={{ letterSpacing: '-0.015em' }}
                      >
                        {r.nameLatin}
                      </div>
                      <div className="font-zh text-xs text-muted leading-tight mt-0.5 truncate">
                        {r.nameZh}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs text-ink tabular-nums leading-tight whitespace-nowrap">
                        {r.discardG}g · {r.timeMin}min
                      </div>
                      <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] mt-0.5 whitespace-nowrap">
                        {isOpen ? 'Close ↑' : 'Open ↓'}
                      </div>
                    </div>
                  </div>
                </button>

                {/* 展开区：简介 + 用料 + 做法 + 完整配方链接 */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 pt-3 bg-surface border-t border-line-soft">
                    {/* 简介 */}
                    <p className="font-zh text-sm text-muted leading-relaxed">
                      {r.summary}
                    </p>

                    {/* 用料 */}
                    <div className="mt-3 pt-3 border-t border-line-soft">
                      <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1.5">
                        Ingredients · 用料
                      </div>
                      <ul className="space-y-1">
                        {r.ingredients.map((ing, j) => (
                          <li
                            key={j}
                            className="grid font-zh text-sm text-muted leading-relaxed"
                            style={{ gridTemplateColumns: '14px 1fr' }}
                          >
                            <span className="font-mono text-2xs text-faint">·</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 做法 */}
                    <div className="mt-3 pt-3 border-t border-line-soft">
                      <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1.5">
                        Method · 做法
                      </div>
                      <ol className="space-y-1.5">
                        {r.steps.map((step, j) => (
                          <li
                            key={j}
                            className="grid font-zh text-sm text-muted leading-relaxed"
                            style={{ gridTemplateColumns: '24px 1fr' }}
                          >
                            <span className="font-mono text-xs text-accent tracking-[0.10em]">
                              {String(j + 1).padStart(2, '0')}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* 完整配方源链接 */}
                    <a
                      href={r.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 pt-3 border-t border-line-soft block font-mono text-2xs text-accent-ink uppercase tracking-[0.24em] hover:underline"
                    >
                      完整配方与精确克数 → {r.source.publisher} ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="font-zh text-xs text-muted mt-2 leading-relaxed italic">
          — 弃种冷藏可存约一周；越老越酸，做脆饼反而更香。
        </p>
      </section>
    </div>
  );
}

export default FeedPanel;
