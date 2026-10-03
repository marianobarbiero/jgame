/* J y la Lava: los niveles (lo que más cambia cuando el nene dicta uno nuevo) y el armado de "Tu nivel". */
'use strict';

const LEVELS = [
  {
    name: 'Nivel 1', sub: 'Las piedritas', w: 2680,
    sky: ['#120d18', '#261426', '#5a2414'],
    // Sin "h": columna de piedra que sale de la lava. Con "h": piedra flotante.
    platforms: [
      { x: 0,    y: 330, w: 240 },
      { x: 320,  y: 330, w: 70 },
      { x: 470,  y: 300, w: 60 },
      { x: 620,  y: 320, w: 60 },
      { x: 770,  y: 270, w: 56 },
      { x: 930,  y: 330, w: 70 },
      { x: 1090, y: 345, w: 50 },
      { x: 1250, y: 345, w: 50 },
      { x: 1385, y: 295, w: 50 },
      { x: 1520, y: 245, w: 50 },
      { x: 1655, y: 195, w: 56 },
      { x: 1790, y: 160, w: 90, h: 20 },
      { x: 1765, y: 335, w: 135 },
      { x: 1985, y: 335, w: 125 },
      { x: 2205, y: 315, w: 50 },
      { x: 2350, y: 335, w: 330 }
    ],
    spikes: [],
    stars: [ { x: 798, y: 190 }, { x: 1195, y: 228 }, { x: 1835, y: 82 } ],
    start: { x: 70, y: 330 - PH }, goalX: 2560, goalY: 335
  },
  {
    name: 'Nivel 2', sub: 'Los pinchos', w: 2790,
    sky: ['#0e0f1f', '#1f1a3a', '#5a1f1c'],
    platforms: [
      { x: 0,    y: 330, w: 220 },
      { x: 300,  y: 330, w: 70 },
      { x: 450,  y: 320, w: 150 },
      { x: 640,  y: 330, w: 90 },
      { x: 780,  y: 330, w: 170 },
      { x: 1030, y: 310, w: 210 },
      { x: 1320, y: 330, w: 80 },
      { x: 1450, y: 300, w: 180 },
      { x: 1645, y: 270, w: 90 },
      { x: 1780, y: 180, w: 100, h: 20 },
      { x: 1770, y: 350, w: 260 },
      { x: 2085, y: 330, w: 170 },
      { x: 2330, y: 310, w: 70 },
      { x: 2470, y: 330, w: 320 }
    ],
    // Sector con pinchos arriba de una piedra: "y" es el borde de arriba de la piedra.
    spikes: [
      { x: 545,  y: 320, w: 55 },
      { x: 780,  y: 330, w: 40 },
      { x: 1115, y: 310, w: 45 },
      { x: 1570, y: 300, w: 60 },
      { x: 1845, y: 180, w: 35 },
      { x: 2085, y: 330, w: 35 },
      { x: 2590, y: 330, w: 50 }
    ],
    stars: [ { x: 572, y: 245 }, { x: 1137, y: 235 }, { x: 1808, y: 100 } ],
    start: { x: 70, y: 330 - PH }, goalX: 2710, goalY: 330
  },
  {
    name: 'Nivel 3', sub: 'Pinchos altos', w: 2940,
    sky: ['#0b1512', '#14291f', '#5a2414'],
    platforms: [
      { x: 0,    y: 330, w: 420 },
      { x: 500,  y: 330, w: 70 },
      { x: 640,  y: 320, w: 400 },
      { x: 1090, y: 330, w: 300 },
      { x: 1470, y: 300, w: 80 },
      { x: 1620, y: 270, w: 90 },
      { x: 1755, y: 180, w: 190, h: 20 },
      { x: 1745, y: 350, w: 585 },
      { x: 2400, y: 330, w: 70 },
      { x: 2520, y: 330, w: 420 }
    ],
    // "h" es la altura del pincho. Estos son altos: hay que saltarlos por arriba.
    spikes: [
      { x: 250,  y: 330, w: 24, h: 46 },
      { x: 760,  y: 320, w: 24, h: 46 },
      { x: 890,  y: 320, w: 24, h: 46 },
      { x: 1090, y: 330, w: 24, h: 46 },
      { x: 1250, y: 330, w: 24, h: 66 },
      { x: 1850, y: 180, w: 24, h: 46 },
      { x: 2180, y: 350, w: 24, h: 46 },
      { x: 2680, y: 330, w: 24, h: 66 }
    ],
    stars: [ { x: 772, y: 235 }, { x: 1262, y: 235 }, { x: 1862, y: 95 } ],
    start: { x: 70, y: 330 - PH }, goalX: 2850, goalY: 330
  },
  {
    // "rise": cuántos píxeles por segundo sube la lava. El camino va subiendo hacia la meta.
    name: 'Nivel 4', sub: 'La lava sube', w: 3410, rise: 4.5,
    banner: '¡La lava sube! ¡Apurate!', hint: 'Saltá las bolas de fuego',
    sky: ['#1a0b0d', '#34140f', '#6a2a12'],
    platforms: [
      { x: 0,    y: 340, w: 380 },
      { x: 450,  y: 310, w: 80 },
      { x: 590,  y: 290, w: 580 },
      { x: 1200, y: 350, w: 50 },
      { x: 1260, y: 260, w: 80 },
      { x: 1390, y: 250, w: 320 },
      { x: 1780, y: 220, w: 80 },
      { x: 1920, y: 200, w: 580 },
      { x: 2570, y: 180, w: 80 },
      { x: 2710, y: 170, w: 700 }
    ],
    spikes: [
      { x: 230,  y: 340, w: 24, h: 46 },
      { x: 730,  y: 290, w: 24, h: 46 },
      { x: 1390, y: 250, w: 24, h: 46 },
      { x: 1560, y: 250, w: 24, h: 66 },
      { x: 2060, y: 200, w: 24, h: 46 },
      { x: 2860, y: 170, w: 24, h: 66 }
    ],
    // Monstruitos de fuego: caminan de x0 a x1 y cada "fire" segundos escupen una bola de fuego hacia J.
    monsters: [
      { x0: 940,  x1: 1040, y: 290, speed: 40, dir: -1, fire: 3.0 },
      { x0: 2270, x1: 2370, y: 200, speed: 50, dir: -1, fire: 2.8 },
      { x0: 3060, x1: 3160, y: 170, speed: 60, dir: 1, fire: 2.6 }
    ],
    stars: [ { x: 1225, y: 320 }, { x: 1572, y: 155 }, { x: 2872, y: 75 } ],
    start: { x: 60, y: 340 - PH }, goalX: 3320, goalY: 170
  },
  {
    // "crush": techo de pinchos. Arranca con las puntas en y0 y baja "speed" píxeles por segundo.
    // El camino va bajando, así J siempre tiene lugar para saltar si no se queda quieto.
    name: 'Nivel 5', sub: 'Techo de pinchos', w: 3695, crush: { y0: 14, speed: 2.6 },
    banner: '¡Los pinchos bajan! ¡Apurate!', hint: 'Ojo: los pinchos rojos se caen',
    sky: ['#0d0d16', '#1c1b2e', '#5a2414'],
    platforms: [
      { x: 0,    y: 220, w: 400 },
      { x: 480,  y: 230, w: 90 },
      { x: 655,  y: 240, w: 520 },
      { x: 1265, y: 260, w: 80 },
      { x: 1435, y: 275, w: 80 },
      { x: 1600, y: 290, w: 620 },
      { x: 2315, y: 305, w: 80 },
      { x: 2485, y: 320, w: 90 },
      { x: 2665, y: 330, w: 520 },
      { x: 3275, y: 340, w: 420 }
    ],
    spikes: [],
    // "drops": pinchos flojos del techo (rojos). Tiemblan y se caen cuando J se acerca.
    // Cada x cae en el centro de un pincho del techo (14 * n + 7).
    drops: [315, 903, 1841, 1953, 2905, 3507],
    stars: [ { x: 1020, y: 155 }, { x: 2090, y: 205 }, { x: 3030, y: 245 } ],
    start: { x: 60, y: 220 - PH }, goalX: 3610, goalY: 340
  },
  {
    // Techo que baja ("crush") y piso de pinchos que sube ("floor") hasta cerrarse.
    // El camino va por el medio, casi a la misma altura todo el tiempo.
    name: 'Nivel 6', sub: 'La trampa', w: 3085,
    crush: { y0: 14, speed: 3.6 }, floor: { y0: 410, speed: 2.85 },
    banner: '¡Los pinchos se cierran! ¡Apurate!',
    sky: ['#120b18', '#231233', '#5a2414'],
    platforms: [
      { x: 0,    y: 300, w: 300 },
      { x: 385,  y: 300, w: 90 },
      { x: 560,  y: 290, w: 90 },
      { x: 735,  y: 300, w: 300 },
      { x: 1125, y: 285, w: 80 },
      { x: 1290, y: 270, w: 90 },
      { x: 1470, y: 290, w: 90 },
      { x: 1645, y: 300, w: 110 },
      { x: 1785, y: 345, w: 80 },
      { x: 1865, y: 300, w: 300 },
      { x: 2255, y: 310, w: 80 },
      { x: 2420, y: 295, w: 80 },
      { x: 2590, y: 305, w: 80 },
      { x: 2755, y: 300, w: 330 }
    ],
    spikes: [],
    stars: [ { x: 900, y: 215 }, { x: 1400, y: 185 }, { x: 1810, y: 315 } ],
    start: { x: 60, y: 300 - PH }, goalX: 2990, goalY: 300
  },
  {
    // "monsters": caminan de x0 a x1 (borde izquierdo del monstruo) arriba de la piedra que está en "y".
    // Tocarlos de costado hace perder; caerles encima los aplasta.
    name: 'Nivel 7', sub: 'Los monstruos', w: 3780,
    banner: '¡Cuidado con los monstruos!', hint: 'Saltales encima para aplastarlos', music: true,
    sky: ['#170a14', '#31112a', '#5a2414'],
    platforms: [
      { x: 0,    y: 330, w: 420 },
      { x: 500,  y: 330, w: 90 },
      { x: 670,  y: 320, w: 560 },
      { x: 1310, y: 300, w: 80 },
      { x: 1470, y: 300, w: 620 },
      { x: 2170, y: 270, w: 90 },
      { x: 2305, y: 180, w: 190, h: 20 },
      { x: 2295, y: 350, w: 585 },
      { x: 2960, y: 330, w: 80 },
      { x: 3120, y: 330, w: 660 }
    ],
    // Pinchos muy altos: casi tan altos como el salto de J. Hay que saltar justo antes.
    spikes: [
      { x: 1110, y: 320, w: 14, h: 84 },
      { x: 1980, y: 300, w: 14, h: 84 },
      { x: 3550, y: 330, w: 14, h: 84 }
    ],
    monsters: [
      { x0: 200,  x1: 320,  y: 330, speed: 45, dir: -1 },
      { x0: 800,  x1: 930,  y: 320, speed: 50, dir: -1 },
      { x0: 1600, x1: 1790, y: 300, speed: 70, dir: 1 },
      { x0: 2405, x1: 2465, y: 180, speed: 35, dir: 1 },
      { x0: 2730, x1: 2780, y: 350, speed: 40, dir: -1 },
      { x0: 3250, x1: 3360, y: 330, speed: 60, dir: -1 }
    ],
    stars: [ { x: 880, y: 235 }, { x: 1700, y: 215 }, { x: 2475, y: 140 } ],
    start: { x: 60, y: 330 - PH }, goalX: 3690, goalY: 330
  },
  {
    // "lasers": con "h" es vertical (de y hacia abajo); con "w" es horizontal (de x hacia la derecha).
    // Con "on" y "off" se prende y se apaga (segundos); "t0" corre el momento. Sin "on" está siempre prendido.
    name: 'Nivel 8', sub: 'Los láseres', w: 3760,
    banner: '¡Cuidado con los láseres!', hint: 'Pasá cuando están apagados',
    sky: ['#0a0f1c', '#13223a', '#5a2414'],
    platforms: [
      { x: 0,    y: 330, w: 420 },
      { x: 500,  y: 330, w: 90 },
      { x: 670,  y: 320, w: 600 },
      { x: 1350, y: 300, w: 80 },
      { x: 1510, y: 300, w: 620 },
      { x: 2210, y: 270, w: 90 },
      { x: 2345, y: 180, w: 190, h: 20 },
      { x: 2335, y: 350, w: 585 },
      { x: 3000, y: 330, w: 80 },
      { x: 3160, y: 330, w: 600 }
    ],
    spikes: [],
    lasers: [
      { x: 300,  y: 0,   h: 330, on: 1.2, off: 1.6 },
      { x: 790,  y: 304, w: 50 },
      { x: 1000, y: 0,   h: 320, on: 1.0, off: 1.4, t0: 0.5 },
      { x: 1120, y: 304, w: 50 },
      { x: 1650, y: 238, w: 180, on: 1.6, off: 1.4 },
      { x: 1990, y: 0,   h: 300, on: 1.2, off: 1.4, t0: 0.7 },
      { x: 2420, y: 0,   h: 180, on: 1.3, off: 1.2 },
      { x: 2600, y: 0,   h: 350, on: 1.0, off: 1.0 },
      { x: 2760, y: 0,   h: 350, on: 1.0, off: 1.0, t0: 1.0 },
      { x: 3300, y: 308, w: 50, on: 1.5, off: 1.5 },
      { x: 3520, y: 0,   h: 330, on: 0.8, off: 1.2 }
    ],
    stars: [ { x: 815, y: 240 }, { x: 1740, y: 205 }, { x: 2490, y: 140 } ],
    start: { x: 60, y: 330 - PH }, goalX: 3670, goalY: 330
  }
];
LEVELS.forEach(lv => {
  lv.platforms.forEach(p => { p.float = !!p.h; if (!p.h) p.h = H - p.y + 40; });
  lv.drops = lv.drops || [];
  lv.monsters = lv.monsters || [];
  lv.lasers = lv.lasers || [];
  // Hasta dónde cae cada pincho flojo: la piedra que tiene abajo, o la lava.
  lv.dropFloor = lv.drops.map(x => {
    const under = lv.platforms.filter(p => x >= p.x && x <= p.x + p.w).map(p => p.y);
    return under.length ? Math.min(...under) : LAVA_Y + 30;
  });
});
let levelIdx = 0, level = LEVELS[0];
function pickLevel(i) { levelIdx = Math.max(0, Math.min(LEVELS.length - 1, i | 0)); level = LEVELS[levelIdx]; }

