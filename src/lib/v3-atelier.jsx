// V3 — Japonesque Atelier
// Washi off-white, sumi black, single crimson seal. Vertical rhythm.
// Radial = ink-wash halo behind selector.

const { useState: useS3, useMemo: useM3 } = React;

const V3 = () => {
  const [activeTab, setActiveTab] = useS3('recipe');
  const [breadType, setBreadType] = useS3('sourdough');
  const [numBreads, setNumBreads] = useS3(3);
  const [flavorType, setFlavorType] = useS3('classic');
  const [seedStarter, setSeedStarter] = useS3(60);
  const [completedSteps, setCompletedSteps] = useS3({});
  const [openStepId, setOpenStepId] = useS3(null);

  const recipe = useM3(() => window.calcRecipe({ breadType, numBreads, flavorType }), [breadType, numBreads, flavorType]);
  const feed   = useM3(() => window.calcFeed({ recipe, seedStarter }), [recipe, seedStarter]);
  const steps  = breadType === 'japanese' ? window.STEPS_JAPANESE : window.STEPS_SOURDOUGH;
  const progress = useM3(() => {
    const c = steps.filter(s => completedSteps[s.id]).length;
    return { completed: c, total: steps.length, percent: Math.round(c/steps.length*100) };
  }, [completedSteps, steps]);
  const currentStepId = steps.find(s => !completedSteps[s.id])?.id || null;

  const C = {
    washi: '#ece4d3',
    washiDeep: '#ddd3bd',
    paper: '#f5efdd',
    sumi: '#1a1613',
    sumiSoft: '#3f372e',
    sumiMute: '#8a7d67',
    rule: 'rgba(26,22,19,0.16)',
    ruleSoft: 'rgba(26,22,19,0.08)',
    seal: '#a83227',
  };
  const serif = '"Cormorant Garamond", "Fraunces", Georgia, serif';
  const zh = '"Noto Serif SC", "Songti SC", serif';
  const mono = '"JetBrains Mono", monospace';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: C.washi, color: C.sumi,
      fontFamily: zh, overflow: 'hidden',
    }}>
      {/* washi texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
        )}")`,
      }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Head — vertical name + seal */}
        <header style={{ padding: '68px 28px 16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: C.sumiMute, letterSpacing: '0.05em' }}>atelier · 手工坊</div>
              <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.3, marginTop: 6 }}>
                Pain de
              </div>
              <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.3, marginTop: 6 }}>
                l'atelier.
              </div>
              <div style={{ fontFamily: zh, fontSize: 13, color: C.sumiSoft, marginTop: 8, letterSpacing: '0.1em' }}>酸 · 麵 · 工 · 房</div>
            </div>
            {/* seal */}
            <div style={{
              width: 54, height: 54, background: C.seal, color: '#f5efdd',
              display: 'grid', placeItems: 'center', transform: 'rotate(-4deg)',
              boxShadow: '1px 2px 0 rgba(168,50,39,0.25)',
              fontFamily: zh, fontWeight: 600, fontSize: 20, lineHeight: 1, letterSpacing: '0.1em',
              border: `2px solid ${C.seal}`, outline: `1px solid rgba(245,239,221,0.4)`, outlineOffset: -5,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, lineHeight: 0.95 }}>
                <span>酸</span><span>麵</span><span>工</span><span>房</span>
              </div>
            </div>
          </div>
        </header>

        {/* tabs */}
        <nav style={{ display: 'flex', borderTop: `1px solid ${C.sumi}`, borderBottom: `1px solid ${C.sumi}`, margin: '0 28px' }}>
          {[
            { id: 'recipe',  cn: '壹', label: 'Formula', zhlabel: '配方' },
            { id: 'feed',    cn: '貳', label: 'Levain',  zhlabel: '喂養' },
            { id: 'process', cn: '參', label: 'Method',  zhlabel: '流程' },
          ].map((t, i) => {
            const sel = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, background: 'transparent', border: 0,
                  borderLeft: i > 0 ? `1px solid ${C.rule}` : 'none',
                  padding: '14px 6px 12px', cursor: 'pointer', textAlign: 'center', position: 'relative',
                  color: sel ? C.sumi : C.sumiMute,
                }}>
                <div style={{ fontFamily: zh, fontSize: 16, fontWeight: sel ? 600 : 400 }}>{t.cn}</div>
                <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, marginTop: 3 }}>{t.label}</div>
                <div style={{ fontFamily: zh, fontSize: 10, marginTop: 2 }}>{t.zhlabel}</div>
                {sel && <div style={{ position: 'absolute', top: -1, left: '40%', right: '40%', height: 2, background: C.seal }}/>}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          {activeTab === 'recipe'  && <R3 {...{C, serif, zh, mono, breadType, setBreadType, numBreads, setNumBreads, flavorType, setFlavorType, recipe, setCompletedSteps}}/>}
          {activeTab === 'feed'    && <F3 {...{C, serif, zh, mono, breadType, seedStarter, setSeedStarter, feed}}/>}
          {activeTab === 'process' && <P3 {...{C, serif, zh, mono, steps, completedSteps, setCompletedSteps, openStepId, setOpenStepId, currentStepId, progress}}/>}
        </div>
      </div>
    </div>
  );
};

