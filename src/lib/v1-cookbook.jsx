// V1 — Cookbook Manuscript
// Cream paper, Fraunces + IBM Plex Mono, letter-pressed labels,
// radial watercolor wash behind bread selector.

const { useState, useMemo, useCallback } = React;

const V1 = () => {
  const [activeTab, setActiveTab] = useState('recipe');
  const [breadType, setBreadType] = useState('sourdough');
  const [numBreads, setNumBreads] = useState(3);
  const [flavorType, setFlavorType] = useState('classic');
  const [seedStarter, setSeedStarter] = useState(60);
  const [completedSteps, setCompletedSteps] = useState({});
  const [openStepId, setOpenStepId] = useState(null);

  const recipe = useMemo(() => window.calcRecipe({ breadType, numBreads, flavorType }), [breadType, numBreads, flavorType]);
  const feed   = useMemo(() => window.calcFeed({ recipe, seedStarter }), [recipe, seedStarter]);
  const steps  = breadType === 'japanese' ? window.STEPS_JAPANESE : window.STEPS_SOURDOUGH;
  const progress = useMemo(() => {
    const c = steps.filter(s => completedSteps[s.id]).length;
    return { completed: c, total: steps.length, percent: Math.round(c/steps.length*100) };
  }, [completedSteps, steps]);
  const currentStepId = steps.find(s => !completedSteps[s.id])?.id || null;

  // ───── palette ─────
  const C = {
    paper: '#f1e9d8',
    paperDeep: '#e8dec8',
    ink: '#1d1916',
    inkSoft: '#4a3f33',
    inkMute: '#8a7a63',
    rule: 'rgba(29,25,22,0.18)',
    ruleSoft: 'rgba(29,25,22,0.08)',
    accent: '#8a3a1f', // burnt sienna
    accentSoft: 'rgba(138,58,31,0.10)',
    cream: '#faf4e4',
  };

  const serif  = '"Fraunces", "GT Sectra", Georgia, serif';
  const serifZh= '"Noto Serif SC", "Songti SC", serif';
  const mono   = '"IBM Plex Mono", "JetBrains Mono", monospace';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: C.paper, color: C.ink,
      fontFamily: serifZh, overflow: 'hidden',
    }}>
      {/* paper grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.4,
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
        )}")`,
      }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Masthead */}
        <header style={{ padding: '78px 28px 18px', position: 'relative' }}>
          <div style={{
            fontFamily: mono, fontSize: 9, letterSpacing: '0.32em',
            color: C.inkMute, textTransform: 'uppercase', marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>№ 003 · Maison</span>
            <span>MMXXVI · 春</span>
          </div>
          <div style={{ borderTop: `1px solid ${C.ink}`, borderBottom: `1px solid ${C.ink}`, padding: '18px 0 20px' }}>
            <div style={{
              fontFamily: serif, fontSize: 42, lineHeight: 0.95,
              letterSpacing: '-0.02em', fontWeight: 400,
            }}>
              <span style={{ fontStyle: 'italic' }}>Sourdough</span>
              <span style={{ fontFamily: serif, fontWeight: 500 }}> Lab.</span>
            </div>
            <div style={{
              fontFamily: mono, fontSize: 10, letterSpacing: '0.24em',
              color: C.inkSoft, textTransform: 'uppercase', marginTop: 10,
            }}>
              A Baker's Manual · 面包工坊手札
            </div>
          </div>
        </header>

        {/* Tabs — three-column ruled folio */}
        <nav style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: `1px solid ${C.ink}`, margin: '0 28px',
        }}>
          {[
            { id: 'recipe',  roman: 'I',   label: '配方', en: 'Formula' },
            { id: 'feed',    roman: 'II',  label: '喂养', en: 'Levain' },
            { id: 'process', roman: 'III', label: '流程', en: 'Method' },
          ].map((t, i) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                padding: '14px 6px 12px', textAlign: 'center',
                borderLeft: i > 0 ? `1px solid ${C.rule}` : '0',
                position: 'relative',
              }}>
              <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginBottom: 3 }}>{t.roman}</div>
              <div style={{ fontFamily: serifZh, fontSize: 15, color: activeTab === t.id ? C.ink : C.inkMute, fontWeight: 500 }}>{t.label}</div>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: C.inkMute, textTransform: 'uppercase', marginTop: 2 }}>{t.en}</div>
              {activeTab === t.id && (
                <div style={{ position: 'absolute', bottom: -1, left: '30%', right: '30%', height: 2, background: C.ink }}/>
              )}
            </button>
          ))}
        </nav>

        {/* Content scroll */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          {activeTab === 'recipe' && (
            <RecipeTab {...{C, serif, serifZh, mono, breadType, setBreadType, numBreads, setNumBreads, flavorType, setFlavorType, recipe, setCompletedSteps}}/>
          )}
          {activeTab === 'feed' && (
            <FeedTab {...{C, serif, serifZh, mono, breadType, seedStarter, setSeedStarter, feed}}/>
          )}
          {activeTab === 'process' && (
            <ProcessTab {...{C, serif, serifZh, mono, steps, completedSteps, setCompletedSteps, openStepId, setOpenStepId, currentStepId, progress}}/>
          )}
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────── Recipe Tab
function RecipeTab({ C, serif, serifZh, mono, breadType, setBreadType, numBreads, setNumBreads, flavorType, setFlavorType, recipe, setCompletedSteps }) {
  const switchType = (t) => { setBreadType(t); setCompletedSteps({}); };

  return (
    <div style={{ padding: '28px 28px 0' }}>
      {/* Radial watercolor wash + bread type selector */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {/* watercolor sun */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
          width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,158,96,0.38) 0%, rgba(212,158,96,0.22) 30%, rgba(212,158,96,0.08) 55%, transparent 72%)`,
          filter: 'blur(6px)', pointerEvents: 'none', zIndex: 0,
        }}/>
        {/* engraved rays */}
        <svg style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 260, height: 260, zIndex: 0, opacity: 0.22 }} viewBox="-130 -130 260 260">
          {Array.from({length: 36}).map((_, i) => (
            <line key={i} x1="0" y1="-60" x2="0" y2="-120"
              transform={`rotate(${i*10})`}
              stroke={C.ink} strokeWidth="0.6"/>
          ))}
          <circle r="60" fill="none" stroke={C.ink} strokeWidth="0.6"/>
          <circle r="124" fill="none" stroke={C.ink} strokeWidth="0.6" strokeDasharray="1 4"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1, padding: '8px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>
              Choose your loaf · 选择面包
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { id: 'sourdough', zh: '乡村酸种', en: 'Sourdough', fr: 'Pain de Campagne' },
              { id: 'japanese',  zh: '日式吐司', en: 'Shokupan',  fr: 'Pain de Mie' },
            ].map(b => {
              const sel = breadType === b.id;
              return (
                <button key={b.id} onClick={() => switchType(b.id)}
                  style={{
                    background: sel ? C.cream : 'rgba(250,244,228,0.45)',
                    border: `1px solid ${sel ? C.ink : C.rule}`,
                    padding: '18px 14px 16px', cursor: 'pointer', textAlign: 'center',
                    position: 'relative', borderRadius: 2,
                    boxShadow: sel ? `2px 3px 0 0 ${C.ink}` : 'none',
                    transition: 'all 120ms',
                  }}>
                  <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginBottom: 6 }}>{b.fr}</div>
                  <div style={{ fontFamily: serifZh, fontSize: 17, fontWeight: 500, marginBottom: 2 }}>{b.zh}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.22em', color: C.inkSoft, textTransform: 'uppercase' }}>{b.en}</div>
                  {sel && <div style={{ position: 'absolute', top: 6, right: 8, fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.accent }}>✓ selected</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flavor (sourdough only) */}
      {breadType === 'sourdough' && (
        <div style={{ marginBottom: 26 }}>
          <SectionLabel C={C} serif={serif} mono={mono} kicker="§ 01" title="风味" en="Flavor variation"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { id: 'classic', zh: '经典原味', en: 'Classic' },
              { id: 'tomato',  zh: '番茄罗勒', en: 'Tomato · Basil' },
            ].map(f => {
              const sel = flavorType === f.id;
              return (
                <button key={f.id} onClick={() => setFlavorType(f.id)}
                  style={{
                    background: sel ? C.ink : 'transparent', color: sel ? C.paper : C.ink,
                    border: `1px solid ${C.ink}`, padding: '11px 10px', cursor: 'pointer',
                    fontFamily: serifZh, fontSize: 13,
                  }}>
                  <div>{f.zh}</div>
                  <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 10, opacity: 0.7, marginTop: 2 }}>{f.en}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity — broadsheet numeral */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel C={C} serif={serif} mono={mono} kicker="§ 02" title="数量" en={breadType === 'japanese' ? 'Loaves of shokupan' : 'Loaves to bake'}/>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1px solid ${C.ink}`, padding: '6px 10px', background: C.cream, borderRadius: 2,
        }}>
          <Stepper icon="−" onClick={() => setNumBreads(Math.max(1, numBreads-1))} C={C}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 56, lineHeight: 1, fontFeatureSettings: '"lnum"' }}>
              {String(numBreads).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginTop: 2 }}>
              {breadType === 'japanese' ? 'loaves / 条' : 'loaves / 个'}
            </div>
          </div>
          <Stepper icon="+" onClick={() => setNumBreads(numBreads+1)} C={C}/>
        </div>
      </div>

      {/* Ingredient ledger */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel C={C} serif={serif} mono={mono} kicker="§ 03" title="配方清单" en="Ingredients" suffix={`Hydration ${recipe.hydration}%`}/>
        <div style={{ borderTop: `1.5px solid ${C.ink}`, borderBottom: `1.5px solid ${C.ink}` }}>
          {breadType === 'japanese' ? (
            <>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="高筋粉 · 汤种" en="Bread flour (tangzhong)" value={recipe.flourTangzhong} note="预留损耗"/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="牛奶 · 汤种" en="Milk (tangzhong)" value={recipe.milkTangzhong} note="3 条 = 2 盒 400ml"/>
              <Divider C={C}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="高筋面粉" en="Bread flour" value={recipe.flour} note="蛋白质 > 12.5%"/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="阿洛酮糖" en="Allulose" value={recipe.allulose}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="海盐" en="Sea salt" value={recipe.salt}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="即发干酵母" en="Instant yeast" value={recipe.yeast}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="全蛋液" en="Whole egg" value={recipe.egg} note="撕拉关键"/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="冰牛奶" en="Cold milk" value={recipe.milk}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="奶粉" en="Milk powder" value={recipe.milkPowder}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="无盐黄油" en="Unsalted butter" value={recipe.butter} note="软化后加"/>
            </>
          ) : (
            <>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="T65 高筋粉" en="T65 flour"  value={recipe.flour}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="水"         en="Water"      value={recipe.water}  note={`预留 ${recipe.reservedWater}g`}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="鲁邦种"     en="Levain"     value={recipe.starter}/>
              <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="盐"         en="Sea salt"   value={recipe.salt}/>
              {flavorType === 'tomato' && (
                <>
                  <Divider C={C}/>
                  <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="风干番茄" en="Sun-dried tomato" value={recipe.tomato}/>
                  <Ledger C={C} serif={serif} serifZh={serifZh} mono={mono} name="罗勒碎"   en="Basil"            value={recipe.basil}/>
                </>
              )}
            </>
          )}
        </div>
        {/* total line */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '16px 2px 0',
        }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>Total Mass</div>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: C.inkSoft, marginTop: 2 }}>面团总重</div>
          </div>
          <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {recipe.totalWeight}
            <span style={{ fontFamily: mono, fontSize: 13, color: C.inkMute, marginLeft: 6, letterSpacing: '0.1em' }}>G</span>
          </div>
        </div>
      </div>

      {/* colophon */}
      <div style={{
        textAlign: 'center', padding: '18px 0 28px',
        borderTop: `1px solid ${C.rule}`, marginTop: 10,
      }}>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.inkMute }}>
          "Bread, of the soul." —— 手作的艺术
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ C, serif, mono, kicker, title, en, suffix }) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>{kicker} · {en}</div>
        <div style={{ fontFamily: serif, fontSize: 19, marginTop: 3, fontWeight: 500 }}>
          {title}
        </div>
      </div>
      {suffix && (
        <div style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.18em', color: C.ink,
          textTransform: 'uppercase', border: `1px solid ${C.ink}`, padding: '4px 7px',
        }}>{suffix}</div>
      )}
    </div>
  );
}