/* ---------- Tu nivel (editor) ----------
   El nivel propio es una grilla de bloques de 40 x 40: 10 filas (0 arriba) y ED_COLS columnas.
   "cells" guarda qué hay en cada casillero ("x,y" -> piedra, pincho, estrella, monstruo, fuego o láser). */
const ED = 40, ED_ROWS = 10, ED_COLS = 90;
function defaultEd() {
  const cells = {};
  for (let x = 0; x <= 5; x++) cells[x + ',8'] = 'rock';
  for (let x = 22; x <= 27; x++) cells[x + ',8'] = 'rock';
  return { cells, start: [1, 7], goal: [25, 7] };
}
function buildCustom(ed) {
  const at = (x, y) => ed.cells[x + ',' + y];
  const lv = { name: ed.name || 'Tu nivel', sub: 'Lo hiciste vos', custom: true, banner: '¡Tu nivel!',
    sky: ['#0f1a17', '#1c2b25', '#5a2414'], platforms: [], spikes: [], stars: [], monsters: [], lasers: [], drops: [], dropFloor: [] };
  let right = Math.max(ed.start[0], ed.goal[0]);
  for (let y = 0; y < ED_ROWS; y++) {
    for (let x = 0; x < ED_COLS; x++) {
      const k = at(x, y);
      if (!k) continue;
      right = Math.max(right, x);
      if (k === 'rock') {                                   // piedras pegadas en la misma fila: una sola piedra larga
        let n = 1; while (at(x + n, y) === 'rock') n++;
        lv.platforms.push({ x: x * ED, y: y * ED, w: n * ED, h: ED, float: true });
        right = Math.max(right, x + n - 1); x += n - 1;
      } else if (k === 'spike') lv.spikes.push({ x: x * ED + 4, y: (y + 1) * ED, w: ED - 8, h: 22 });
      else if (k === 'star' && lv.stars.length < 3) lv.stars.push({ x: x * ED + ED / 2, y: y * ED + ED / 2 });
      else if (k === 'mon' || k === 'fire') {                // camina por la piedra de abajo, sin atravesar paredes
        let a = x, b = x;
        const floor = c => at(c, y + 1) === 'rock' && at(c, y) !== 'rock';
        if (floor(x)) { while (floor(a - 1)) a--; while (floor(b + 1)) b++; }
        const m = { x0: a * ED, x1: Math.max(a * ED, (b + 1) * ED - MW), y: (y + 1) * ED, speed: k === 'fire' ? 40 : 50, dir: -1 };
        m.sx = Math.max(m.x0, Math.min(m.x1, x * ED + (ED - MW) / 2));   // arranca donde lo pusiste
        if (!floor(x)) m.x0 = m.x1 = m.sx;
        if (k === 'fire') m.fire = 2.8;
        lv.monsters.push(m);
      } else if (k === 'laser') {                            // de arriba hasta la primera piedra de esa columna
        let yb = 1; while (yb < ED_ROWS && at(x, yb) !== 'rock') yb++;
        lv.lasers.push({ x: x * ED + ED / 2, y: 0, h: yb < ED_ROWS ? yb * ED : LAVA_Y, on: 1.2, off: 1.4, t0: (x % 3) * 0.4 });
      }
    }
  }
  lv.start = { x: ed.start[0] * ED + (ED - PW) / 2, y: (ed.start[1] + 1) * ED - PH };
  lv.goalX = ed.goal[0] * ED + ED / 2; lv.goalY = (ed.goal[1] + 1) * ED;
  lv.w = (right + 7) * ED;
  return lv;
}
function useLevel(lv) { level = lv; levelIdx = -1; }

globalThis.JGame = { tick, newRun, LEVELS, pickLevel, buildCustom, useLevel, get level() { return level; } };