function InkWash({ C, size = 300 }) {
  // Ink-wash radial halo SVG
  return (
    <svg width={size} height={size} viewBox={`${-size/2} ${-size/2} ${size} ${size}`} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="inkhalo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={C.sumi} stopOpacity="0.16"/>
          <stop offset="40%" stopColor={C.sumi} stopOpacity="0.08"/>
          <stop offset="80%" stopColor={C.sumi} stopOpacity="0.02"/>
          <stop offset="100%" stopColor={C.sumi} stopOpacity="0"/>
        </radialGradient>
        <filter id="sumifx"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="10"/></filter>
      </defs>
      <circle r={size*0.45} fill="url(#inkhalo)" filter="url(#sumifx)"/>
      <circle r={size*0.35} fill="none" stroke={C.sumi} strokeOpacity="0.22" strokeWidth="0.8"/>
      <circle r={size*0.42} fill="none" stroke={C.sumi} strokeOpacity="0.14" strokeWidth="0.5" strokeDasharray="2 5"/>
    </svg>
  );
}

function R3({ C, serif, zh, mono, breadType, setBreadType, numBreads, setNumBreads, flavorType, setFlavorType, recipe, setCompletedSteps }) {
  const switchType = (t) => { setBreadType(t); setCompletedSteps({}); };
  return (
    <div style={{ padding: '26px 28px 0' }}>
      {/* Bread selector with ink wash halo */}
      <div style={{ position: 'relative', marginBottom: 30 }}>
        <div style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0 }}>
          <InkWash C={C}/>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.sumiMute }}>choisis ton pain</div>
            <div style={{ fontFamily: zh, fontSize: 11, color: C.sumiSoft, marginTop: 2, letterSpacing: '0.3em' }}>— 撰 · 面 · 包 —</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { id: 'sourdough', zh: '乡村酸种', en: 'Sourdough', sub: '天然酵種' },
              { id: 'japanese',  zh: '日式吐司', en: 'Shokupan',  sub: '湯種製法' },
            ].map((b, i) => {
              const sel = breadType === b.id;
              return (
                <button key={b.id} onClick={() => switchType(b.id)}
                  style={{
                    background: sel ? C.paper : 'rgba(245,239,221,0.5)',
                    border: `1px solid ${sel ? C.sumi : C.rule}`,
                    padding: '22px 12px 18px', cursor: 'pointer', textAlign: 'center',
                    position: 'relative', borderRadius: 1,
                    boxShadow: sel ? `inset 0 0 0 1px ${C.sumi}` : 'none',
                  }}>
                  <div style={{ fontFamily: zh, fontSize: 13, letterSpacing: '0.3em', color: C.sumiSoft, marginBottom: 10 }}>{b.sub}</div>
                  <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 500, fontStyle: i === 1 ? 'italic' : 'normal', letterSpacing: '-0.01em', lineHeight: 1 }}>{b.en}</div>
                  <div style={{ fontFamily: zh, fontSize: 13, color: C.sumiSoft, marginTop: 6 }}>{b.zh}</div>
                  {sel && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%',
                      background: C.seal, color: C.paper, display: 'grid', placeItems: 'center',
                      fontFamily: zh, fontSize: 10, fontWeight: 600,
                    }}>選</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {breadType === 'sourdough' && (
        <div style={{ marginBottom: 26 }}>
          <SH3 C={C} serif={serif} zh={zh} mono={mono} cn="壹" en="Variation" z="風味"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { id: 'classic', zh: '经典原味', en: 'Classique' },
              { id: 'tomato',  zh: '番茄罗勒', en: 'Tomate · Basilic' },
            ].map(f => {
              const sel = flavorType === f.id;
              return (
                <button key={f.id} onClick={() => setFlavorType(f.id)}
                  style={{
                    background: sel ? C.sumi : 'transparent', color: sel ? C.washi : C.sumi,
                    border: `1px solid ${C.sumi}`, padding: '13px 10px', cursor: 'pointer',
                  }}>
                  <div style={{ fontFamily: zh, fontSize: 14, fontWeight: 500 }}>{f.zh}</div>
                  <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, opacity: 0.75, marginTop: 3 }}>{f.en}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <SH3 C={C} serif={serif} zh={zh} mono={mono} cn="貳" en="Quantity" z={breadType === 'japanese' ? '條數' : '數量'}/>
        <div style={{ border: `1px solid ${C.sumi}`, background: C.paper, padding: '14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setNumBreads(Math.max(1, numBreads-1))} style={{
            width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.sumi}`, background: 'transparent',
            fontFamily: serif, fontSize: 22, cursor: 'pointer',
          }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: serif, fontSize: 62, fontWeight: 400, lineHeight: 0.9, letterSpacing: '-0.04em' }}>{numBreads}</div>
            <div style={{ fontFamily: zh, fontSize: 11, color: C.sumiMute, letterSpacing: '0.3em', marginTop: 4 }}>{breadType === 'japanese' ? '條' : '個'}</div>
          </div>
          <button onClick={() => setNumBreads(numBreads+1)} style={{
            width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.sumi}`, background: 'transparent',
            fontFamily: serif, fontSize: 22, cursor: 'pointer',
          }}>+</button>
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <SH3 C={C} serif={serif} zh={zh} mono={mono} cn="參" en="Ingredients" z="配方"
          right={<span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: C.sumiSoft, padding: '2px 7px', border: `1px solid ${C.sumi}` }}>水粉比 {recipe.hydration}%</span>}/>
        <div>
          {breadType === 'japanese' ? (
            <>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="高筋粉 · 汤种"  en="Farine · tangzhong" v={recipe.flourTangzhong}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="牛奶 · 汤种"    en="Lait · tangzhong"   v={recipe.milkTangzhong}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="高筋面粉"       en="Farine de blé"      v={recipe.flour}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="阿洛酮糖"       en="Allulose"           v={recipe.allulose}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="海盐"           en="Sel de mer"         v={recipe.salt}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="即发干酵母"     en="Levure"             v={recipe.yeast}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="全蛋液"         en="Œuf"                v={recipe.egg}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="冰牛奶"         en="Lait froid"         v={recipe.milk}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="奶粉"           en="Lait en poudre"     v={recipe.milkPowder}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="无盐黄油"       en="Beurre"             v={recipe.butter}/>
            </>
          ) : (
            <>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="T65 高筋粉" en="Farine T65" v={recipe.flour}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="水"         en="Eau"        v={recipe.water}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="鲁邦种"     en="Levain"     v={recipe.starter}/>
              <Row3 C={C} serif={serif} zh={zh} mono={mono} name="盐"         en="Sel"        v={recipe.salt}/>
              {flavorType === 'tomato' && (
                <>
                  <Row3 C={C} serif={serif} zh={zh} mono={mono} name="风干番茄" en="Tomate séchée" v={recipe.tomato}/>
                  <Row3 C={C} serif={serif} zh={zh} mono={mono} name="罗勒碎"   en="Basilic"       v={recipe.basil}/>
                </>
              )}
            </>
          )}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `2px solid ${C.sumi}`, paddingTop: 14 }}>
          <div>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.sumiMute }}>total · 合计</div>
            <div style={{ fontFamily: zh, fontSize: 13, marginTop: 2 }}>面团总重</div>
          </div>
          <div style={{ fontFamily: serif, fontSize: 46, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {recipe.totalWeight}<span style={{ fontFamily: mono, fontSize: 13, color: C.sumiMute, marginLeft: 6 }}>g</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '10px 0 32px' }}>
        <span style={{ fontFamily: serif, fontStyle: 'italic', color: C.sumiMute, fontSize: 12 }}>— </span>
        <span style={{ fontFamily: zh, fontSize: 11, color: C.sumiMute, letterSpacing: '0.3em' }}>匠 心 之 作</span>
        <span style={{ fontFamily: serif, fontStyle: 'italic', color: C.sumiMute, fontSize: 12 }}> —</span>
      </div>
    </div>
  );
}