function Stepper({ icon, onClick, C }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.ink}`,
      background: 'transparent', color: C.ink, cursor: 'pointer',
      fontFamily: 'Georgia, serif', fontSize: 22, lineHeight: 1,
    }}>{icon}</button>
  );
}

function Ledger({ C, serif, serifZh, mono, name, en, value, note }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', padding: '11px 0', borderBottom: `1px dotted ${C.rule}` }}>
      <div>
        <div style={{ fontFamily: serifZh, fontSize: 14, color: C.ink, fontWeight: 500 }}>{name}</div>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginTop: 1 }}>
          {en}{note ? <span> · {note}</span> : null}
        </div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 500, color: C.ink, letterSpacing: '0.02em' }}>
        {value}<span style={{ fontSize: 10, color: C.inkMute, marginLeft: 3 }}>g</span>
      </div>
    </div>
  );
}

function Divider({ C }) {
  return <div style={{ height: 1, background: C.ink, opacity: 0.35, margin: '4px 0' }}/>;
}

// ───────────────────────────────────────────────── Feed Tab
function FeedTab({ C, serif, serifZh, mono, breadType, seedStarter, setSeedStarter, feed }) {
  if (breadType === 'japanese') {
    return (
      <div style={{ padding: '40px 28px' }}>
        <div style={{
          border: `1px solid ${C.ink}`, padding: '34px 20px', textAlign: 'center',
          background: 'rgba(250,244,228,0.5)', borderRadius: 2,
        }}>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.inkMute, marginBottom: 8 }}>nota bene</div>
          <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.01em' }}>No feed required.</div>
          <div style={{ fontFamily: serifZh, fontSize: 14, color: C.inkSoft, lineHeight: 1.7 }}>
            日式吐司使用 <em style={{ fontFamily: serif, fontStyle: 'italic', color: C.accent }}>商业酵母</em>，<br/>
            无需提前喂养鲁邦种。
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase', marginTop: 16 }}>
            — proceed to method —
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: '28px 28px 0' }}>
      <SectionLabel C={C} serif={serif} mono={mono} kicker="§ 01" title="旧种数量" en="Seed amount"/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1px solid ${C.ink}`, padding: '6px 10px', background: C.cream, borderRadius: 2, marginBottom: 26,
      }}>
        <Stepper icon="−" onClick={() => setSeedStarter(Math.max(1, seedStarter-1))} C={C}/>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: serif, fontSize: 50, fontWeight: 400, lineHeight: 1 }}>
            {seedStarter}
            <span style={{ fontFamily: mono, fontSize: 14, color: C.inkMute, marginLeft: 4 }}>g</span>
          </div>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginTop: 3 }}>existing starter</div>
        </div>
        <Stepper icon="+" onClick={() => setSeedStarter(seedStarter+1)} C={C}/>
      </div>

      <SectionLabel C={C} serif={serif} mono={mono} kicker="§ 02" title="1:1 喂养方案" en="Feed formula"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <FeedBig C={C} serif={serif} mono={mono} label="加 T65" en="Add flour"  value={feed.flour}/>
        <FeedBig C={C} serif={serif} mono={mono} label="加 水"  en="Add water"  value={feed.water}/>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1.5px solid ${C.ink}`, borderBottom: `1.5px solid ${C.ink}`,
        padding: '14px 0', marginBottom: 20,
      }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>after feed</div>
          <div style={{ fontFamily: serifZh, fontSize: 14, marginTop: 2 }}>喂养后总量</div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>
          {feed.total}
          <span style={{ fontFamily: mono, fontSize: 12, color: C.inkMute, marginLeft: 5 }}>G</span>
        </div>
      </div>

      <div style={{
        fontFamily: serifZh, fontSize: 13, color: C.inkSoft, lineHeight: 1.75,
        padding: 16, background: 'rgba(138,58,31,0.06)',
        borderLeft: `3px solid ${C.accent}`,
      }}>
        <div style={{ fontFamily: serif, fontStyle: 'italic', color: C.accent, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Recipe note</div>
        取 <em style={{ fontFamily: mono, fontStyle: 'normal', color: C.ink }}>{seedStarter}g</em> 旧种，加入粉和水混合。静置发酵至峰值（约 4–6 小时）后，取 <em style={{ fontFamily: mono, fontStyle: 'normal', color: C.ink }}>{feed.needed}g</em> 用于配方，剩余约 <em style={{ fontFamily: mono, fontStyle: 'normal', color: C.ink }}>{feed.buffer}g</em> 作为下次的火种。
      </div>
    </div>
  );
}

function FeedBig({ C, serif, mono, label, en, value }) {
  return (
    <div style={{
      border: `1px solid ${C.ink}`, padding: '18px 14px', textAlign: 'center',
      background: C.cream,
    }}>
      <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginBottom: 4 }}>{en}</div>
      <div style={{ fontFamily: 'serifZh', fontSize: 12, color: C.inkSoft, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: 46, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, marginTop: 6 }}>GRAMS</div>
    </div>
  );
}

// ───────────────────────────────────────────────── Process Tab
function ProcessTab({ C, serif, serifZh, mono, steps, completedSteps, setCompletedSteps, openStepId, setOpenStepId, currentStepId, progress }) {
  return (
    <div style={{ padding: '24px 28px 0' }}>
      {/* progress — typographic */}
      <div style={{ borderTop: `1.5px solid ${C.ink}`, borderBottom: `1.5px solid ${C.ink}`, padding: '14px 0 18px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.inkMute, textTransform: 'uppercase' }}>Progress</div>
            <div style={{ fontFamily: serifZh, fontSize: 13, marginTop: 2 }}>进度</div>
          </div>
          <div style={{ fontFamily: serif, fontSize: 40, fontWeight: 500, lineHeight: 1 }}>
            {progress.percent}<span style={{ fontFamily: mono, fontSize: 16, color: C.inkMute }}>%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, height: 5, background: completedSteps[s.id] ? C.ink : C.ruleSoft,
              border: s.id === currentStepId ? `1px solid ${C.accent}` : 'none', boxSizing: 'border-box',
            }}/>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: C.inkMute, marginTop: 8 }}>
          {progress.completed} of {progress.total} steps complete
        </div>
      </div>

      {/* steps */}
      {steps.map((s, i) => {
        const done = completedSteps[s.id];
        const isCurrent = s.id === currentStepId;
        const isOpen = openStepId === s.id;
        return (
          <div key={s.id} style={{ marginBottom: 14, position: 'relative' }}>
            <div onClick={() => setOpenStepId(isOpen ? null : s.id)}
              style={{
                border: `1px solid ${isCurrent ? C.ink : C.rule}`,
                background: done ? 'transparent' : (isCurrent ? C.cream : 'rgba(250,244,228,0.5)'),
                padding: '16px 16px 14px',
                cursor: 'pointer', position: 'relative',
                opacity: done ? 0.5 : 1,
              }}>
              {isCurrent && (
                <div style={{ position: 'absolute', top: -1, left: -1, width: 3, bottom: -1, background: C.accent }}/>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* numeral */}
                <div style={{
                  fontFamily: serif, fontStyle: 'italic', fontWeight: 400,
                  fontSize: 28, color: done ? C.inkMute : C.ink, lineHeight: 0.9, width: 36,
                  textDecoration: done ? 'line-through' : 'none',
                }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: serifZh, fontSize: 16, fontWeight: 500, textDecoration: done ? 'line-through' : 'none' }}>{s.title}</div>
                      <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.inkMute, marginTop: 2 }}>{s.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: mono, fontSize: 11, color: C.ink, letterSpacing: '0.05em' }}>{s.time}</div>
                      <div style={{ fontFamily: mono, fontSize: 9, color: C.inkMute, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 1 }}>{s.temp}</div>
                    </div>
                  </div>

                  {isOpen && !done && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dotted ${C.rule}` }}>
                      {s.tips.map((t, j) => (
                        <div key={j} style={{
                          display: 'grid', gridTemplateColumns: '18px 1fr', gap: 8,
                          fontFamily: serifZh, fontSize: 13, color: C.inkSoft, lineHeight: 1.65, marginBottom: 6,
                        }}>
                          <span style={{ fontFamily: serif, fontStyle: 'italic', color: C.accent, fontSize: 12 }}>{String.fromCharCode(97+j)}.</span>
                          <span>{t}</span>
                        </div>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); setCompletedSteps(p => ({...p, [s.id]: true})); setOpenStepId(null); }}
                        style={{
                          marginTop: 10, width: '100%', padding: '10px 0',
                          background: C.ink, color: C.paper, border: 0, cursor: 'pointer',
                          fontFamily: mono, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                        }}>
                        ✓ Mark complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.inkMute }}>— fin —</div>
      </div>
    </div>
  );
}

window.V1 = V1;
