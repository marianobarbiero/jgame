/* J y la Lava: estado de la partida, contadores, ganar y perder, pausa. */
'use strict';

/* ---------- Estado ---------- */
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const startOverlay = $('startOverlay'), winOverlay = $('winOverlay'), pauseOverlay = $('pauseOverlay'), myOverlay = $('myOverlay');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let run = newRun();
let state = 'ready';            // ready | play | dead | won | edit | paused
let overlayReady = false;
let diamonds = 0, soundOn = true;
let time = 0, last = 0, accum = 0, deadT = 0, shake = 0;
let cam = 0, viewW = 800, scale = 1;
let jumpQueued = false;
const input = { left: false, right: false };
const parts = [];

// Los datos guardados (ver js/storage.js).
diamonds = Math.max(0, parseInt(store.get('diamonds', 0), 10) || 0);
soundOn = store.get('sound', 1) !== 0;
// Mejor cantidad de estrellas con que se llegó a la bandera en cada nivel.
let best = store.get('best', []);
if (!Array.isArray(best)) best = [];
// Mejor tiempo (segundos) con que se llegó a la bandera en cada nivel.
let bestT = store.get('time', []);
if (!Array.isArray(bestT)) bestT = [];

// "Mis niveles": los niveles que hizo el nene. "ed" es el que se está editando o jugando.
const validEd = e => e && e.cells && Array.isArray(e.start) && Array.isArray(e.goal);
let mine = store.get('mine', null);
if (!mine || !Array.isArray(mine.list)) {
  mine = { list: [], current: null };
  const old = store.get('custom', null);                         // el único nivel propio de antes pasa a ser el primero
  if (validEd(old)) mine.list.push(Object.assign({ id: 'n1', name: 'Mi nivel 1' }, old));
  store.set('mine', mine);
}
mine.list = mine.list.filter(validEd);
let ed = mine.list.find(l => l.id === mine.current) || mine.list[0] || null;
let edTool = 'rock', edCam = 0, edScroll = 0, edPaint = false, playFrom = 'editor';
function saveMine() { if (ed) mine.current = ed.id; store.set('mine', mine); }
function newMine() {
  let n = mine.list.length + 1;
  while (mine.list.some(l => l.name === 'Mi nivel ' + n)) n++;
  const lv = Object.assign({ id: 'n' + Date.now().toString(36), name: 'Mi nivel ' + n }, defaultEd());
  mine.list.push(lv); ed = lv; saveMine();
  return lv;
}
const fmtT = t => t.toFixed(1).replace('.', ',') + ' s';

/* ---------- HUD ---------- */
function renderHud() {
  const n = run.stars.filter(Boolean).length;
  $('levelLabel').textContent = state === 'edit' ? (ed ? ed.name : 'Tu nivel') + ' · Tocá el juego para poner cosas' : level.name + ' · ' + level.sub;
  $('editChip').hidden = !level.custom || state === 'edit';
  $('hudStars').querySelectorAll('svg').forEach((el, i) => el.classList.toggle('on', run.stars[i]));
  $('hudStars').setAttribute('aria-label', 'Estrellas: ' + n + ' de 3');
  $('diamondCount').textContent = diamonds;
  $('diamondOf').hidden = diamonds >= 100;
  $('hudDiamonds').setAttribute('aria-label', 'Diamantes: ' + diamonds + (diamonds < 100 ? ' de 100' : ''));
  const cups = Math.floor(diamonds / 100);
  $('hudCup').classList.toggle('on', cups > 0);
  $('cupCount').textContent = cups > 1 ? '×' + cups : '';
  $('hudCup').setAttribute('aria-label', cups > 0 ? 'Copas: ' + cups : 'Copa: todavía no');
  const sb = $('soundBtn');
  sb.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
  sb.textContent = soundOn ? 'Sonido: sí' : 'Sonido: no';
}

/* ---------- Partículas ---------- */
function burst(x, y, n, colors, speed, up) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up || 0), life: 0.5 + Math.random() * 0.5,
      size: 3 + Math.random() * 3, color: colors[i % colors.length] });
  }
}
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i];
    q.life -= dt; q.vy += 700 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.life <= 0) parts.splice(i, 1);
  }
}