function SH3({ C, serif, zh, mono, cn, en, z, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, borderBottom: `1px solid ${C.sumi}`, paddingBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{
          fontFamily: zh, fontSize: 12, color: C.paper, background: C.seal,
          width: 22, height: 22, display: 'grid', placeItems: 'center', fontWeight: 500,
        }}>{cn}</div>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 17, fontWeight: 500 }}>{en}</div>
        <div style={{ fontFamily: zh, fontSize: 12, color: C.sumiSoft, letterSpacing: '0.15em' }}>{z}</div>
      </div>
      {right}
    </div>
  );
}

function Row3({ C, serif, zh, mono, name, en, v }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', padding: '10px 0', borderBottom: `1px dotted ${C.rule}` }}>
      <div>
        <div style={{ fontFamily: zh, fontSize: 14, fontWeight: 500 }}>{name}</div>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.sumiMute, marginTop: 1 }}>{en}</div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600 }}>
        {v}<span style={{ fontSize: 10, color: C.sumiMute, marginLeft: 3, fontWeight: 400 }}>g</span>
      </div>
    </div>
  );
}

function F3({ C, serif, zh, mono, breadType, seedStarter, setSeedStarter, feed }) {
  if (breadType === 'japanese') {
    return (
      <div style={{ padding: '28px 28px' }}>
        <div style={{ border: `1px solid ${C.sumi}`, background: C.paper, padding: 28, textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: C.seal, color: C.paper, padding: '3px 14px', fontFamily: zh, fontSize: 11, letterSpacing: '0.3em' }}>不 適 用</div>
          <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 500, fontStyle: 'italic', marginTop: 8, letterSpacing: '-0.02em' }}>Pas de levain.</div>
          <div style={{ fontFamily: zh, fontSize: 13, color: C.sumiSoft, marginTop: 10, lineHeight: 1.7 }}>
            日式吐司使用 <em style={{ fontStyle: 'normal', color: C.seal, fontWeight: 600 }}>商业酵母</em>，<br/>无需提前喂养鲁邦种。
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: '26px 28px 0' }}>
      <SH3 C={C} serif={serif} zh={zh} mono={mono} cn="壹" en="Seed amount" z="舊種"/>
      <div style={{ border: `1px solid ${C.sumi}`, background: C.paper, padding: '14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <button onClick={() => setSeedStarter(Math.max(1, seedStarter-1))} style={{
          width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.sumi}`, background: 'transparent',
          fontFamily: serif, fontSize: 22, cursor: 'pointer',
        }}>−</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: serif, fontSize: 56, fontWeight: 400, lineHeight: 0.9, letterSpacing: '-0.04em' }}>{seedStarter}<span style={{ fontFamily: mono, fontSize: 14, color: C.sumiMute, marginLeft: 4 }}>g</span></div>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.sumiMute, marginTop: 4 }}>existing starter</div>
        </div>
        <button onClick={() => setSeedStarter(seedStarter+1)} style={{
          width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.sumi}`, background: 'transparent',
          fontFamily: serif, fontSize: 22, cursor: 'pointer',
        }}>+</button>
      </div>

      <SH3 C={C} serif={serif} zh={zh} mono={mono} cn="貳" en="Feed formula" z="喂養 1:1"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Farine', zh: '加 T65', v: feed.flour },
          { label: 'Eau',    zh: '加 水',  v: feed.water },
        ].map((x) => (
          <div key={x.label} style={{ border: `1px solid ${C.sumi}`, background: C.paper, padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.sumiMute }}>{x.label}</div>
            <div style={{ fontFamily: zh, fontSize: 12, color: C.sumiSoft, marginTop: 2, letterSpacing: '0.1em' }}>{x.zh}</div>
            <div style={{ fontFamily: serif, fontSize: 52, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 10 }}>{x.v}</div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: C.sumiMute, marginTop: 4 }}>GRAMS</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `2px solid ${C.sumi}`, borderBottom: `2px solid ${C.sumi}`, padding: '14px 0', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.sumiMute }}>total after feed</div>
          <div style={{ fontFamily: zh, fontSize: 12, marginTop: 2 }}>喂养后总量</div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 38, fontWeight: 500, letterSpacing: '-0.03em' }}>
          {feed.total}<span style={{ fontFamily: mono, fontSize: 13, color: C.sumiMute, marginLeft: 5 }}>g</span>
        </div>
      </div>

      <div style={{ fontFamily: zh, fontSize: 13, color: C.sumiSoft, lineHeight: 1.75, padding: '14px 16px', background: C.paper, borderLeft: `3px solid ${C.seal}`, border: `1px solid ${C.ruleSoft}` }}>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11, color: C.seal, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>nota · 手札</div>
        取 <strong style={{ fontFamily: mono, fontWeight: 600, color: C.sumi }}>{seedStarter}g</strong> 旧种，加粉与水。静置发酵至峰值（4–6 h）后，取 <strong style={{ fontFamily: mono, fontWeight: 600, color: C.sumi }}>{feed.needed}g</strong> 用于配方，剩余 <strong style={{ fontFamily: mono, fontWeight: 600, color: C.sumi }}>{feed.buffer}g</strong> 作下次火种。
      </div>
    </div>
  );
}

