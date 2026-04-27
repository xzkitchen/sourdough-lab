// ColorOrb — 色球原件（大小可变）
const { useState, useEffect, useMemo, useCallback, useRef } = React;

function ColorOrb({ flavor, size = 120, active = false, muted = false }){
  const prediction = Engine.predictBreadColor(window.BASE, flavor.modifiers);
  const bg = Engine.buildGradientBackground(prediction, flavor.modifiers);
  // Per-orb grain：小球用粗粒（低 baseFrequency），大球用细粒
  const grainFreq = size < 80 ? 0.9 : size < 150 ? 0.75 : 0.65;
  const grainOpacity = size < 80 ? 0.55 : 0.42;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size,
         transition: 'transform 420ms cubic-bezier(.2,.8,.2,1)',
         transform: active ? 'scale(1.03)' : 'scale(1)' }}>
      <div className="absolute inset-0 rounded-full overflow-hidden"
           style={{ background: bg, filter: muted ? 'saturate(0.85)' : 'none' }}>
        {/* grain layer — noise + multiply blend */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none block" aria-hidden="true"
             style={{ mixBlendMode: 'multiply', opacity: grainOpacity }}>
          <filter id={`g-${flavor.id}-${size}`}>
            <feTurbulence type="fractalNoise" baseFrequency={grainFreq} numOctaves="2" stitchTiles="stitch"/>
            <feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.10  0 0 0 0.55 0"/>
          </filter>
          <rect width="100%" height="100%" filter={`url(#g-${flavor.id}-${size})`}/>
        </svg>
        {/* subtle shine highlight */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 32% 28%, rgba(255,252,245,0.35) 0%, transparent 45%)',
        }}/>
      </div>
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        boxShadow: active
          ? 'inset 0 0 0 0.5px rgba(26,24,21,0.12), 0 10px 40px rgba(110,79,47,0.18), 0 2px 6px rgba(26,24,21,0.08)'
          : 'inset 0 0 0 0.5px rgba(26,24,21,0.10), 0 4px 16px rgba(26,24,21,0.06)',
      }}/>
    </div>
  );
}

// 面包切面预览 —— 更精致版
function BreadCrumb({ flavor, size = 260 }){
  const prediction = Engine.predictBreadColor(window.BASE, flavor.modifiers);
  const dots = useMemo(() => {
    const out = [];
    const rx = size * 0.42, ry = size * 0.72 * 0.32;
    const cx = size / 2, cy = (size * 0.72) / 2;
    flavor.modifiers.forEach((m) => {
      const mod = window.MODIFIERS[m.id];
      if (!mod || !mod.dotColor) return;
      const count = Math.max(8, Math.round(m.dose * 140));
      let seed = m.id.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7) >>> 0;
      const rng = () => { seed = (seed*1664525+1013904223) >>> 0; return seed/4294967296; };
      for (let k=0; k<count; k++){
        const r = Math.sqrt(rng()) * 0.88;
        const theta = rng() * Math.PI*2;
        out.push({
          x: cx + rx*r*Math.cos(theta),
          y: cy + ry*r*Math.sin(theta),
          rr: 1.2 + rng()*2.2,
          rot: rng()*30 - 15,
          color: Engine.hslToCss(mod.dotColor),
        });
      }
    });
    return out;
  }, [flavor, size]);

  const holes = useMemo(() => {
    const out = [];
    const rx = size * 0.38, ry = size * 0.72 * 0.28;
    const cx = size / 2, cy = (size * 0.72) / 2;
    let seed = 1234;
    const rng = () => { seed = (seed*1664525+1013904223) >>> 0; return seed/4294967296; };
    for (let i=0; i<26; i++){
      const r = Math.sqrt(rng())*0.82;
      const theta = rng() * Math.PI*2;
      out.push({
        x: cx + rx*r*Math.cos(theta),
        y: cy + ry*r*Math.sin(theta),
        rr: 1 + rng()*3,
        op: 0.10 + rng()*0.15,
      });
    }
    return out;
  }, [size]);

  const h = size * 0.72;
  const baseCss = Engine.hslToCss(prediction.base);
  const crustCss = Engine.hslToCss(prediction.crust);
  const crustEdge = Engine.hslToCss({
    h: prediction.crust.h,
    s: Math.min(70, prediction.crust.s + 10),
    l: Math.max(15, prediction.crust.l - 8),
  });

  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} role="img" aria-label="切面预览">
      <defs>
        <radialGradient id={`crumb-${flavor.id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%"  stopColor={baseCss} />
          <stop offset="78%" stopColor={baseCss} />
          <stop offset="94%" stopColor={crustCss} />
          <stop offset="100%" stopColor={crustEdge} />
        </radialGradient>
      </defs>
      <ellipse cx={size/2} cy={h/2} rx={size*0.45} ry={h*0.36}
               fill={`url(#crumb-${flavor.id})`} stroke={crustEdge} strokeWidth="1.25" />
      {holes.map((o,i) => (
        <circle key={`h${i}`} cx={o.x} cy={o.y} r={o.rr} fill="rgba(0,0,0,0.18)" opacity={o.op} />
      ))}
      {dots.map((p,i) => (
        <ellipse key={`d${i}`} cx={p.x} cy={p.y} rx={p.rr} ry={p.rr*0.8}
                 fill={p.color} transform={`rotate(${p.rot}, ${p.x}, ${p.y})`} />
      ))}
    </svg>
  );
}

// 全局导出
Object.assign(window, { ColorOrb, BreadCrumb });
