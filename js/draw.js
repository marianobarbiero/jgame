/* J y la Lava: todo lo que se dibuja en el canvas. */
'use strict';

/* ---------- Dibujo ---------- */
function rnd(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  scale = canvas.height / H;
  viewW = canvas.width / scale;
}

function drawSpires(par, color, baseH, seed, spacing) {
  const off = cam * par;
  ctx.fillStyle = color;
  for (let i = Math.floor(off / spacing) - 1; i * spacing - off < viewW + spacing; i++) {
    const h = baseH * (0.45 + rnd(i + seed) * 0.9), w = 46 + rnd(i + seed + 7) * 64, x = i * spacing - off;
    ctx.fillRect(x, H - h, w, h);
    ctx.fillRect(x + w * 0.22, H - h - 16, w * 0.5, 16);
    ctx.fillRect(x + w * 0.36, H - h - 28, w * 0.22, 12);
  }
}
function drawStalactites() {
  const off = cam * 0.5, spacing = 64;
  ctx.fillStyle = '#1f1626';
  for (let i = Math.floor(off / spacing) - 1; i * spacing - off < viewW + spacing; i++) {
    const h = 14 + rnd(i + 91) * 52, w = 20 + rnd(i + 33) * 30, x = i * spacing - off;
    ctx.fillRect(x, 0, w, h * 0.55);
    ctx.fillRect(x + w * 0.25, 0, w * 0.5, h * 0.8);
    ctx.fillRect(x + w * 0.4, 0, w * 0.2, h);
  }
}

function drawPlatform(pl) {
  if (pl.x + pl.w < cam - 4 || pl.x > cam + viewW + 4) return;
  const T = 16, ph = Math.min(pl.h, H - pl.y);
  if (pl.float) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(pl.x + 4, pl.y + ph, pl.w - 8, 4); }
  for (let ty = 0; ty < ph; ty += T) {
    for (let tx = 0; tx < pl.w; tx += T) {
      const w = Math.min(T, pl.w - tx), h = Math.min(T, ph - ty);
      const r = rnd(pl.x * 0.37 + tx * 1.3 + ty * 7.7);
      ctx.fillStyle = r < 0.33 ? '#6c7186' : r < 0.66 ? '#7a8096' : '#62677b';
      ctx.fillRect(pl.x + tx, pl.y + ty, w, h);
      ctx.fillStyle = 'rgba(20,14,26,.36)';
      ctx.fillRect(pl.x + tx, pl.y + ty + h - 2, w, 2);
      ctx.fillRect(pl.x + tx + w - 2, pl.y + ty, 2, h);
    }
  }
  ctx.fillStyle = '#c9cede'; ctx.fillRect(pl.x, pl.y, pl.w, 4);
  ctx.fillStyle = '#9da2b6'; ctx.fillRect(pl.x, pl.y + 4, pl.w, 2);
}

function drawSpikes(sp) {
  if (sp.x + sp.w < cam - 4 || sp.x > cam + viewW + 4) return;
  const n = Math.max(1, Math.round(sp.w / 12)), tw = sp.w / n, h = sp.h || 14;
  for (let i = 0; i < n; i++) {
    const x0 = sp.x + i * tw;
    ctx.beginPath(); ctx.moveTo(x0, sp.y); ctx.lineTo(x0 + tw / 2, sp.y - h); ctx.lineTo(x0 + tw, sp.y); ctx.closePath();
    ctx.fillStyle = '#eef1f8'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x0 + tw / 2, sp.y - h); ctx.lineTo(x0 + tw, sp.y); ctx.lineTo(x0 + tw * 0.6, sp.y); ctx.closePath();
    ctx.fillStyle = '#8f96ab'; ctx.fill();
  }
  ctx.fillStyle = '#e5484d'; ctx.fillRect(sp.x, sp.y, sp.w, 4);
}