function P3({ C, serif, zh, mono, steps, completedSteps, setCompletedSteps, openStepId, setOpenStepId, currentStepId, progress }) {
  return (
    <div style={{ padding: '26px 28px 0' }}>
      <div style={{ borderTop: `2px solid ${C.sumi}`, borderBottom: `2px solid ${C.sumi}`, padding: '14px 0', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: C.sumiMute }}>progression</div>
            <div style={{ fontFamily: zh, fontSize: 12, color: C.sumiSoft, marginTop: 3 }}>进度 · {progress.completed} / {progress.total}</div>
          </div>
          <div style={{ fontFamily: serif, fontSize: 52, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {progress.percent}<span style={{ fontFamily: mono, fontSize: 16, color: C.sumiMute }}>%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, marginTop: 10 }}>
          {steps.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 4,
              background: completedSteps[s.id] ? C.sumi : s.id === currentStepId ? C.seal : C.ruleSoft,
            }}/>
          ))}
        </div>
      </div>

      {steps.map((s, i) => {
        const done = completedSteps[s.id];
        const isCurrent = s.id === currentStepId;
        const isOpen = openStepId === s.id;
        return (
          <div key={s.id} onClick={() => setOpenStepId(isOpen ? null : s.id)}
            style={{
              marginBottom: 10, cursor: 'pointer', position: 'relative',
              padding: '14px 16px 12px 48px',
              background: done ? 'transparent' : (isCurrent ? C.paper : 'rgba(245,239,221,0.4)'),
              border: `1px solid ${isCurrent ? C.sumi : C.rule}`,
              opacity: done ? 0.45 : 1,
            }}>
            {/* roman numeral seal */}
            <div style={{
              position: 'absolute', left: 10, top: 14,
              width: 26, height: 26, border: `1px solid ${isCurrent ? C.seal : C.sumi}`,
              display: 'grid', placeItems: 'center', background: isCurrent ? C.seal : 'transparent',
              color: isCurrent ? C.paper : C.sumi,
              fontFamily: serif, fontWeight: 500, fontSize: 13, fontStyle: 'italic',
            }}>
              {i+1}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <div>
                <div style={{ fontFamily: zh, fontSize: 15, fontWeight: 500, textDecoration: done ? 'line-through' : 'none' }}>{s.title}</div>
                <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.sumiMute, marginTop: 2 }}>{s.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: C.sumi }}>{s.time}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.sumiMute, letterSpacing: '0.15em', marginTop: 2 }}>{s.temp}</div>
              </div>
            </div>
            {isOpen && !done && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dotted ${C.rule}` }}>
                {s.tips.map((t, j) => (
                  <div key={j} style={{
                    display: 'grid', gridTemplateColumns: '20px 1fr', gap: 6,
                    fontFamily: zh, fontSize: 13, color: C.sumiSoft, lineHeight: 1.7, marginBottom: 4,
                  }}>
                    <span style={{ fontFamily: serif, fontStyle: 'italic', color: C.seal, fontSize: 11 }}>{String.fromCharCode(0x2160 + j)}</span>
                    <span>{t}</span>
                  </div>
                ))}
                <button onClick={(e) => { e.stopPropagation(); setCompletedSteps(p => ({...p, [s.id]: true})); setOpenStepId(null); }}
                  style={{
                    marginTop: 10, padding: '8px 18px',
                    background: C.seal, color: C.paper, border: 0, cursor: 'pointer',
                    fontFamily: zh, fontSize: 12, letterSpacing: '0.3em',
                  }}>完成 · done</button>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: C.sumiMute }}>— fin · 終 —</div>
      </div>
    </div>
  );
}

window.V3 = V3;
