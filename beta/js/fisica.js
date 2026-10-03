/* J y la Lava: las reglas del mundo (física). No toca la página: los bots la usan sin navegador. */
'use strict';

/* ---------- Mundo ---------- */
const H = 450, LAVA_Y = 402, RISE_DELAY = 1.5;
const DROP_SHAKE = 0.5, DROP_G = 1400, DROP_LEN = 22;
const MW = 26, MH = 24, STOMP_V = 380;
const FIRE_V = 150, FIRE_RANGE = 300, FIRE_SIGHT = 440, FIRE_WARN = 0.9;
const LASER_WARN = 0.6;
const G = 1500, JUMP_V = 560, RUN = 185, MAX_FALL = 900;
const PW = 22, PH = 42, STEP = 1 / 120;

function newPlayer() {
  return { x: level.start.x, y: level.start.y, vx: 0, vy: 0, onGround: true, face: 1, coyote: 0, buffer: 0 };
}
function newRun() {
  return { p: newPlayer(), stars: [false, false, false], status: 'play', lava: LAVA_Y, t: 0,
    ceil: level.crush ? level.crush.y0 : -9999,
    floor: level.floor ? level.floor.y0 : 9999,
    drops: level.drops.map(x => ({ x, state: 'idle', t: 0, y: 0, vy: 0 })),
    monsters: level.monsters.map(m => ({ x: m.sx !== undefined ? m.sx : m.dir > 0 ? m.x0 : m.x1, dir: m.dir, alive: true, fireT: FIRE_WARN + 0.4, sight: false })),
    fires: [] };
}

function hits(p, pl) {
  return p.x < pl.x + pl.w && p.x + PW > pl.x && p.y < pl.y + pl.h && p.y + PH > pl.y;
}

/* Los pinchos son triángulos: J los toca solo si pasa por donde hay punta. */
function spikeHit(p, sp) {
  if (p.y >= sp.y) return false;
  const h = sp.h || 14, elev = sp.y - (p.y + PH);
  if (elev >= h - 3) return false;
  const xL = p.x + 2, xR = p.x + PW - 2;
  if (xR <= sp.x || xL >= sp.x + sp.w) return false;
  const n = Math.max(1, Math.round(sp.w / 12)), tw = sp.w / n;
  for (let i = 0; i < n; i++) {
    const a = sp.x + i * tw, cx = a + tw / 2;
    const l = Math.max(xL, a), r = Math.min(xR, a + tw);
    if (l >= r) continue;
    const d = (l <= cx && r >= cx) ? 0 : Math.min(Math.abs(l - cx), Math.abs(r - cx));
    if (h * (1 - d / (tw / 2)) - 3 > elev) return true;
  }
  return false;
}

/* Láseres: los que tienen "on" y "off" se prenden y se apagan; avisan titilando antes de prenderse. */
function laserPhase(lz, t) { const c = lz.on + lz.off; return ((t + (lz.t0 || 0)) % c + c) % c; }
function laserOn(lz, t) { return !lz.on || laserPhase(lz, t) < lz.on; }
function laserWarn(lz, t) { return !!lz.on && laserPhase(lz, t) > lz.on + lz.off - LASER_WARN; }
function laserHit(p, lz) {
  if (lz.h) return p.x + PW - 2 > lz.x - 3 && p.x + 2 < lz.x + 3 && p.y < lz.y + lz.h && p.y + PH > lz.y;
  return p.x + PW - 2 > lz.x && p.x + 2 < lz.x + lz.w && p.y < lz.y + 2 && p.y + PH > lz.y - 2;
}