function drawCeiling() {
  const c = run.ceil;
  if (c < -1000) return;
  const x0 = Math.floor(cam / 14) * 14 - 14, x1 = cam + viewW + 14, base = c - 16;
  if (base > -20) {
    ctx.fillStyle = '#2b2233'; ctx.fillRect(x0, -20, x1 - x0, base + 20);
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    for (let y = base - 22; y > -20; y -= 16) ctx.fillRect(x0, y, x1 - x0, 2);
    ctx.fillStyle = '#e5484d'; ctx.fillRect(x0, base - 4, x1 - x0, 4);
  }
  for (let x = x0; x < x1; x += 14) {
    const d = run.drops.find(q => q.x === x + 7);
    if (d && (d.state === 'fall' || d.state === 'gone')) continue;       // ese pincho ya se soltó
    const sx = d && d.state === 'shake' && !reduceMotion ? Math.sin(time * 70) * 1.6 : 0;
    const tip = d ? c + 6 : c;
    ctx.beginPath(); ctx.moveTo(x + sx, base); ctx.lineTo(x + 7 + sx, tip); ctx.lineTo(x + 14 + sx, base); ctx.closePath();
    ctx.fillStyle = d ? '#ff8a8a' : '#eef1f8'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 7 + sx, tip); ctx.lineTo(x + 14 + sx, base); ctx.lineTo(x + 8.5 + sx, base); ctx.closePath();
    ctx.fillStyle = d ? '#c0353a' : '#8f96ab'; ctx.fill();
  }
  for (const d of run.drops) {
    if (d.state !== 'fall') continue;
    ctx.beginPath(); ctx.moveTo(d.x - 7, d.y - DROP_LEN); ctx.lineTo(d.x, d.y); ctx.lineTo(d.x + 7, d.y - DROP_LEN); ctx.closePath();
    ctx.fillStyle = '#ff8a8a'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 7, d.y - DROP_LEN); ctx.lineTo(d.x + 1.5, d.y - DROP_LEN); ctx.closePath();
    ctx.fillStyle = '#c0353a'; ctx.fill();
  }
}

function drawFloorSpikes() {
  const f = run.floor;
  if (f > 9000) return;
  const x0 = Math.floor(cam / 14) * 14 - 14, x1 = cam + viewW + 14, base = f + 16;
  ctx.fillStyle = '#2b2233'; ctx.fillRect(x0, base, x1 - x0, H - base + 20);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  for (let y = base + 20; y < H + 20; y += 16) ctx.fillRect(x0, y, x1 - x0, 2);
  ctx.fillStyle = '#e5484d'; ctx.fillRect(x0, base, x1 - x0, 4);
  for (let x = x0; x < x1; x += 14) {
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + 7, f); ctx.lineTo(x + 14, base); ctx.closePath();
    ctx.fillStyle = '#eef1f8'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 7, f); ctx.lineTo(x + 14, base); ctx.lineTo(x + 8.5, base); ctx.closePath();
    ctx.fillStyle = '#8f96ab'; ctx.fill();
  }
}

