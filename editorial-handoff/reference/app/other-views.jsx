// Starter (养种) / Bake (流程) / Cook Mode 视图
const { useState: useS2, useMemo: useM2, useEffect: useE2 } = React;

// ── STARTER ──────────────────────────────────────────
function StarterView({ flavor, numUnits }){
  const calc = useM2(() => Engine.calcRecipe(window.BASE, numUnits, flavor.modifiers), [flavor, numUnits]);
  const [seed, setSeed] = useS2(60);
  const feed = Engine.calcFeed(calc, seed);
  if (!feed) return null;

  const ratio = `1 : ${(feed.flour/Math.max(1,seed)).toFixed(1)} : ${(feed.water/Math.max(1,seed)).toFixed(1)}`;

  return (
    <article className="space-y-section">
      {/* HERO */}
      <section className="grid grid-cols-12 gap-x-6 gap-y-8 pt-2">
        {/* 移动端：气泡球置顶 */}
        <div className="col-span-12 md:hidden flex justify-center">
          <div className="w-[168px] h-[168px] rounded-full border-[1px] border-line relative overflow-hidden"
               style={{ background: 'radial-gradient(circle at 35% 35%, #F3E8D4 0%, #E5D3B3 45%, #C9A57F 100%)' }}>
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
              <rect width="100%" height="100%" filter="url(#orbGrain)" fill="#fff" opacity="0.35" style={{ mixBlendMode: 'overlay' }} />
            </svg>
            {Array.from({length: 16}).map((_,i) => {
              const r = 2 + (i%4);
              const cx = 28 + (i*33)%112;
              const cy = 28 + (i*47)%112;
              return <span key={i} className="absolute rounded-full" style={{
                width: r*2, height: r*2, left: cx, top: cy,
                background: 'rgba(255,253,248,0.7)', boxShadow: 'inset 0 0 4px rgba(60,40,20,0.15)'
              }}/>;
            })}
          </div>
        </div>

        <aside className="col-span-12 md:col-span-3 md:space-y-10">
          <div className="grid grid-cols-4 md:block gap-x-3 gap-y-5 md:space-y-5">
            <MetaLine label="No." value="02" big />
            <MetaLine label="Target" value={`${feed.total}g`} />
            <MetaLine label="Window" value="6–8h" />
            <MetaLine label="Temp" value="24°C" />
          </div>
        </aside>

        <div className="col-span-12 md:col-span-6 md:order-2 space-y-5 md:space-y-6">
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">
              Chapter II · Starter
            </div>
            <h2 className="font-display text-ink leading-[0.95] tracking-[-0.02em] break-words"
                style={{ fontSize: 'clamp(44px, 9vw, 96px)', fontWeight: 400,
                         fontVariationSettings: "'opsz' 96, 'SOFT' 60, 'wght' 380" }}>
              养种
            </h2>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="h-px bg-ink/30 w-10"/>
              <span className="font-display italic text-muted text-base sm:text-lg"
                    style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}>
                Levain · a feeding ritual
              </span>
            </div>
          </div>
          <p className="font-body text-[14px] sm:text-[15px] text-muted leading-[1.7] max-w-md" style={{ textWrap: 'pretty' }}>
            按 1:1:1 的粉水比喂养，室温 24°C 静置 6–8 小时至体积翻倍、表面微凸起气泡均匀。落入水中能漂起即达峰值。
          </p>
        </div>

        <div className="hidden md:flex col-span-12 md:col-span-3 md:order-3 md:justify-end">
          <div className="relative">
            <div className="w-[188px] h-[188px] rounded-full border-[1px] border-line relative overflow-hidden"
                 style={{ background: 'radial-gradient(circle at 35% 35%, #F3E8D4 0%, #E5D3B3 45%, #C9A57F 100%)' }}>
              <svg className="absolute inset-0 w-full h-full" aria-hidden>
                <rect width="100%" height="100%" filter="url(#orbGrain)" fill="#fff" opacity="0.35" style={{ mixBlendMode: 'overlay' }} />
              </svg>
              {Array.from({length: 18}).map((_,i) => {
                const r = 2 + (i%4);
                const cx = 30 + (i*37)%128;
                const cy = 30 + (i*53)%128;
                return <span key={i} className="absolute rounded-full" style={{
                  width: r*2, height: r*2, left: cx, top: cy,
                  background: 'rgba(255,253,248,0.7)', boxShadow: 'inset 0 0 4px rgba(60,40,20,0.15)'
                }}/>;
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <div className="h-px bg-line flex-1"/>
        <span className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">The Feeding</span>
        <div className="h-px bg-line flex-1"/>
      </div>

      {/* FEED CALC */}
      <section className="grid grid-cols-12 gap-x-6 gap-y-10">
        <aside className="col-span-12 md:col-span-4 space-y-7">
          <div className="space-y-3">
            <h3 className="font-display text-ink leading-[0.95]"
                style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400,
                         fontVariationSettings: "'opsz' 44, 'wght' 380" }}>
              喂养比例
            </h3>
            <div className="font-display italic text-muted text-base"
                 style={{ fontVariationSettings: "'opsz' 16, 'wght' 400" }}>
              seed : flour : water
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Ratio</div>
            <div className="font-display text-ink tabular-nums"
                 style={{ fontSize: 44, lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 44, 'wght' 380" }}>
              {ratio}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-line-soft">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Mother Starter</span>
              <span className="font-mono text-[11px] text-muted">{seed}g</span>
            </div>
            <input type="range" min="20" max="120" step="5" value={seed} onChange={e=>setSeed(+e.target.value)}
                   className="sdl-slider"/>
            <div className="flex justify-between font-mono text-[10px] text-faint">
              <span>20g</span><span>120g</span>
            </div>
          </div>
        </aside>

        <div className="col-span-12 md:col-span-8">
          <ul className="divide-y divide-line-soft">
            <FeedRow n="01" name="Mother Starter" zh="鲁邦母种" weight={feed.seed} hint="从冰箱取出后先在室温回温 30 分钟" />
            <FeedRow n="02" name="Flour" zh="高筋粉" weight={feed.flour} hint="T65 或 10% 全麦混合" />
            <FeedRow n="03" name="Water" zh="过滤水" weight={feed.water} hint="28–30°C 温水，激发酵母活性" />
            <FeedRow n="04" name="Yield" zh="成品量" weight={feed.total} accent />
          </ul>
          <div className="mt-10 pt-6 border-t border-line space-y-3">
            <div className="flex gap-4 items-baseline">
              <span className="font-display italic text-muted text-lg" style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}>§</span>
              <p className="font-body text-sm text-muted leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
                食谱需用 <span className="font-mono text-accent-ink tabular-nums">{feed.need}g</span> · 额外缓冲 <span className="font-mono tabular-nums">{feed.buffer}g</span>（留给下一次喂养）。
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function FeedRow({ n, name, zh, weight, hint, accent }){
  return (
    <li className="grid items-baseline gap-x-3 sm:gap-x-4 py-4 sm:py-5 sdl-feed-row">
      <span className="font-mono text-[10px] text-faint tabular-nums pt-[4px]">{n}</span>
      <div className="min-w-0 space-y-0.5">
        <div className={`font-body text-[14px] sm:text-[15px] ${accent?'text-accent-ink':'text-ink'}`}>{zh}</div>
        <div className="font-display italic text-faint text-xs leading-snug" style={{ fontVariationSettings: "'opsz' 12, 'wght' 400" }}>
          {name}{hint && <> · <span className="not-italic">{hint}</span></>}
        </div>
      </div>
      <div className="text-right">
        <span className={`font-display tabular-nums ${accent?'text-accent-ink':'text-ink'}`}
              style={{ fontSize: 'clamp(22px, 5vw, 28px)', lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 28, 'wght' 350" }}>
          {weight}
        </span>
        <span className="font-mono text-[10px] text-faint ml-1">g</span>
      </div>
    </li>
  );
}

// ── BAKE ────────────────────────────────────────────
function BakeView({ flavor, onCookMode }){
  const [done, setDone] = useS2(new Set());
  const toggle = (id) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id); else next.add(id);
    setDone(next);
  };
  const total = window.STEPS.reduce((s,x)=>s+x.minutes,0);
  const doneMin = window.STEPS.filter(s=>done.has(s.id)).reduce((s,x)=>s+x.minutes,0);
  const progress = Math.round((doneMin/total)*100);

  return (
    <article className="space-y-section">
      <section className="grid grid-cols-12 gap-x-6 gap-y-8 pt-2">
        {/* 移动端：进度环置顶 */}
        <div className="col-span-12 md:hidden flex justify-center">
          <div className="relative">
            <svg width="168" height="168" viewBox="0 0 188 188">
              <circle cx="94" cy="94" r="86" fill="none" stroke="#E5DED0" strokeWidth="1"/>
              <circle cx="94" cy="94" r="86" fill="none" stroke="#B08968" strokeWidth="1.5"
                      strokeDasharray={`${progress*5.404} 540.4`} strokeDashoffset="0"
                      transform="rotate(-90 94 94)"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-display text-ink tabular-nums" style={{ fontSize: 42, lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 48, 'wght' 350" }}>{progress}</div>
                <div className="font-mono text-[9px] text-muted mt-1">% COMPLETE</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="col-span-12 md:col-span-3 md:space-y-10">
          <div className="grid grid-cols-4 md:block gap-x-3 gap-y-5 md:space-y-5">
            <MetaLine label="No." value="03" big />
            <MetaLine label="Duration" value={`${Math.round(total/60)}h`} />
            <MetaLine label="Steps" value={`${window.STEPS.length}`} />
            <MetaLine label="Progress" value={`${progress}%`} />
          </div>
        </aside>

        <div className="col-span-12 md:col-span-6 md:order-2 space-y-5 md:space-y-6">
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Chapter III · Bake</div>
            <h2 className="font-display text-ink leading-[0.95] tracking-[-0.02em] break-words"
                style={{ fontSize: 'clamp(44px, 9vw, 96px)', fontWeight: 400,
                         fontVariationSettings: "'opsz' 96, 'SOFT' 60, 'wght' 380" }}>
              流程
            </h2>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="h-px bg-ink/30 w-10"/>
              <span className="font-display italic text-muted text-base sm:text-lg"
                    style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}>
                The method, {window.STEPS.length} movements
              </span>
            </div>
          </div>
          <p className="font-body text-[14px] sm:text-[15px] text-muted leading-[1.7] max-w-md" style={{ textWrap: 'pretty' }}>
            从喂种到出炉约 {Math.round(total/60)} 小时。每完成一步点击左侧序号打钩，进入 Cook Mode 获取单步全屏大字指示。
          </p>
          <button onClick={onCookMode}
                  className="group inline-flex items-center gap-3 text-ink hover:text-accent-ink transition-colors">
            <span className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-ink group-hover:border-accent-ink flex items-center justify-center transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </span>
            <span className="font-display italic text-base sm:text-lg" style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}>
              Enter Cook Mode
            </span>
          </button>
        </div>

        <div className="hidden md:flex col-span-12 md:col-span-3 md:order-3 md:justify-end">
          <div className="relative">
            <svg width="188" height="188" viewBox="0 0 188 188">
              <circle cx="94" cy="94" r="86" fill="none" stroke="#E5DED0" strokeWidth="1"/>
              <circle cx="94" cy="94" r="86" fill="none" stroke="#B08968" strokeWidth="1.5"
                      strokeDasharray={`${progress*5.404} 540.4`} strokeDashoffset="0"
                      transform="rotate(-90 94 94)" strokeLinecap="butt"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-display text-ink tabular-nums" style={{ fontSize: 48, lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 48, 'wght' 350" }}>{progress}</div>
                <div className="font-mono text-[10px] text-muted mt-1">% COMPLETE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <div className="h-px bg-line flex-1"/>
        <span className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">The Sequence</span>
        <div className="h-px bg-line flex-1"/>
      </div>

      {/* TIMELINE */}
      <section className="grid grid-cols-12 gap-x-6">
        <ol className="col-span-12 md:col-span-10 md:col-start-2">
          {window.STEPS.map((step, i) => {
            const isDone = done.has(step.id);
            return (
              <li key={step.id} className="grid items-start py-5 sm:py-7 border-t border-line-soft first:border-t-0 sdl-bake-row">
                <button onClick={()=>toggle(step.id)} className="group relative">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all duration-base
                    ${isDone ? 'bg-ink border-ink text-bg' : 'border-line group-hover:border-ink text-ink'}`}>
                    <span className="font-display tabular-nums text-base sm:text-lg" style={{ fontVariationSettings: "'opsz' 18, 'wght' 360" }}>
                      {isDone ? '✓' : step.num}
                    </span>
                  </div>
                </button>
                <div className="space-y-2 min-w-0">
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <h4 className={`font-display text-ink tracking-tight ${isDone?'line-through text-faint':''}`}
                        style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 400, fontVariationSettings: "'opsz' 26, 'wght' 380" }}>
                      {step.title}
                    </h4>
                    <span className="font-display italic text-muted text-xs sm:text-sm" style={{ fontVariationSettings: "'opsz' 14, 'wght' 400" }}>
                      {step.latin}
                    </span>
                  </div>
                  {step.tip && (
                    <p className="font-body text-[13px] sm:text-sm text-muted leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
                      {step.tip}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-display text-ink tabular-nums"
                       style={{ fontSize: 'clamp(18px, 4vw, 24px)', lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 24, 'wght' 350" }}>
                    {step.minutes>=60 ? (step.minutes/60).toFixed(step.minutes%60===0?0:1) : step.minutes}
                  </div>
                  <div className="font-mono text-[10px] text-faint mt-1">
                    {step.minutes>=60 ? 'hrs' : 'min'}
                  </div>
                  {step.temp && <div className="font-mono text-[10px] text-faint mt-0.5">{step.temp}°C</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}

// ── COOK MODE ───────────────────────────────────────
function CookMode({ open, onClose }){
  const [cur, setCur] = useS2(0);
  const step = window.STEPS[cur];
  useE2(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') setCur(c => Math.min(window.STEPS.length-1, c+1));
      if (e.key === 'ArrowLeft') setCur(c => Math.max(0, c-1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-bg flex flex-col" role="dialog" aria-modal="true">
      {/* TOP */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 border-b border-line">
        <div className="flex items-baseline gap-3 sm:gap-4">
          <span className="font-display italic text-muted text-sm" style={{ fontVariationSettings: "'opsz' 14, 'wght' 400" }}>Cook Mode</span>
          <span className="font-mono text-[10px] text-faint tabular-nums">
            {String(cur+1).padStart(2,'0')} / {String(window.STEPS.length).padStart(2,'0')}
          </span>
        </div>
        <button onClick={onClose} className="font-display italic text-muted hover:text-ink transition-colors text-sm sm:text-base">
          Exit ✕
        </button>
      </header>

      {/* BODY */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 overflow-y-auto">
        <div className="max-w-4xl w-full space-y-7 sm:space-y-10">
          <div className="space-y-3">
            <div className="font-display text-accent-ink tabular-nums"
                 style={{ fontSize: 'clamp(64px, 14vw, 140px)', lineHeight: 0.9, fontWeight: 400, fontVariationSettings: "'opsz' 140, 'SOFT' 60, 'wght' 340" }}>
              {step.num}
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h2 className="font-display text-ink tracking-tight break-words"
                style={{ fontSize: 'clamp(36px, 9vw, 88px)', lineHeight: 0.95, fontWeight: 400, fontVariationSettings: "'opsz' 88, 'SOFT' 55, 'wght' 400" }}>
              {step.title}
            </h2>
            <div className="font-display italic text-muted" style={{ fontSize: 'clamp(16px, 2.5vw, 24px)', fontVariationSettings: "'opsz' 24, 'wght' 400" }}>
              {step.latin}
            </div>
          </div>
          {step.tip && (
            <p className="font-body text-base sm:text-xl text-ink leading-[1.6] max-w-2xl" style={{ textWrap: 'pretty' }}>
              {step.tip}
            </p>
          )}
          <div className="flex items-baseline gap-6 sm:gap-10 pt-2 sm:pt-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Duration</div>
              <div className="font-display text-ink tabular-nums mt-1"
                   style={{ fontSize: 'clamp(36px, 8vw, 56px)', lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 56, 'wght' 350" }}>
                {step.minutes>=60 ? (step.minutes/60).toFixed(step.minutes%60===0?0:1) : step.minutes}
                <span className="font-mono text-xs sm:text-sm text-faint ml-2">{step.minutes>=60 ? 'hrs' : 'min'}</span>
              </div>
            </div>
            {step.temp && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Temperature</div>
                <div className="font-display text-ink tabular-nums mt-1"
                     style={{ fontSize: 'clamp(36px, 8vw, 56px)', lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 56, 'wght' 350" }}>
                  {step.temp}<span className="font-mono text-xs sm:text-sm text-faint ml-2">°C</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <footer className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 border-t border-line gap-3">
        <button onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0}
                className="font-display italic text-muted hover:text-ink disabled:opacity-30 transition-colors text-sm sm:text-base shrink-0">
          ← Prev
        </button>
        <div className="flex gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {window.STEPS.map((_,i) => (
            <button key={i} onClick={()=>setCur(i)}
                    className={`h-1 transition-all duration-base shrink-0 ${i===cur?'w-6 sm:w-8 bg-ink':'w-3 sm:w-4 bg-line hover:bg-muted'}`}/>
          ))}
        </div>
        <button onClick={()=>setCur(c=>Math.min(window.STEPS.length-1,c+1))} disabled={cur===window.STEPS.length-1}
                className="font-display italic text-ink hover:text-accent-ink disabled:opacity-30 transition-colors text-sm sm:text-base shrink-0">
          Next →
        </button>
      </footer>
    </div>
  );
}

Object.assign(window, { StarterView, BakeView, CookMode });