/* Un paso de física. Devuelve los eventos que pasaron. */
function tick(g, inp, dt) {
  const ev = [], p = g.p;
  if (g.status !== 'play') return ev;

  // En los niveles con "rise" la lava sube de a poco, hasta quedar justo debajo de la meta.
  g.t += dt;
  if (level.rise && g.t > RISE_DELAY) g.lava = Math.max(level.goalY + 25, g.lava - level.rise * dt);
  // En los niveles con "crush" un techo de pinchos baja de a poco hasta el piso.
  if (level.crush && g.t > RISE_DELAY) g.ceil = Math.min(LAVA_Y, g.ceil + level.crush.speed * dt);
  // En los niveles con "floor" un piso de pinchos sube desde la lava hasta cerrarse contra el techo.
  if (level.floor && g.t > RISE_DELAY) {
    g.floor -= level.floor.speed * dt;
    if (g.floor < g.ceil) g.floor = g.ceil = (g.floor + g.ceil) / 2;
  }

  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const target = dir * RUN, acc = (p.onGround ? 2600 : 1500) * dt;
  if (p.vx < target) p.vx = Math.min(target, p.vx + acc);
  else if (p.vx > target) p.vx = Math.max(target, p.vx - acc);
  if (dir) p.face = dir;

  p.coyote = p.onGround ? 0.1 : Math.max(0, p.coyote - dt);
  p.buffer = inp.jump ? 0.13 : Math.max(0, p.buffer - dt);
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = -JUMP_V; p.buffer = 0; p.coyote = 0; p.onGround = false; ev.push('jump');
  }
  p.vy = Math.min(MAX_FALL, p.vy + G * dt);

  p.x += p.vx * dt;
  if (p.x < 0) { p.x = 0; p.vx = 0; }
  if (p.x > level.w - PW) { p.x = level.w - PW; p.vx = 0; }
  for (const pl of level.platforms) {
    if (hits(p, pl)) {
      if (p.vx > 0) p.x = pl.x - PW; else if (p.vx < 0) p.x = pl.x + pl.w;
      p.vx = 0;
    }
  }

  const fallV = p.vy, wasAir = !p.onGround;
  p.y += p.vy * dt;
  p.onGround = false;
  for (const pl of level.platforms) {
    if (hits(p, pl)) {
      if (p.vy > 0) { p.y = pl.y - PH; p.onGround = true; } else { p.y = pl.y + pl.h; }
      p.vy = 0;
    }
  }
  if (wasAir && p.onGround && fallV > 250) ev.push('land');

  const cx = p.x + PW / 2, cy = p.y + PH / 2;
  level.stars.forEach((st, i) => {
    if (!g.stars[i] && Math.abs(cx - st.x) < PW / 2 + 12 && Math.abs(cy - st.y) < PH / 2 + 12) {
      g.stars[i] = true; ev.push('star' + i);
    }
  });

  // Monstruos: van y vienen. Si J les cae encima los aplasta y rebota; si los toca de costado, pierde.
  for (let i = 0; i < g.monsters.length; i++) {
    const m = g.monsters[i], def = level.monsters[i];
    if (!m.alive) continue;
    // Los de fuego escupen cuando J está cerca y a la izquierda. Antes de escupir se frenan, miran a J
    // y avisan con la boca prendida.
    if (def.fire) {
      const dx = m.x - (p.x + PW);
      m.sight = dx > -10 && dx < FIRE_SIGHT;
      if (!m.sight) m.fireT = FIRE_WARN + 0.4;
      else if ((m.fireT -= dt) <= 0) {
        m.fireT = def.fire;
        g.fires.push({ x: m.x - 4, x0: m.x - 4, y: def.y - 13 });
        ev.push('fire' + i);
      }
    }
    const charging = def.fire && m.sight && m.fireT < FIRE_WARN;
    if (def.speed && !charging) {
      m.x += m.dir * def.speed * dt;
      if (m.x <= def.x0) { m.x = def.x0; m.dir = 1; } else if (m.x >= def.x1) { m.x = def.x1; m.dir = -1; }
    }
    const top = def.y - MH;
    if (p.x + PW - 3 > m.x + 2 && p.x + 3 < m.x + MW - 2 && p.y + PH > top + 2 && p.y < def.y) {
      if (p.vy > 0 && p.y + PH - top < 16) { m.alive = false; p.vy = -STOMP_V; p.onGround = false; ev.push('stomp' + i); }
      else { g.status = 'dead'; ev.push('bitten'); return ev; }
    }
  }
  // Bolas de fuego: van derecho hacia la izquierda, a la altura de las rodillas de J. Se apagan solas o contra una piedra.
  for (let i = g.fires.length - 1; i >= 0; i--) {
    const f = g.fires[i];
    f.x -= FIRE_V * dt;
    if (f.x0 - f.x > FIRE_RANGE || level.platforms.some(pl => f.x > pl.x && f.x < pl.x + pl.w && f.y > pl.y && f.y < pl.y + pl.h)) {
      g.fires.splice(i, 1); continue;
    }
    if (f.x + 6 > p.x + 3 && f.x - 6 < p.x + PW - 3 && f.y + 5 > p.y + 2 && f.y - 5 < p.y + PH) {
      g.status = 'dead'; ev.push('burned'); return ev;
    }
  }
  // Pinchos flojos: empiezan a temblar con la anticipación justa para caerle encima a quien no frena.
  for (let i = 0; i < g.drops.length; i++) {
    const d = g.drops[i], floor = level.dropFloor[i];
    if (d.state === 'idle') {
      const fallT = Math.sqrt(2 * Math.max(1, floor - PH - (g.ceil + 6)) / DROP_G);
      if (cx > d.x - (DROP_SHAKE + fallT) * RUN && cx < d.x + 20) { d.state = 'shake'; d.t = DROP_SHAKE; ev.push('dropshake'); }
    } else if (d.state === 'shake') {
      d.t -= dt;
      if (d.t <= 0) { d.state = 'fall'; d.y = g.ceil + 6; d.vy = 0; }
    } else if (d.state === 'fall') {
      d.vy += DROP_G * dt; d.y += d.vy * dt;
      if (p.x + PW - 2 > d.x - 6 && p.x + 2 < d.x + 6 && p.y < d.y && p.y + PH > d.y - DROP_LEN) {
        g.status = 'dead'; ev.push('spiked'); return ev;
      }
      if (d.y >= floor) { d.state = 'gone'; ev.push('dropland' + i); }
    }
  }
  for (const sp of level.spikes) {
    if (spikeHit(p, sp)) { g.status = 'dead'; ev.push('spiked'); return ev; }
  }
  for (const lz of level.lasers) {
    if (laserOn(lz, g.t) && laserHit(p, lz)) { g.status = 'dead'; ev.push('zapped'); return ev; }
  }
  if (p.y < g.ceil - 2 || p.y + PH > g.floor + 2) { g.status = 'dead'; ev.push('spiked'); return ev; }
  if (p.y + PH > g.lava + 16) { g.status = 'dead'; ev.push('dead'); }
  else if (p.onGround && (level.custom ? Math.abs(cx - level.goalX) < 30 && Math.abs(p.y + PH - level.goalY) < 2 : cx >= level.goalX - 4)) {
    g.status = 'won'; ev.push('won');
  }
  return ev;
}