function drawMonster(m, def) {
  if (!m.alive || m.x + MW < cam - 4 || m.x > cam + viewW + 4) return;
  const x = Math.round(m.x), y = def.y - MH;
  const charging = def.fire && m.sight && m.fireT < FIRE_WARN;
  const step = reduceMotion || !def.speed || charging ? 0 : Math.sin(time * 10 + def.x0);
  if (def.fire) {                                              // llamita en la cabeza
    const fl = reduceMotion ? 0 : Math.round(Math.sin(time * 14 + def.x0) * 1.5);
    ctx.fillStyle = '#ff7a1a'; ctx.fillRect(x + 9, y - 8 + fl, 8, 8);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 11, y - 5 + fl, 4, 5);
  }
  ctx.fillStyle = '#2a1420';                                   // cuernos y patas
  ctx.fillRect(x + 3, y - 3, 4, 6); ctx.fillRect(x + 19, y - 3, 4, 6);
  ctx.fillRect(x + 4, y + 20 - (step > 0.3 ? 2 : 0), 6, 4); ctx.fillRect(x + 16, y + 20 - (step < -0.3 ? 2 : 0), 6, 4);
  ctx.fillStyle = def.fire ? '#b8401a' : '#7a2233'; ctx.fillRect(x, y + 3, MW, 18);  // cuerpo
  ctx.fillStyle = def.fire ? '#d85a24' : '#9c2f3f'; ctx.fillRect(x + 2, y + 1, MW - 4, 4);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 4, y + 6, 7, 6); ctx.fillRect(x + 15, y + 6, 7, 6);   // ojos
  ctx.fillStyle = '#1c0d12';
  const look = m.dir > 0 && !charging ? 4 : 0;
  ctx.fillRect(x + 4 + look, y + 8, 3, 4); ctx.fillRect(x + 15 + look, y + 8, 3, 4);
  ctx.fillRect(x + 3, y + 4, 8, 2); ctx.fillRect(x + 15, y + 4, 8, 2);                              // cejas enojadas
  if (charging) {                                                                                    // boca prendida: va a escupir
    const on = reduceMotion || Math.sin(time * 40) > -0.3;
    ctx.fillStyle = '#1c0d12'; ctx.fillRect(x + 3, y + 13, 14, 7);
    ctx.fillStyle = on ? '#ffd23f' : '#ff7a1a'; ctx.fillRect(x + 5, y + 15, 10, 3);
    return;
  }
  ctx.fillStyle = '#ff7a1a'; ctx.fillRect(x + 5, y + 15, 16, 3);                                    // boca
  ctx.fillStyle = '#f6efe6'; ctx.fillRect(x + 7, y + 15, 3, 2); ctx.fillRect(x + 12, y + 16, 3, 2); ctx.fillRect(x + 17, y + 15, 3, 2);
}

function drawLaser(lz) {
  const vert = !!lz.h;
  if ((vert ? lz.x + 10 : lz.x + lz.w + 10) < cam || lz.x - 10 > cam + viewW) return;
  const on = state === 'edit' || laserOn(lz, run.t), warn = !on && laserWarn(lz, run.t);
  const blink = reduceMotion || Math.sin(time * 40) > 0;
  ctx.fillStyle = '#3a4256';                                    // aparatos de las puntas
  if (vert) { ctx.fillRect(lz.x - 8, lz.y, 16, 12); ctx.fillRect(lz.x - 6, lz.y + lz.h - 5, 12, 5); }
  else { ctx.fillRect(lz.x - 8, lz.y - 7, 8, 14); ctx.fillRect(lz.x + lz.w, lz.y - 7, 8, 14); }
  ctx.fillStyle = on ? '#ff2d55' : warn && blink ? '#ff8aa0' : '#5a2030';   // lucecita
  if (vert) ctx.fillRect(lz.x - 3, lz.y + 7, 6, 4); else { ctx.fillRect(lz.x - 6, lz.y - 2, 4, 4); ctx.fillRect(lz.x + lz.w + 2, lz.y - 2, 4, 4); }
  if (!on && !(warn && blink)) return;
  const x0 = lz.x, y0 = vert ? lz.y + 12 : lz.y, len = vert ? lz.h - 17 : lz.w;
  if (warn) {                                                   // aviso: rayita finita que titila
    ctx.fillStyle = 'rgba(255,45,85,.55)';
    if (vert) ctx.fillRect(x0 - 0.5, y0, 1, len); else ctx.fillRect(x0, y0 - 0.5, len, 1);
    return;
  }
  const w = reduceMotion ? 0 : Math.sin(time * 50 + lz.x) * 0.6;
  ctx.fillStyle = 'rgba(255,45,85,.35)';
  if (vert) ctx.fillRect(x0 - 4 - w, y0, 8 + 2 * w, len); else ctx.fillRect(x0, y0 - 4 - w, len, 8 + 2 * w);
  ctx.fillStyle = '#ff2d55';
  if (vert) ctx.fillRect(x0 - 2, y0, 4, len); else ctx.fillRect(x0, y0 - 2, len, 4);
  ctx.fillStyle = '#ffe3ea';
  if (vert) ctx.fillRect(x0 - 0.75, y0, 1.5, len); else ctx.fillRect(x0, y0 - 0.75, len, 1.5);
}

