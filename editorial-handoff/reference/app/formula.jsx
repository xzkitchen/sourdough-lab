// Formula Tab — Editorial Magazine + Quiet Luxury Lab
const { useState: useStateF, useMemo: useMemoF, useEffect: useEffectF } = React;

function FormulaView({ flavor, numUnits, setNumUnits, setFlavor }){
  const calc = useMemoF(() => Engine.calcRecipe(window.BASE, numUnits, flavor.modifiers), [flavor, numUnits]);
  const hydraDelta = calc.actualHydration - window.BASE.hydration;

  return (
    <article className="space-y-section">

      {/* HERO ——  plate style editorial */}
      <section className="grid grid-cols-12 gap-x-6 gap-y-8 pt-2">

        {/* 移动端：巨型色球置顶作视觉锚点（桌面隐藏） */}
        <div className="col-span-12 md:hidden flex justify-center">
          <div className="relative">
            <ColorOrb flavor={flavor} size={168} active />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-bg/80 backdrop-blur-sm rounded-pill px-3 py-1 border border-line-soft">
              <span className="font-mono text-[10px] text-muted tracking-wider">
                h {Engine.predictBreadColor(window.BASE, flavor.modifiers).base.h}°
              </span>
            </div>
          </div>
        </div>

        {/* 左栏：刊头元信息 */}
        <aside className="col-span-12 md:col-span-3 md:space-y-10">
          <div className="grid grid-cols-4 md:block gap-x-3 gap-y-5 md:space-y-5">
            <MetaLine label="No." value={String(window.FLAVORS.indexOf(flavor)+1).padStart(2,'0')} big />
            <MetaLine label="Class" value={diffLabel(flavor.difficulty)} />
            <MetaLine label="Yield" value={`${numUnits} × 400g`} />
            <MetaLine label="Hydration" value={`${(calc.actualHydration*100).toFixed(1)}%`}
                      delta={hydraDelta !== 0 ? `${hydraDelta>0?'+':''}${(hydraDelta*100).toFixed(1)}` : null} />
          </div>
        </aside>

        {/* 中栏：名字 + 署名 */}
        <div className="col-span-12 md:col-span-6 md:order-2 space-y-5 md:space-y-6">
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">
              Chapter I · Formula
            </div>
            <h2 className="font-display text-ink leading-[0.95] tracking-[-0.02em] break-words"
                style={{ fontSize: 'clamp(44px, 9vw, 96px)', fontWeight: 400,
                         fontVariationSettings: "'opsz' 96, 'SOFT' 60, 'wght' 380" }}>
              {flavor.name}
            </h2>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="h-px bg-ink/30 w-10"/>
              <span className="font-display italic text-muted text-base sm:text-lg"
                    style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}>
                {flavor.nameLatin}
              </span>
            </div>
          </div>
          <p className="font-body text-[14px] sm:text-[15px] text-muted leading-[1.7] max-w-md"
             style={{ textWrap: 'pretty' }}>
            {flavor.note}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 pt-1 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.22em] text-faint font-body">Based on</span>
            <span className="font-body text-[13px] text-ink italic">{flavor.source.name}</span>
            {flavor.source.author && (
              <>
                <span className="text-faint hidden sm:inline">—</span>
                <span className="font-body text-[13px] text-muted">{flavor.source.author}</span>
              </>
            )}
          </div>
        </div>

        {/* 右栏：桌面大色球（移动已在顶部显示） */}
        <div className="hidden md:flex col-span-12 md:col-span-3 md:order-3 md:justify-end">
          <div className="relative">
            <ColorOrb flavor={flavor} size={188} active />
            <div className="absolute -bottom-6 -left-6 bg-bg/70 backdrop-blur-sm rounded-pill px-3 py-1.5 border border-line-soft">
              <span className="font-mono text-[10px] text-muted tracking-wider">
                h {Engine.predictBreadColor(window.BASE, flavor.modifiers).base.h}°
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RULE */}
      <div className="flex items-center gap-4">
        <div className="h-px bg-line flex-1"/>
        <span className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Chef's Selection</span>
        <div className="h-px bg-line flex-1"/>
      </div>

      {/* FLAVOR STRIP */}
      <section>
        <div className="flex gap-6 sm:gap-8 overflow-x-auto overflow-y-visible no-scrollbar -mx-6 sm:-mx-12 px-6 sm:px-12 py-3 pb-2">
          {window.FLAVORS.map((f) => {
            const active = f.id === flavor.id;
            return (
              <button key={f.id} onClick={() => setFlavor(f)}
                      className="shrink-0 flex flex-col items-center gap-4 group">
                <ColorOrb flavor={f} size={64} active={active} muted={!active} />
                <div className="flex flex-col items-center gap-1">
                  <span className={`font-body text-[12px] whitespace-nowrap transition-colors duration-base ${active?'text-ink':'text-muted group-hover:text-ink'}`}>
                    {f.name}
                  </span>
                  <span className={`font-display italic text-[10px] whitespace-nowrap transition-colors duration-base ${active?'text-accent-ink':'text-faint'}`}>
                    {f.nameLatin}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* RULE */}
      <div className="flex items-center gap-4">
        <div className="h-px bg-line flex-1"/>
        <span className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Specifications</span>
        <div className="h-px bg-line flex-1"/>
      </div>

      {/* SPECSHEET */}
      <section className="grid grid-cols-12 gap-x-6 gap-y-10">

        {/* 左栏：份数 stepper + 标题 */}
        <aside className="col-span-12 md:col-span-4 md:sticky md:top-24 self-start space-y-7">
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">
              Chapter II · Ingredients
            </div>
            <h3 className="font-display text-ink leading-[0.95]"
                style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400,
                         fontVariationSettings: "'opsz' 44, 'SOFT' 50, 'wght' 380" }}>
              配方清单
            </h3>
            <div className="font-display italic text-muted text-base"
                 style={{ fontVariationSettings: "'opsz' 16, 'wght' 400" }}>
              Baker's formula
            </div>
          </div>

          <Stepper value={numUnits} onChange={setNumUnits} />

          <div className="pt-3 border-t border-line-soft space-y-1">
            <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Total</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-ink tabular-nums" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1, fontVariationSettings: "'opsz' 56, 'wght' 380" }}>
                {calc.totalWeight.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-muted">g</span>
            </div>
            <div className="font-display italic text-faint text-xs pt-1">all-in weight</div>
          </div>
        </aside>

        {/* 右栏：specsheet */}
        <div className="col-span-12 md:col-span-8">
          <ul className="divide-y divide-line-soft">
            {calc.ingredients.map((ing) => (
              <IngredientRow key={ing.id} ing={ing} />
            ))}
          </ul>
        </div>
      </section>

      {/* NOTES */}
      {(calc.notes.length > 0 || calc.warnings.length > 0) && (
        <>
          <div className="flex items-center gap-4">
            <div className="h-px bg-line flex-1"/>
            <span className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Baker's Notes</span>
            <div className="h-px bg-line flex-1"/>
          </div>
          <section className="grid grid-cols-12 gap-x-6 gap-y-4">
            <div className="col-span-12 md:col-span-4">
              <div className="font-display italic text-muted text-lg" style={{ fontVariationSettings: "'opsz' 18, 'wght' 400" }}>
                § Adjustments
              </div>
            </div>
            <div className="col-span-12 md:col-span-8 space-y-3">
              {calc.notes.map((n,i) => (
                <div key={i} className="flex gap-4 pb-3 border-b border-line-soft">
                  <span className="font-mono text-[10px] text-faint tabular-nums pt-[3px]">{String(i+1).padStart(2,'0')}</span>
                  <p className="font-body text-sm text-ink leading-relaxed flex-1">{n}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <PressMark />
    </article>
  );
}

// ── 子组件 ────────────────────────────────

function MetaLine({ label, value, delta, big }){
  return (
    <div className="space-y-1 md:space-y-1.5 min-w-0">
      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.22em] md:tracking-[0.28em] text-faint font-body truncate">{label}</div>
      <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
        <span className={`font-display tabular-nums text-ink ${big?'text-[32px] md:text-[44px]':'text-[16px] md:text-[18px]'}`}
              style={{ lineHeight: 1, fontVariationSettings: big? "'opsz' 44, 'SOFT' 40, 'wght' 340" : "'opsz' 18, 'wght' 420" }}>
          {value}
        </span>
        {delta && <span className="font-mono text-[10px] text-accent-ink tabular-nums">{delta}</span>}
      </div>
    </div>
  );
}

function Stepper({ value, onChange }){
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.28em] text-faint font-body">Yield · 份数</div>
      <div className="flex items-center gap-4">
        <button onClick={() => onChange(Math.max(1, value-1))}
                className="w-10 h-10 rounded-full border border-line hover:border-ink text-ink transition-colors flex items-center justify-center font-display text-lg">
          −
        </button>
        <div className="flex items-baseline gap-2 w-20 justify-center">
          <span className="font-display text-ink tabular-nums"
                style={{ fontSize: 44, lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 44, 'wght' 380" }}>
            {value}
          </span>
          <span className="font-display italic text-faint text-sm">loaf{value>1?'s':''}</span>
        </div>
        <button onClick={() => onChange(Math.min(9, value+1))}
                className="w-10 h-10 rounded-full border border-line hover:border-ink text-ink transition-colors flex items-center justify-center font-display text-lg">
          +
        </button>
      </div>
    </div>
  );
}

function IngredientRow({ ing }){
  const isMod = ing.source === 'modifier';
  const isReserved = ing.id === 'water-reserved';
  return (
    <li className="grid items-baseline gap-x-3 sm:gap-x-4 gap-y-1 py-4 sm:py-5 sdl-ing-row">
      <span className={`font-mono text-[10px] tabular-nums pt-[4px] row-start-1 col-start-1 ${isMod?'text-accent-ink':'text-faint'}`}>
        {isMod ? '◆' : (isReserved ? '·' : '—')}
      </span>
      <div className="min-w-0 space-y-0.5 row-start-1 col-start-2">
        <div className={`font-body text-[14px] sm:text-[15px] ${isMod?'text-accent-ink':'text-ink'}`}>
          {ing.name}
        </div>
        {ing.nameLatin && (
          <div className="font-display italic text-faint text-xs" style={{ fontVariationSettings: "'opsz' 12, 'wght' 400" }}>
            {ing.nameLatin}
          </div>
        )}
      </div>
      <span className="font-mono text-[11px] text-faint tabular-nums text-right row-start-1 col-start-3">
        {(ing.bakersPct*100).toFixed(ing.bakersPct < 0.1 ? 1 : (ing.bakersPct === 1 ? 0 : 1))}%
      </span>
      <div className="text-right row-start-1 col-start-4">
        <span className="font-display text-ink tabular-nums"
              style={{ fontSize: 'clamp(22px, 5vw, 28px)', lineHeight: 1, fontWeight: 400, fontVariationSettings: "'opsz' 28, 'wght' 350" }}>
          {Number.isInteger(ing.weight) ? ing.weight : ing.weight.toFixed(1)}
        </span>
        <span className="font-mono text-[10px] text-faint ml-1">g</span>
      </div>
    </li>
  );
}

function PressMark(){
  return (
    <div className="flex items-center justify-center pt-6">
      <div className="w-20 h-20 rounded-full border border-accent-line/60 flex items-center justify-center relative">
        <div className="absolute inset-1.5 rounded-full border border-accent-line/30"/>
        <div className="text-center">
          <div className="font-display italic text-[9px] text-accent-ink leading-tight" style={{ fontVariationSettings: "'opsz' 9, 'wght' 400" }}>est.</div>
          <div className="font-display text-[11px] text-accent-ink leading-tight" style={{ fontVariationSettings: "'opsz' 11, 'wght' 500" }}>2026</div>
          <div className="font-display italic text-[8px] text-accent-ink/70 leading-tight">s · l</div>
        </div>
      </div>
    </div>
  );
}

function diffLabel(d){
  return { beginner: 'Novice', intermediate: 'Artisan', advanced: 'Master' }[d] || '—';
}

Object.assign(window, { FormulaView });