/* ---------- Flujo del juego ---------- */
let autoTimer = null, party = false, partyT = 0, toast = null;
const FIREWORK = [
  ['#ffd23f', '#fff3b0', '#ff9f1c'], ['#5ee7f2', '#c9fbff', '#2fa8c9'],
  ['#ff7a1a', '#ffd23f', '#e5484d'], ['#2fbf71', '#b6f5cf', '#f6efe6'], ['#ff8ad8', '#ffd0f0', '#c048a0']
];
function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  party = false; winOverlay.classList.remove('party');
}
function startParty() {
  party = true; partyT = 0;
  [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.14, 'square', 0.045, 0, 1.0 + i * 0.12));
  [784, 1047, 1319, 1568].forEach((f, i) => beep(f, 0.14, 'square', 0.045, 0, 1.6 + i * 0.12));
  [523, 659, 784, 1047, 2093].forEach(f => beep(f, 0.9, 'triangle', 0.04, 0, 2.2));
}
function startRun(i) {
  stopAuto(); closeEditor(); ouchT = 0;
  if (i === 'custom') { if (!ed) newMine(); useLevel(buildCustom(ed)); cam = 0; parts.length = 0; }
  else if (typeof i === 'number' && i !== levelIdx) { pickLevel(i); cam = 0; parts.length = 0; }
  if (levelIdx >= 0) store.set('level', levelIdx);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  run = newRun();
  state = 'play'; overlayReady = false; accum = 0; jumpQueued = false;
  startOverlay.hidden = true; winOverlay.hidden = true; pauseOverlay.hidden = true; myOverlay.hidden = true;
  renderHud();
  beep(660, 0.08, 'square', 0.03);
}