function drawFire(f) {
  if (f.x < cam - 30 || f.x > cam + viewW + 30) return;
  const x = Math.round(f.x), y = Math.round(f.y), fl = reduceMotion ? 0 : Math.round(Math.sin(time * 30 + f.x0) * 1.5);
  ctx.globalAlpha = 0.6; ctx.fillStyle = '#e2540f'; ctx.fillRect(x + 7, y - 4 + fl, 12, 8);   // cola
  ctx.globalAlpha = 0.35; ctx.fillRect(x + 18, y - 3 - fl, 10, 5);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ff7a1a'; ctx.fillRect(x - 8, y - 7, 16, 14);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 6, y - 4, 9, 8);
  ctx.fillStyle = '#fff6c9'; ctx.fillRect(x - 5, y - 3, 4, 4);
}

function drawGoal() {
  const gx = level.goalX, gy = level.goalY;
  ctx.fillStyle = '#3b2f45'; ctx.fillRect(gx - 8, gy - 8, 20, 8);
  ctx.fillStyle = '#e9e2d6'; ctx.fillRect(gx, gy - 100, 4, 92);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(gx - 2, gy - 106, 8, 8);
  for (let i = 0; i < 8; i++) {
    const wy = reduceMotion ? 0 : Math.sin(time * 5 + i * 0.7) * 2.5 * (i / 8);
    for (let j = 0; j < 4; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#1c1422' : '#f6efe6';
      ctx.fillRect(gx + 4 + i * 6, gy - 98 + j * 6 + wy, 6, 6);
    }
  }
}

function drawStar(st, i) {
  const bob = reduceMotion ? 0 : Math.sin(time * 3 + i * 1.7) * 4, cx = st.x, cy = st.y + bob;
  ctx.fillStyle = 'rgba(255,210,63,.16)';
  ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 6 : 13;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd23f'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#b97f0a'; ctx.stroke();
  ctx.fillStyle = '#fff6c9'; ctx.fillRect(cx - 3, cy - 5, 3, 3);
}

function drawJ(p, cheer) {
  const x = Math.round(p.x), y = Math.round(p.y);
  const running = p.onGround && Math.abs(p.vx) > 20;
  const sw = running ? Math.round(Math.sin(time * 18) * 3) : 0;
  const air = !p.onGround || cheer;
  // piernas
  ctx.fillStyle = '#2b3a8f';
  ctx.fillRect(x + 3 + (air ? -2 : sw), y + 30, 7, 12);
  ctx.fillRect(x + 12 + (air ? 2 : -sw), y + 30, 7, 12);
  ctx.fillStyle = '#161d4d';
  ctx.fillRect(x + 3 + (air ? -2 : sw), y + 39, 7, 3);
  ctx.fillRect(x + 12 + (air ? 2 : -sw), y + 39, 7, 3);
  // brazos
  const ay = air ? y + 5 : y + 16;
  ctx.fillStyle = '#239a5a';
  ctx.fillRect(x - 2, ay, 4, 12); ctx.fillRect(x + 20, ay, 4, 12);
  ctx.fillStyle = '#f1bf8a';
  ctx.fillRect(x - 2, air ? ay : ay + 9, 4, 3); ctx.fillRect(x + 20, air ? ay : ay + 9, 4, 3);
  // buzo con la J
  ctx.fillStyle = '#2fbf71'; ctx.fillRect(x + 2, y + 15, 18, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 7, y + 18, 9, 2); ctx.fillRect(x + 11, y + 18, 3, 10);
  ctx.fillRect(x + 7, y + 26, 5, 2); ctx.fillRect(x + 7, y + 24, 2, 2);
  // cabeza y gorra
  ctx.fillStyle = '#f1bf8a'; ctx.fillRect(x + 2, y, 18, 15);
  ctx.fillStyle = '#e5484d'; ctx.fillRect(x + 1, y - 3, 20, 6);
  ctx.fillRect(p.face > 0 ? x + 17 : x - 3, y + 1, 8, 3);
  ctx.fillStyle = '#22182a';
  const eh = !reduceMotion && time % 3.3 < 0.13 ? 1 : 3;            // parpadea cada tanto
  if (p.face > 0) { ctx.fillRect(x + 10, y + 9 - eh, 3, eh); ctx.fillRect(x + 15, y + 9 - eh, 3, eh); ctx.fillRect(x + 11, y + 11, 6, 1); }
  else { ctx.fillRect(x + 4, y + 9 - eh, 3, eh); ctx.fillRect(x + 9, y + 9 - eh, 3, eh); ctx.fillRect(x + 5, y + 11, 6, 1); }
}

