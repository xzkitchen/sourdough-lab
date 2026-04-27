// V2 — Bakery Ledger
// Bone white, Swiss-grid, GT Sectra display + mono data.
// Updated to the new SDL domain: single sourdough base + 11 modular flavors.

const { useState: useS2, useMemo: useM2 } = React;

const V2 = () => {
  const SDL = window.SDL;
  const FLAVORS = SDL.FLAVORS;

  const [activeTab, setActiveTab] = useS2('recipe');
  const [flavorId, setFlavorId]   = useS2('plain');
  const [numUnits, setNumUnits]   = useS2(3);
  const [seedStarter, setSeed]    = useS2(60);
  const [completedSteps, setCompletedSteps] = useS2({});
  const [openStepId, setOpenStepId] = useS2(null);

  const flavor = useM2(() => SDL.FLAVORS_BY_ID[flavorId] || SDL.FLAVORS_BY_ID.plain, [flavorId]);
  const calc   = useM2(() => SDL.calculateRecipe({
    base: SDL.BASE, numUnits, selectedModifiers: flavor.modifiers,
  }), [flavor, numUnits]);
  const feed   = useM2(() => SDL.calculateFeed(calc, seedStarter), [calc, seedStarter]);
  const steps  = useM2(() => SDL.enhanceSteps(SDL.SOURDOUGH_STEPS, calc), [calc]);
  const progress = useM2(() => {
    const c = steps.filter(s => completedSteps[s.id]).length;
    return { completed: c, total: steps.length, percent: Math.round(c/steps.length*100) };
  }, [completedSteps, steps]);
  const currentStepId = steps.find(s => !completedSteps[s.id])?.id || null;

  const C = {
    bg: '#f5f2eb', card: '#fbf8f1',
    ink: '#1a1a1a', inkSoft: '#5b554b', inkMute: '#9a9186',
    rule: '#1a1a1a', ruleSoft: 'rgba(26,26,26,0.12)',
    accent: '#b94a20',
  };
  const display = '"GT Sectra", "Fraunces", Georgia, serif';
  const zh = '"Noto Serif SC", "Songti SC", serif';
  const mono = '"JetBrains Mono", "IBM Plex Mono", monospace';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: C.bg, color: C.ink,
      fontFamily: zh, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(to right, transparent 27px, ${C.ruleSoft} 27px, ${C.ruleSoft} 28px, transparent 28px), linear-gradient(to right, transparent calc(100% - 28px), ${C.ruleSoft} calc(100% - 28px), ${C.ruleSoft} calc(100% - 27px), transparent calc(100% - 27px))`,
      }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '72px 28px 14px', position: 'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderBottom:`2px solid ${C.ink}`, paddingBottom: 12 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform:'uppercase', marginBottom: 6 }}>
                Vol. 4 / Ten formulas
              </div>
              <div style={{ fontFamily: display, fontSize: 30, fontWeight: 500, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
                The Bakery
              </div>
              <div style={{ fontFamily: display, fontSize: 30, fontWeight: 500, fontStyle: 'italic', lineHeight: 0.95, letterSpacing: '-0.025em', marginTop: 2 }}>
                Ledger.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.25em', color: C.inkMute, textTransform: 'uppercase' }}>Date</div>
              <div style={{ fontFamily: mono, fontSize: 13, color: C.ink, marginTop: 2, letterSpacing: '0.05em' }}>04 / 27 / 26</div>
            </div>
          </div>
        </header>

        <nav style={{ display: 'flex', borderBottom: `1px solid ${C.ink}`, margin: '0 28px' }}>
          {[
            { id:'recipe',  n:'01', label:'Formula', zh:'配方' },
            { id:'feed',    n:'02', label:'Levain',  zh:'喂养' },
            { id:'process', n:'03', label:'Method',  zh:'流程' },
          ].map((t, i) => {
            const sel = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, background: sel ? C.ink : 'transparent', color: sel ? C.bg : C.ink,
                  border: 0, borderLeft: i > 0 ? `1px solid ${C.ink}` : 'none',
                  padding: '12px 8px 10px', cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', opacity: 0.7 }}>{t.n}</div>
                <div style={{ fontFamily: display, fontSize: 15, fontWeight: 500, marginTop: 1 }}>{t.label}</div>
                <div style={{ fontFamily: zh, fontSize: 10, opacity: 0.7, marginTop: 1 }}>{t.zh}</div>
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40, position: 'relative' }}>
          {activeTab === 'recipe'  && <R2 {...{C, display, zh, mono, FLAVORS, flavor, flavorId, setFlavorId, numUnits, calc, setCompletedSteps}}/>}
          {activeTab === 'feed'    && <F2 {...{C, display, zh, mono, numUnits, setNumUnits, seedStarter, setSeed, feed, calc}}/>}
          {activeTab === 'process' && <P2 {...{C, display, zh, mono, steps, completedSteps, setCompletedSteps, openStepId, setOpenStepId, currentStepId, progress}}/>}
        </div>
      </div>
    </div>
  );
};

function StampRadial({ C, size = 170 }) {
  const n = 60;
  return (
    <svg width={size} height={size} viewBox={`${-size/2} ${-size/2} ${size} ${size}`} style={{ display: 'block' }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const x1 = Math.cos(a) * 62, y1 = Math.sin(a) * 62;
        const x2 = Math.cos(a) * 74, y2 = Math.sin(a) * 74;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth="0.6"/>;
      })}
      <circle r="60" fill="none" stroke={C.ink} strokeWidth="0.8"/>
      <circle r="78" fill="none" stroke={C.ink} strokeWidth="0.4"/>
      <circle r="82" fill="none" stroke={C.ink} strokeWidth="0.4"/>
    </svg>
  );
}

function SecHead({ C, display, mono, zh, n, label, zhLabel, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.inkMute, letterSpacing: '0.2em' }}>{n}</div>
        <div style={{ fontFamily: display, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft }}>{zhLabel}</div>
      </div>
      {right}
    </div>
  );
}

function R2({ C, display, zh, mono, FLAVORS, flavor, flavorId, setFlavorId, numUnits, calc, setCompletedSteps }) {
  const switchFlavor = (id) => { setFlavorId(id); setCompletedSteps({}); };
  const flavorIndex = FLAVORS.findIndex(f => f.id === flavorId);
  return (
    <div>
      {/* STICKY active-flavor bar — visible while scrolling through the picker */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: C.bg,
        borderBottom: `1px solid ${C.ink}`,
        padding: '12px 28px 12px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
              <StampRadial C={C} size={40}/>
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 10, fontWeight: 600 }}>
              {String(flavorIndex+1).padStart(2,'0')}
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: C.inkMute, textTransform: 'uppercase' }}>Active · 当前</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 1 }}>
              <div style={{ fontFamily: display, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{flavor.nameLatin}</div>
              <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft, whiteSpace: 'nowrap' }}>{flavor.name}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: `1px solid ${C.ruleSoft}`, paddingLeft: 12 }}>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: C.inkMute, textTransform: 'uppercase' }}>H · {flavor.modifiers.length} mod</div>
            <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600, lineHeight: 1.1, marginTop: 1 }}>{Math.round(calc.actualHydration*100)}%</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '22px 28px 0' }}>
      {/* FLAVOR PICKER — 2-col grid */}
      <div style={{ marginBottom: 24 }}>
        <SecHead C={C} display={display} mono={mono} zh={zh} n="01" label="Flavor" zhLabel="风味预设"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.ink}` }}>
          {FLAVORS.map((f, i) => {
            const sel = flavorId === f.id;
            const col = i % 2;
            const row = Math.floor(i/2);
            return (
              <button key={f.id} onClick={() => switchFlavor(f.id)}
                style={{
                  background: sel ? C.ink : C.card, color: sel ? C.bg : C.ink,
                  border: 0,
                  borderLeft: col>0 ? `1px solid ${C.ink}` : 'none',
                  borderTop:  row>0 ? `1px solid ${C.ink}` : 'none',
                  padding: '10px 12px 12px', cursor: 'pointer', textAlign: 'left',
                  minHeight: 76,
                }}>
                <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.22em', opacity: 0.65 }}>№ {String(i+1).padStart(2,'0')}</div>
                <div style={{ fontFamily: display, fontSize: 14, fontWeight: 500, marginTop: 3, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{f.nameLatin}</div>
                <div style={{ fontFamily: zh, fontSize: 11, opacity: 0.85, marginTop: 2 }}>{f.name}</div>
                <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.18em', opacity: 0.55, marginTop: 5, textTransform: 'uppercase' }}>
                  {f.modifiers.length === 0 ? '— pure base' : f.modifiers.map(m => window.SDL.MODIFIERS_BY_ID[m.id]?.nameLatin || m.id).join(' · ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INGREDIENT TABLE */}
      <div style={{ marginBottom: 20 }}>
        <SecHead C={C} display={display} mono={mono} zh={zh} n="02" label="Formula" zhLabel="配方清单"
          right={<span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.15em', color: C.ink, borderLeft: `1px solid ${C.ink}`, paddingLeft: 8 }}>H {Math.round(calc.actualHydration*100)}%</span>}/>
        <div style={{ borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 56px 38px', padding: '6px 0 4px', borderBottom: `1px solid ${C.ink}`, gap: 4 }}>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: C.inkMute, textTransform: 'uppercase' }}>Ingredient</div>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: C.inkMute, textTransform: 'uppercase', textAlign: 'right' }}>Bak%</div>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: C.inkMute, textTransform: 'uppercase', textAlign: 'right' }}>Gram</div>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: C.inkMute, textTransform: 'uppercase', textAlign: 'right' }}>Src</div>
          </div>
          {calc.ingredients.map((ing, i) => (
            <Row2 key={ing.id+i} C={C} display={display} zh={zh} mono={mono}
              name={ing.name}
              en={prettyEn(ing)}
              pct={fmtPct(ing.bakersPct)}
              v={fmtWeight(ing.weight)}
              src={ing.source}
              last={i === calc.ingredients.length - 1}/>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0 0' }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>Total Mass</div>
            <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>面团总重</div>
          </div>
          <div style={{ fontFamily: display, fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {calc.totalWeight}<span style={{ fontFamily: mono, fontSize: 14, color: C.inkMute, marginLeft: 6 }}>g</span>
          </div>
        </div>
      </div>

      {/* NOTES + WARNINGS */}
      {(calc.notes.length > 0 || calc.warnings.length > 0) && (
        <div style={{ marginBottom: 20 }}>
          <SecHead C={C} display={display} mono={mono} zh={zh} n="03" label="Marginalia" zhLabel="批注"/>
          {calc.notes.map((n, i) => (
            <div key={'n'+i} style={{ display:'grid', gridTemplateColumns:'18px 1fr', fontFamily: zh, fontSize: 12, lineHeight: 1.65, color: C.inkSoft, padding: '6px 0', borderBottom: `1px solid ${C.ruleSoft}` }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: C.ink, letterSpacing: '0.1em' }}>+</span>
              <span>{n}</span>
            </div>
          ))}
          {calc.warnings.map((w, i) => (
            <div key={'w'+i} style={{ display:'grid', gridTemplateColumns:'18px 1fr', fontFamily: zh, fontSize: 12, lineHeight: 1.65, color: C.inkSoft, padding: '6px 0', borderBottom: `1px solid ${C.ruleSoft}` }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: C.accent, letterSpacing: '0.1em' }}>!</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* SOURCE FOOTER */}
      <div style={{ borderTop: `1px solid ${C.ruleSoft}`, padding: '14px 0', marginTop: 8 }}>
        <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase', marginBottom: 6 }}>Source · 出处</div>
        <div style={{ fontFamily: display, fontSize: 13, fontStyle: 'italic', color: C.ink, lineHeight: 1.4 }}>
          {flavor.source?.name}
          {flavor.source?.author ? <span style={{ fontStyle: 'normal', color: C.inkSoft }}> — {flavor.source.author}</span> : null}
        </div>
        {flavor.note && (
          <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft, marginTop: 6, lineHeight: 1.65 }}>{flavor.note}</div>
        )}
      </div>

      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textAlign: 'center', padding: '20px 0 30px', textTransform: 'uppercase' }}>
        — end of formula —
      </div>
      </div>
    </div>
  );
}

function prettyEn(ing) {
  const map = {
    'flour':'T65 flour','water':'Water','water-autolyse':'Water · autolyse',
    'water-reserved':'Water · reserved','starter':'Levain','salt':'Sea salt',
    'sugar-boost':'Sugar boost',
  };
  if (map[ing.id]) return map[ing.id];
  const mod = window.SDL.MODIFIERS_BY_ID[ing.id];
  return mod?.nameLatin || ing.id;
}
function fmtPct(bp) {
  if (bp == null) return '—';
  const v = bp * 100;
  return v >= 10 ? Math.round(v) : (Math.round(v*10)/10);
}
function fmtWeight(w) {
  return Number.isInteger(w) ? w : (Math.round(w*10)/10);
}

function Row2({ C, display, zh, mono, name, en, pct, v, src, last }) {
  const isMod = src === 'modifier';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 50px 56px 38px',
      alignItems: 'baseline', padding: '10px 0', gap: 4,
      borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}`,
    }}>
      <div>
        <div style={{ fontFamily: zh, fontSize: 13, fontWeight: 500 }}>{name}</div>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.inkMute, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>{en}</div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.inkSoft, textAlign: 'right' }}>{pct}</div>
      <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{v}</div>
      <div style={{ fontFamily: mono, fontSize: 8, color: isMod ? C.accent : C.inkMute, letterSpacing: '0.15em', textAlign: 'right', textTransform: 'uppercase' }}>
        {isMod ? 'mod' : 'base'}
      </div>
    </div>
  );
}

function F2({ C, display, zh, mono, numUnits, setNumUnits, seedStarter, setSeed, feed, calc }) {
  if (!feed) return null;
  return (
    <div style={{ padding: '22px 28px 0' }}>
      {/* QUANTITY — drives levain demand */}
      <SecHead C={C} display={display} mono={mono} zh={zh} n="01" label="Quantity" zhLabel="面包数量"/>
      <div style={{
        display: 'grid', gridTemplateColumns: '56px 1fr 56px',
        border: `1px solid ${C.ink}`, background: C.card, marginBottom: 26,
      }}>
        <button onClick={() => setNumUnits(Math.max(1, numUnits-1))} style={{
          background: 'transparent', border: 0, borderRight: `1px solid ${C.ink}`, color: C.ink,
          fontFamily: display, fontSize: 28, cursor: 'pointer',
        }}>−</button>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: display, fontSize: 50, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em' }}>{numUnits}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: C.inkMute, textTransform: 'uppercase' }}>Loaves</div>
            <div style={{ fontFamily: zh, fontSize: 11, color: C.inkSoft, marginTop: 2 }}>个</div>
          </div>
        </div>
        <button onClick={() => setNumUnits(numUnits+1)} style={{
          background: 'transparent', border: 0, borderLeft: `1px solid ${C.ink}`, color: C.ink,
          fontFamily: display, fontSize: 28, cursor: 'pointer',
        }}>+</button>
      </div>

      <SecHead C={C} display={display} mono={mono} zh={zh} n="02" label="Seed amount" zhLabel="旧种数量"/>
      <div style={{
        display: 'grid', gridTemplateColumns: '56px 1fr 56px',
        border: `1px solid ${C.ink}`, background: C.card, marginBottom: 26,
      }}>
        <button onClick={() => setSeed(Math.max(1, seedStarter-5))} style={{
          background: 'transparent', border: 0, borderRight: `1px solid ${C.ink}`, color: C.ink,
          fontFamily: display, fontSize: 28, cursor: 'pointer',
        }}>−</button>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: display, fontSize: 50, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em' }}>{seedStarter}<span style={{ fontFamily: mono, fontSize: 15, color: C.inkMute, marginLeft: 4 }}>g</span></div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: C.inkMute, textTransform: 'uppercase' }}>Existing</div>
        </div>
        <button onClick={() => setSeed(seedStarter+5)} style={{
          background: 'transparent', border: 0, borderLeft: `1px solid ${C.ink}`, color: C.ink,
          fontFamily: display, fontSize: 28, cursor: 'pointer',
        }}>+</button>
      </div>

      <SecHead C={C} display={display} mono={mono} zh={zh} n="03" label="1:1 Feed" zhLabel="喂养方案"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.ink}`, marginBottom: 20 }}>
        {[
          { label:'Add flour', zh:'加 T65', v: feed.flour },
          { label:'Add water', zh:'加 水',  v: feed.water },
        ].map((x, i) => (
          <div key={x.label} style={{ padding: '22px 16px', background: C.card, borderLeft: i>0 ? `1px solid ${C.ink}` : 'none' }}>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: C.inkMute, textTransform: 'uppercase' }}>{x.label}</div>
            <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{x.zh}</div>
            <div style={{ fontFamily: display, fontSize: 52, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 10 }}>{x.v}</div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: C.inkMute, marginTop: 4 }}>GRAMS</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}`, padding: '14px 0', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>Total after feed</div>
          <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>喂养后总量</div>
        </div>
        <div style={{ fontFamily: display, fontSize: 38, fontWeight: 500, letterSpacing: '-0.03em' }}>
          {feed.total}<span style={{ fontFamily: mono, fontSize: 13, color: C.inkMute, marginLeft: 5 }}>g</span>
        </div>
      </div>

      <div style={{ fontFamily: zh, fontSize: 13, color: C.inkSoft, lineHeight: 1.7, padding: '14px 16px', background: C.card, border: `1px solid ${C.ruleSoft}`, borderLeft: `3px solid ${C.accent}` }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.accent, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 6 }}>Memo</div>
        取 <strong style={{ fontFamily: mono, fontWeight: 600, color: C.ink }}>{seedStarter}g</strong> 旧种，加粉和水。静置至峰值（4–6h），取 <strong style={{ fontFamily: mono, fontWeight: 600, color: C.ink }}>{feed.needed}g</strong> 用于配方，剩 <strong style={{ fontFamily: mono, fontWeight: 600, color: C.ink }}>{feed.buffer}g</strong> 作下次火种。
      </div>
    </div>
  );
}

function P2({ C, display, zh, mono, steps, completedSteps, setCompletedSteps, openStepId, setOpenStepId, currentStepId, progress }) {
  const markComplete = (stepId) => {
    const idx = steps.findIndex(s => s.id === stepId);
    const next = steps.slice(idx + 1).find(s => !completedSteps[s.id]);
    setCompletedSteps(p => ({ ...p, [stepId]: true }));
    setOpenStepId(next ? next.id : null);
  };
  const undoStep = (stepId) => {
    setCompletedSteps(p => { const n = { ...p }; delete n[stepId]; return n; });
  };
  const resetAll = () => {
    if (progress.completed === 0) return;
    if (window.confirm('重置所有流程进度？\nReset all step progress?')) {
      setCompletedSteps({});
      setOpenStepId(steps[0]?.id || null);
    }
  };
  return (
    <div style={{ padding: '22px 28px 0' }}>
      <div style={{ borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}`, padding: '14px 0', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Progress · 进度</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.inkSoft, marginTop: 4, letterSpacing: '0.05em' }}>{progress.completed} / {progress.total} steps</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <button onClick={resetAll} disabled={progress.completed === 0} style={{
              background: 'transparent', border: `1px solid ${progress.completed === 0 ? C.ruleSoft : C.ink}`,
              color: progress.completed === 0 ? C.inkMute : C.ink,
              fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
              padding: '6px 10px', cursor: progress.completed === 0 ? 'not-allowed' : 'pointer',
              alignSelf: 'center',
            }}>↻ Reset</button>
            <div style={{ fontFamily: display, fontSize: 54, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em' }}>
              {progress.percent}<span style={{ fontFamily: mono, fontSize: 17, color: C.inkMute }}>%</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, marginTop: 10, border: `1px solid ${C.ink}` }}>
          {steps.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 8, borderRight: `1px solid ${C.ruleSoft}`,
              background: completedSteps[s.id] ? C.ink : s.id === currentStepId ? C.accent : 'transparent',
            }}/>
          ))}
        </div>
      </div>

      {steps.map((s, i) => {
        const done = completedSteps[s.id];
        const isCurrent = s.id === currentStepId;
        const isOpen = openStepId === s.id;
        const hasModInjection = (s.stageIngredients || []).length > 0;
        const prevIncomplete = steps.slice(0, i).find(p => !completedSteps[p.id]);
        const locked = !done && !!prevIncomplete;
        const prevIdx = prevIncomplete ? steps.findIndex(p => p.id === prevIncomplete.id) : -1;
        return (
          <div key={s.id} onClick={() => setOpenStepId(isOpen ? null : s.id)}
            style={{
              marginBottom: -1, border: `1px solid ${C.ink}`, cursor: 'pointer',
              background: done ? 'transparent' : (isCurrent ? C.card : 'transparent'),
              opacity: done && !isOpen ? 0.42 : 1, position: 'relative',
            }}>
            <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 72px', alignItems: 'stretch' }}>
              <div style={{ borderRight: `1px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? C.ink : (isCurrent ? C.ink : 'transparent'), color: done ? C.bg : (isCurrent ? C.bg : C.ink) }}>
                <div style={{ fontFamily: display, fontWeight: 500, fontSize: 22 }}>{String(i+1).padStart(2,'0')}</div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: zh, fontSize: 15, fontWeight: 500, textDecoration: done ? 'line-through' : 'none' }}>{s.title}</div>
                  {isCurrent && <span style={{ fontFamily: mono, fontSize: 8, color: C.accent, border: `1px solid ${C.accent}`, padding: '1px 5px', letterSpacing: '0.2em' }}>NOW</span>}
                  {hasModInjection && !done && <span style={{ fontFamily: mono, fontSize: 8, color: C.ink, border: `1px solid ${C.ink}`, padding: '1px 5px', letterSpacing: '0.2em' }}>+ MOD</span>}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 3 }}>{s.subtitle}</div>
              </div>
              <div style={{ padding: '12px 14px', textAlign: 'right', borderLeft: `1px dashed ${C.ruleSoft}` }}>
                <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600 }}>{s.time}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.inkMute, letterSpacing: '0.15em', marginTop: 2 }}>{s.temp}</div>
              </div>
            </div>
            {isOpen && !done && (
              <div style={{ borderTop: `1px solid ${C.ruleSoft}`, padding: '12px 14px 14px 66px', background: C.card }}>
                {s.tips.map((t, j) => (
                  <div key={j} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', fontFamily: zh, fontSize: 13, lineHeight: 1.7, color: C.inkSoft, marginBottom: 4 }}>
                    <span style={{ fontFamily: mono, fontSize: 10, color: C.accent, letterSpacing: '0.1em' }}>{String(j+1).padStart(2,'0')}</span>
                    <span>{t}</span>
                  </div>
                ))}
                {locked ? (
                  <div style={{ marginTop: 12, padding: '8px 12px', border: `1px dashed ${C.ruleSoft}`, background: 'transparent' }}>
                    <div style={{ fontFamily: mono, fontSize: 9, color: C.inkMute, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 3 }}>
                      Locked · 需先完成
                    </div>
                    <div style={{ fontFamily: zh, fontSize: 12, color: C.inkSoft }}>
                      请先完成第 <strong style={{ fontFamily: mono, color: C.ink }}>{String(prevIdx+1).padStart(2,'0')}</strong> 步：<strong style={{ color: C.ink }}>{prevIncomplete.title}</strong>
                    </div>
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); markComplete(s.id); }}
                    style={{ marginTop: 10, padding: '8px 16px', background: C.ink, color: C.bg, border: 0, fontFamily: mono, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Mark complete ✓
                  </button>
                )}
              </div>
            )}
            {isOpen && done && (
              <div style={{ borderTop: `1px solid ${C.ruleSoft}`, padding: '12px 14px 14px 66px', background: C.card, opacity: 1 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.inkMute, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 8 }}>
                  ✓ Completed · 已完成
                </div>
                <button onClick={(e) => { e.stopPropagation(); undoStep(s.id); setOpenStepId(s.id); }}
                  style={{ padding: '6px 12px', background: 'transparent', color: C.ink, border: `1px solid ${C.ink}`, fontFamily: mono, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  ↶ Undo
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textAlign: 'center', padding: '28px 0 40px', textTransform: 'uppercase' }}>
        — end —
      </div>
    </div>
  );
}

window.V2 = V2;