function showPicker() {
  stopAuto(); closeEditor(); toast = null; ouchT = 0;
  run = newRun(); state = 'ready'; overlayReady = false; parts.length = 0;
  winOverlay.hidden = true; pauseOverlay.hidden = true; myOverlay.hidden = true; startOverlay.hidden = false;
  renderBest();
  renderHud();
}
// "Mis niveles": la lista, con nombre (se puede cambiar), Jugar, Editar y Borrar (pide confirmar).
function showMine() {
  showPicker();
  startOverlay.hidden = true; myOverlay.hidden = false;
  renderMine();
}
function renderMine() {
  const box = $('myList');
  box.textContent = '';
  if (!mine.list.length) {
    const p = document.createElement('p'); p.className = 'my-empty';
    p.textContent = 'Todavía no hiciste ningún nivel. ¡Tocá "Nuevo nivel"!';
    box.appendChild(p); return;
  }
  for (const lv of mine.list) {
    const row = document.createElement('div'); row.className = 'my-row';
    const name = document.createElement('input');
    name.className = 'my-name'; name.value = lv.name; name.maxLength = 24; name.setAttribute('aria-label', 'Nombre del nivel');
    name.addEventListener('input', () => { lv.name = name.value.trim() || 'Sin nombre'; store.set('mine', mine); });
    const btn = (text, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tool ' + cls; b.textContent = text; b.addEventListener('click', fn); row.appendChild(b); return b; };
    row.appendChild(name);
    btn('Jugar', 'go', () => { ed = lv; saveMine(); playFrom = 'list'; startRun('custom'); });
    btn('Editar', '', () => { ed = lv; saveMine(); openEditor(); });
    const del = btn('Borrar', '', () => {
      if (!del.classList.contains('danger')) {                       // primer toque: pregunta
        del.classList.add('danger'); del.textContent = '¿Seguro?';
        setTimeout(() => { del.classList.remove('danger'); del.textContent = 'Borrar'; }, 3000);
        return;
      }
      mine.list = mine.list.filter(l => l !== lv);
      if (ed === lv) ed = mine.list[0] || null;
      saveMine(); renderMine();
    });
    box.appendChild(row);
  }
}

// En el selector, debajo de cada nivel: las estrellas que ya sacaste ahí.
function renderBest() {
  document.querySelectorAll('.levels [data-level]').forEach(b => {
    const i = +b.dataset.level, n = best[i] || 0;
    let el = b.querySelector('.best');
    if (!el) { el = document.createElement('span'); el.className = 'best'; b.appendChild(el); }
    el.innerHTML = [0, 1, 2].map(k => '<i class="' + (k < n ? 'on' : '') + '">★</i>').join('') +
      (bestT[i] ? ' <em>' + fmtT(bestT[i]) + '</em>' : '');
    el.setAttribute('aria-label', n + ' de 3 estrellas');
  });
}

// Qué dice el juego al perder, según cómo.
const OUCH = {
  dead: ['¡Uy, quema!', '¡A la lava!', '¡Qué calor!'],
  spiked: ['¡Pinchazo!', '¡Auch, pinchos!', '¡Eso pincha!'],
  bitten: ['¡El monstruo te comió!', '¡Ñam!', '¡Cuidado con el monstruo!'],
  burned: ['¡Te quemaste!', '¡Bola de fuego!', '¡Fuego, fuego!'],
  zapped: ['¡Bzzz! ¡Láser!', '¡Zap!', '¡Esperá que se apague!']
};
// El mensaje queda OUCH_T segundos (más que la pausa al perder), para que el nene llegue a leerlo.
const OUCH_T = 3;
let ouch = '', ouchT = 0;
function handle(ev) {
  for (const e of ev) {
    const p = run.p;
    if (OUCH[e]) { ouch = OUCH[e][(Math.random() * OUCH[e].length) | 0]; ouchT = OUCH_T; }
    if (e === 'jump') {
      sfx.jump();
      burst(p.x + PW / 2, p.y + PH, 4, ['#c3c8d8', '#8a8fa3'], 60, 20);
    } else if (e === 'land') {
      burst(p.x + PW / 2, p.y + PH, 6, ['#c3c8d8', '#8a8fa3', '#6c7186'], 80, 15);
    } else if (e === 'dropshake') {
      beep(150, 0.12, 'sawtooth', 0.04); beep(190, 0.12, 'sawtooth', 0.04, 0, 0.14); beep(150, 0.12, 'sawtooth', 0.04, 0, 0.28);
    } else if (e.startsWith('dropland')) {
      const i = +e.slice(8);
      beep(110, 0.16, 'square', 0.05, -50);
      burst(level.drops[i], Math.min(level.dropFloor[i], run.lava), 12, ['#ff8a8a', '#c0353a', '#eef1f8'], 150, 120);
    } else if (e.startsWith('star')) {
      const st = level.stars[+e.slice(4)];
      sfx.star();
      burst(st.x, st.y, 14, ['#ffd23f', '#fff3b0', '#ff9f1c'], 170, 60);
      renderHud();
    } else if (e === 'dead') {
      state = 'dead'; deadT = 1.0; shake = reduceMotion ? 0 : 7;
      sfx.dead();
      burst(p.x + PW / 2, run.lava + 4, 22, ['#ff7a1a', '#ffd23f', '#e2540f'], 230, 220);
    } else if (e.startsWith('stomp')) {
      const i = +e.slice(5), def = level.monsters[i];
      beep(300, 0.1, 'square', 0.05, 400); beep(700, 0.12, 'square', 0.04, 300, 0.08);
      burst(run.monsters[i].x + MW / 2, def.y - MH / 2, 16, ['#7a2233', '#ffd23f', '#ff7a1a', '#2a1420'], 180, 120);
    } else if (e.startsWith('fire')) {
      const m = run.monsters[+e.slice(4)];
      if (m.x > cam - 40 && m.x < cam + viewW + 40) { beep(240, 0.18, 'sawtooth', 0.035, -140); beep(120, 0.12, 'square', 0.025, -40, 0.05); }
    } else if (e === 'zapped') {
      state = 'dead'; deadT = 1.0; shake = reduceMotion ? 0 : 7;
      sfx.dead();
      burst(p.x + PW / 2, p.y + PH / 2, 22, ['#ff2d55', '#ffe3ea', '#5ee7f2', '#2fbf71'], 230, 160);
    } else if (e === 'burned') {
      state = 'dead'; deadT = 1.0; shake = reduceMotion ? 0 : 7;
      sfx.dead();
      burst(p.x + PW / 2, p.y + PH / 2, 22, ['#ff7a1a', '#ffd23f', '#e2540f', '#2a1420'], 230, 160);
    } else if (e === 'spiked' || e === 'bitten') {
      state = 'dead'; deadT = 1.0; shake = reduceMotion ? 0 : 7;
      sfx.dead();
      burst(p.x + PW / 2, p.y + PH / 2, 22, ['#e8ecf5', '#e5484d', '#2fbf71', '#8f96ab'], 230, 160);
    } else if (e === 'won') {
      state = 'won';
      win();
    }
  }
}

function win() {
  const n = run.stars.filter(Boolean).length;
  const tt = run.t;
  if (level.custom) {                                   // tu nivel: aviso y de vuelta al editor (no da diamantes)
    sfx.win();
    burst(level.goalX + 20, level.goalY - 80, 40, ['#ffd23f', '#5ee7f2', '#ff7a1a', '#f6efe6', '#2fbf71'], 260, 180);
    toast = { t: 3.5, text: '¡Llegaste a la bandera!' + (level.stars.length ? ' ' + n + ' de ' + level.stars.length + (level.stars.length === 1 ? ' estrella' : ' estrellas') : ''), sub: 'Tiempo: ' + fmtT(tt) };
    const thisRun = run;
    setTimeout(() => { if (run === thisRun && state === 'won') { if (playFrom === 'list') showMine(); else openEditor(); } }, 1800);
    return;
  }
  const all = n === 3;
  if (n > (best[levelIdx] || 0)) { best[levelIdx] = n; store.set('best', best); }
  const record = !!bestT[levelIdx] && tt < bestT[levelIdx];
  if (!bestT[levelIdx] || tt < bestT[levelIdx]) { bestT[levelIdx] = Math.round(tt * 10) / 10; store.set('time', bestT); }
  const timeText = 'Tiempo: ' + fmtT(tt) + (record ? '. ¡Récord!' : '');
  sfx.win();
  burst(level.goalX + 20, level.goalY - 80, 40, ['#ffd23f', '#5ee7f2', '#ff7a1a', '#f6efe6', '#2fbf71'], 260, 180);
  let title = '¡Llegaste a la meta!', text, sub = '';
  if (all) {
    diamonds += 1; store.set('diamonds', diamonds);
    sfx.diamond();
    text = 'Juntaste las 3 estrellas y ganaste 1 diamante.';
    if (diamonds % 100 === 0) {
      title = '¡Ganaste la copa!';
      sub = 'Llegaste a ' + diamonds + ' diamantes.';
    } else {
      const left = 100 - (diamonds % 100);
      sub = 'Tenés ' + diamonds + (diamonds === 1 ? ' diamante. ' : ' diamantes. ') +
            (left === 1 ? 'Te falta 1 para la copa.' : 'Te faltan ' + left + ' para la copa.');
    }
  } else {
    text = 'Juntaste ' + n + ' de 3 estrellas.';
    sub = 'Juntá las 3 para ganar el diamante.';
  }
  const isLast = levelIdx >= LEVELS.length - 1;
  if (isLast) {
    title = title === '¡Ganaste la copa!' ? '¡Terminaste el juego y ganaste la copa!' : '¡Terminaste el juego!';
    text = 'Pasaste los ' + LEVELS.length + ' niveles. ' + text;
  }
  $('winTitle').textContent = title;
  $('winText').textContent = text;
  $('winSub').textContent = sub + (sub ? ' ' : '') + timeText + '.';
  $('nextBtn').textContent = isLast ? 'Volver al nivel 1' : 'Siguiente nivel';
  $('winNext').textContent = '';
  winOverlay.classList.add('party');
  $('winStars').querySelectorAll('svg').forEach((el, i) => el.classList.toggle('on', run.stars[i]));
  renderHud();
  const thisRun = run;
  const cup = all && diamonds > 0 && diamonds % 100 === 0;
  if (!isLast && !cup) {
    // Sin cartel: un aviso arriba y el nivel siguiente arranca solo.
    const miss = 3 - n;
    toast = { t: 4.5, text: level.name + ': ' + n + ' de 3 estrellas. ' +
      (all ? '+1 diamante' : (miss === 1 ? 'Faltó 1' : 'Faltaron ' + miss) + ' para el diamante'), sub: timeText };
    setTimeout(() => { if (run === thisRun && state === 'won') startRun(levelIdx + 1); }, 1300);
    return;
  }
  // Último nivel o copa ganada: cartel con festejo.
  startParty();
  setTimeout(() => {
    if (run !== thisRun || state !== 'won') return;
    winOverlay.hidden = false;
    setTimeout(() => { if (run === thisRun) overlayReady = true; }, 2500);
  }, 800);
}

/* ---------- Pausa ---------- */
// Congela todo (la física no avanza, así que tampoco la lava, los monstruos ni el cronómetro).
let pausedFrom = 'play';
function pause() {
  if (state !== 'play' && state !== 'dead') return;
  pausedFrom = state; state = 'paused'; input.left = input.right = false; jumpQueued = false;
  pauseOverlay.hidden = false;
}
function resume() {
  if (state !== 'paused') return;
  state = pausedFrom; accum = 0; jumpQueued = false;
  pauseOverlay.hidden = true;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}