function lavaTop(wx, k) {
  if (reduceMotion) return run.lava + k;
  return run.lava + k + Math.sin(wx * 0.03 + time * 2) * 3 + Math.sin(wx * 0.071 - time * 1.3) * 2;
}
function drawLava() {
  const layers = [['#ffd23f', 0], ['#ff7a1a', 4], ['#e2540f', 16], ['#b23a0a', 32]];
  const x0 = Math.floor(cam / 6) * 6;
  for (const [color, k] of layers) {
    ctx.fillStyle = color;
    for (let wx = x0; wx < cam + viewW + 6; wx += 6) {
      const y = Math.round(lavaTop(wx, k));
      ctx.fillRect(wx, y, 6, H - y + 4);
    }
  }
  if (reduceMotion) return;
  const b0 = Math.floor(cam / 83) - 1;
  for (let i = b0; i * 83 < cam + viewW + 83; i++) {
    const ph = (time * (0.35 + rnd(i + 5) * 0.4) + rnd(i)) % 1;
    const bx = i * 83 + rnd(i + 2) * 60, sz = 4 + rnd(i + 3) * 5;
    ctx.fillStyle = ph < 0.85 ? '#ffe98a' : '#fff6c9';
    ctx.fillRect(Math.round(bx), Math.round(run.lava + 22 - ph * 16), sz, sz);
  }
}
function drawEmbers() {
  if (reduceMotion) return;
  for (let i = 0; i < 26; i++) {
    const span = viewW + 40;
    const x = (((rnd(i) * 1400 - cam * 0.8 + Math.sin(time + i) * 10) % span) + span) % span - 20;
    const rise = (time * 34 * (0.5 + rnd(i + 50)) + rnd(i + 9) * 300) % 300;
    ctx.globalAlpha = Math.max(0, 1 - rise / 300) * 0.8;
    ctx.fillStyle = i % 3 ? '#ff9f1c' : '#ffd23f';
    ctx.fillRect(x, run.lava - rise, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function draw() {
  const s = scale;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, level.sky[0]); sky.addColorStop(0.6, level.sky[1]); sky.addColorStop(1, level.sky[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, viewW + 1, H);
  drawSpires(0.25, '#21172a', 210, 11, 96);
  drawSpires(0.5, '#2c1d30', 130, 57, 120);
  drawStalactites();

  const sx = shake > 0.3 ? (Math.random() - 0.5) * shake : 0, sy = shake > 0.3 ? (Math.random() - 0.5) * shake : 0;
  const cr = Math.round(cam * s) / s;
  ctx.setTransform(s, 0, 0, s, (-cr + sx) * s, sy * s);

  drawGoal();
  level.platforms.forEach(drawPlatform);
  level.spikes.forEach(drawSpikes);
  level.lasers.forEach(drawLaser);
  run.monsters.forEach((m, i) => drawMonster(m, level.monsters[i]));
  run.fires.forEach(drawFire);
  level.stars.forEach((st, i) => { if (!run.stars[i]) drawStar(st, i); });
  if (state !== 'dead') {
    // Festeja saltando: en la bandera, saltitos; en el final del juego, saltos grandes.
    const hop = (party || state === 'won') && !reduceMotion ? Math.abs(Math.sin(time * (party ? 7 : 11))) * (party ? 16 : 9) : 0;
    drawJ(hop ? Object.assign({}, run.p, { y: run.p.y - hop }) : run.p, state === 'won');
  }
  for (const q of parts) {
    ctx.globalAlpha = Math.min(1, q.life * 2.5);
    ctx.fillStyle = q.color; ctx.fillRect(q.x, q.y, q.size, q.size);
  }
  ctx.globalAlpha = 1;

  const glow = ctx.createLinearGradient(0, run.lava - 110, 0, run.lava + 10);
  glow.addColorStop(0, 'rgba(255,122,26,0)'); glow.addColorStop(1, 'rgba(255,122,26,.42)');
  ctx.fillStyle = glow; ctx.fillRect(cr - 10, run.lava - 110, viewW + 20, 120);
  drawFloorSpikes();
  drawLava();
  drawCeiling();
  if (state === 'edit') drawGrid();

  ctx.setTransform(s, 0, 0, s, 0, 0);
  drawEmbers();
  if (toast) {                                        // aviso del nivel que se acaba de pasar
    ctx.font = '700 17px "Pixelify Sans", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, toast.t * 2);
    ctx.fillStyle = '#0d1a1c'; ctx.fillText(toast.text, viewW / 2 + 1, 63);
    ctx.fillStyle = '#5ee7f2'; ctx.fillText(toast.text, viewW / 2, 62);
    if (toast.sub) {
      ctx.fillStyle = '#0d1a1c'; ctx.fillText(toast.sub, viewW / 2 + 1, 86);
      ctx.fillStyle = '#ffd23f'; ctx.fillText(toast.sub, viewW / 2, 85);
    }
    ctx.globalAlpha = 1;
  }
  if (state === 'play' || state === 'dead' || state === 'won') {   // cronómetro
    ctx.font = '700 18px "Pixelify Sans", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'right';
    const tx = fmtT(run.t);
    ctx.fillStyle = '#0d0911'; ctx.fillText(tx, viewW - 13, 31);
    ctx.fillStyle = state === 'won' ? '#ffd23f' : '#f6efe6'; ctx.fillText(tx, viewW - 14, 30);
  }
  if (ouchT > 0 && ouch && (state === 'dead' || state === 'play' || state === 'paused')) {   // mensaje gracioso al perder
    const k = Math.min(1, (OUCH_T - ouchT) * 6);
    ctx.font = '700 ' + Math.round(22 + 8 * k) + 'px "Pixelify Sans", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, ouchT * 1.5);                       // al final se va apagando de a poco
    ctx.fillStyle = '#1c0d05'; ctx.fillText(ouch, viewW / 2 + 2, 172);
    ctx.fillStyle = '#ff8a8a'; ctx.fillText(ouch, viewW / 2, 170);
    ctx.globalAlpha = 1;
  }
  if (level.banner && state === 'play' && run.t < 3.2) {
    ctx.font = '700 24px "Pixelify Sans", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1c0d05'; ctx.fillText(level.banner, viewW / 2 + 2, 96);
    ctx.fillStyle = '#ffd23f'; ctx.fillText(level.banner, viewW / 2, 94);
    if (level.hint) {
      ctx.font = '700 17px "Pixelify Sans", "Trebuchet MS", sans-serif';
      ctx.fillStyle = '#1c0d05'; ctx.fillText(level.hint, viewW / 2 + 1, 121);
      ctx.fillStyle = '#ff8a8a'; ctx.fillText(level.hint, viewW / 2, 120);
    }
  }
}
