// 颜色 / 渐变 / 计算引擎 —— 来自仓库 domain 层的精简镜像
const hslToCss = ({h,s,l}, a=1) => a<1 ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;

function blendHSL(colors){
  if(!colors.length) return {h:38,s:20,l:85};
  const totalW = colors.reduce((s,c)=>s+c.w,0) || 1;
  let sS=0,lS=0,hSin=0,hCos=0;
  for(const{color,w} of colors){
    sS+=color.s*w; lS+=color.l*w;
    const r=color.h*Math.PI/180;
    hSin+=Math.sin(r)*w; hCos+=Math.cos(r)*w;
  }
  const hA = Math.atan2(hSin/totalW, hCos/totalW) * 180/Math.PI;
  return {h:Math.round((hA+360)%360), s:Math.round(sS/totalW), l:Math.round(lS/totalW)};
}

function predictBreadColor(base, selected){
  const baseColor = base.breadColor || {h:38,s:25,l:82};
  const colorantColors = [];
  for(const sel of selected){
    const mod = window.MODIFIERS[sel.id]; if(!mod) continue;
    if(mod.category!=='colorant' || !mod.breadColor) continue;
    const dose = typeof sel.dose==='number' ? sel.dose : mod.dose;
    colorantColors.push({color: mod.breadColor, w: dose*8});
  }
  const finalBase = blendHSL([{color:baseColor,w:1.0}, ...colorantColors]);
  const crust = {
    h: Math.max(25, finalBase.h - 5),
    s: Math.min(60, finalBase.s + 15),
    l: Math.max(25, finalBase.l - 18),
  };
  return {base: finalBase, crust};
}

function buildGradientBackground(prediction, modifiers=[]){
  const layers = [];
  const hotspots = [];
  for(const m of modifiers){
    const mod = window.MODIFIERS[m.id]; if(!mod) continue;
    const color = mod.breadColor || mod.dotColor;
    if(!color) continue;
    hotspots.push({color, weight: m.dose||0.05});
  }
  const slots = [
    {x:28,y:32,r:68}, {x:72,y:28,r:62}, {x:40,y:75,r:70}, {x:78,y:72,r:58}, {x:15,y:62,r:50},
  ];
  const crustSoft = {...prediction.crust, s: Math.max(12, prediction.crust.s-10)};
  const baseLayer = `linear-gradient(135deg, ${hslToCss(prediction.base)} 0%, ${hslToCss(crustSoft)} 100%)`;
  const fallback = [
    prediction.base,
    {...prediction.base, h:(prediction.base.h+30)%360, l: Math.min(95, prediction.base.l+8)},
    prediction.crust,
    {...prediction.crust, s: Math.max(10, prediction.crust.s-15), l: Math.min(90, prediction.crust.l+15)},
    {...prediction.base, h:(prediction.base.h+330)%360, l: Math.max(40, prediction.base.l-10)},
  ];
  slots.forEach((slot, i) => {
    const hot = hotspots[i]?.color || fallback[i % fallback.length];
    const color = hslToCss({h:hot.h, s:Math.min(75,hot.s+5), l:Math.min(88,Math.max(40,hot.l))});
    const transp = hslToCss({...hot, l:Math.min(95,hot.l+10)}, 0);
    layers.push(`radial-gradient(circle at ${slot.x}% ${slot.y}%, ${color} 0%, ${transp} ${slot.r}%)`);
  });
  return [...layers, baseLayer].join(', ');
}

function calcRecipe(base, numUnits, selected){
  const flour = base.baseFlour * numUnits;
  const rows = base.ingredients.map(ing => ({
    id: ing.id, name: ing.name, role: ing.role,
    weight: ing.id==='salt' ? Math.round(flour*ing.bp*10)/10 : Math.round(flour*ing.bp),
    bakersPct: ing.bp, source:'base', isHydration: !!ing.isHydration,
  }));
  let water = rows.filter(r=>r.isHydration).reduce((s,r)=>s+r.weight,0);
  const warnings = [];
  const notes = [];

  // 叠加 modifier
  const modRows = [];
  for(const sel of selected){
    const mod = window.MODIFIERS[sel.id]; if(!mod) continue;
    const dose = typeof sel.dose==='number' ? sel.dose : mod.dose;
    const weight = Math.round(flour * dose);
    modRows.push({
      id: sel.id, name: mod.name, nameLatin: mod.nameLatin,
      weight, bakersPct: dose, source:'modifier', stage: mod.stage,
    });
    if(mod.absorb){
      const add = Math.round(weight * mod.absorb);
      water += add;
      notes.push(`${mod.name} +${add}g 水（吸水补偿 ${Math.round(mod.absorb*100)}%）`);
    }
  }

  // 拆 autolyse + 预留水
  const reserved = base.defaults?.waterReservedRatio || 0;
  const wi = rows.findIndex(r => r.id === 'water');
  if(wi >= 0){
    const total = Math.round(water);
    if(reserved > 0){
      const rw = Math.round(flour*reserved);
      const aw = total - rw;
      rows.splice(wi, 1,
        { id:'water-autolyse', name:'水', role:'liquid', weight:aw, bakersPct:aw/flour, source:'base', isHydration:true },
        { id:'water-reserved', name:'预留水（后加）', role:'liquid', weight:rw, bakersPct:reserved, source:'base', isHydration:true },
      );
    } else {
      rows[wi].weight = total;
    }
  }

  const allRows = [...rows, ...modRows];
  const totalWeight = Math.round(allRows.reduce((s,r)=>s+r.weight,0));
  return {
    ingredients: allRows,
    totalWeight,
    flour: Math.round(flour),
    water: Math.round(water),
    actualHydration: water/flour,
    warnings, notes,
  };
}

function calcFeed(calc, seedStarter){
  const starter = calc.ingredients.find(i => i.id==='starter');
  if(!starter) return null;
  const need = starter.weight;
  const buffer = 60;
  const target = need + buffer;
  const mix = Math.max(0, target - seedStarter);
  const flourPart = Math.ceil(mix/2);
  const waterPart = mix - flourPart;
  return { need, seed: seedStarter, flour: flourPart, water: waterPart, total: seedStarter+flourPart+waterPart, buffer };
}

window.Engine = { hslToCss, blendHSL, predictBreadColor, buildGradientBackground, calcRecipe, calcFeed };
