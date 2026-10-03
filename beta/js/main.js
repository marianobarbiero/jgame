/* J y la Lava: el bucle, los controles y el arranque. Va último: usa todo lo anterior. */
'use strict';

/* ---------- Bucle ---------- */
function frame(t) {
  const dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t;
  time += dt;
  updateMusic();
  if (state === 'play') {
    accum += dt;
    while (accum >= STEP) {
      const ev = tick(run, { left: input.left, right: input.right, jump: jumpQueued }, STEP);
      jumpQueued = false; accum -= STEP;
      if (ev.length) handle(ev);
      if (state !== 'play') { accum = 0; break; }
    }
  } else if (state === 'dead') {
    deadT -= dt;
    if (deadT <= 0) { const kept = run.stars; run = newRun(); run.stars = kept; state = 'play'; jumpQueued = false; }
  }
  const showPause = state === 'play' || state === 'dead';
  if ($('pauseBtn').hidden === showPause) $('pauseBtn').hidden = !showPause;
  if (state !== 'paused') updateParts(dt);
  if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
  if (party && !reduceMotion) {                       // fuegos artificiales del festejo final
    partyT -= dt;
    if (partyT <= 0) {
      partyT = 0.14 + Math.random() * 0.2;
      burst(cam + 40 + Math.random() * (viewW - 80), 50 + Math.random() * 210, 34,
        FIREWORK[(Math.random() * FIREWORK.length) | 0], 260, 70);
      for (const q of parts.slice(-34)) { q.life += 0.5; q.size += 2; }       // más grandes y duran más
      if (Math.random() < 0.5) beep(500 + Math.random() * 700, 0.08, 'triangle', 0.02);
    }
  }
  shake *= Math.pow(0.002, dt);
  if (state === 'edit') {
    edCam = Math.max(0, Math.min(ED_COLS * ED - viewW, edCam + edScroll * 520 * dt));
    cam = edCam;
  } else {
    // En pantallas angostas (celular parado) J va más a la izquierda, así se ve más camino adelante.
    const target = Math.max(0, Math.min(level.w - viewW, run.p.x + PW / 2 - viewW * (viewW < 600 ? 0.24 : 0.38)));
    cam += (target - cam) * Math.min(1, dt * 8);
  }
  draw();
  requestAnimationFrame(frame);
}

/* ---------- Controles ---------- */
const moveKeys = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
const jumpKeys = ['Space', 'ArrowUp', 'KeyW'];
window.addEventListener('keydown', e => {
  if (e.target === $('soundBtn')) return;
  if (state === 'edit') {                                // en el editor las flechas mueven la vista
    if (moveKeys[e.code]) { edScroll = moveKeys[e.code] === 'left' ? -1 : 1; e.preventDefault(); }
    return;
  }
  if (e.code === 'KeyR') { startRun(); return; }
  if (state === 'paused') {
    if (['KeyP', 'Escape', 'Space', 'Enter'].includes(e.code)) {
      if ((e.code === 'Space' || e.code === 'Enter') && e.target && e.target.closest && e.target.closest('button')) return;
      e.preventDefault(); resume();
    }
    return;
  }
  if ((e.code === 'KeyP' || e.code === 'Escape') && (state === 'play' || state === 'dead')) { e.preventDefault(); pause(); return; }
  if (state === 'ready' || (state === 'won' && overlayReady)) {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      startRun(state === 'won' ? (levelIdx < LEVELS.length - 1 ? levelIdx + 1 : 0) : levelIdx);
    }
    return;
  }
  if (moveKeys[e.code]) { input[moveKeys[e.code]] = true; e.preventDefault(); }
  else if (jumpKeys.includes(e.code)) { if (!e.repeat) jumpQueued = true; e.preventDefault(); }
});
window.addEventListener('keyup', e => { if (moveKeys[e.code]) { input[moveKeys[e.code]] = false; edScroll = 0; } });
window.addEventListener('blur', () => { input.left = input.right = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); updateMusic(); });
$('pauseBtn').addEventListener('click', () => { pause(); $('pauseBtn').blur(); });
$('resumeBtn').addEventListener('click', resume);
$('pauseLevelsBtn').addEventListener('click', showPicker);

function hold(btn, key) {
  const off = () => { if (key !== 'jump') input[key] = false; btn.classList.remove('down'); };
  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (key === 'jump') jumpQueued = true; else input[key] = true;
    btn.classList.add('down');
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => btn.addEventListener(n, off));
  btn.addEventListener('contextmenu', e => e.preventDefault());
}
hold($('btnLeft'), 'left'); hold($('btnRight'), 'right'); hold($('btnJump'), 'jump');
canvas.addEventListener('pointerdown', e => { if (state === 'play') { jumpQueued = true; e.preventDefault(); } });
window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') $('pad').classList.add('show'); });

canvas.addEventListener('pointerdown', e => {
  if (state !== 'edit') return;
  e.preventDefault(); edPaint = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  const [x, y] = edCell(e); edApply(x, y, false);
});
canvas.addEventListener('pointermove', e => {
  if (state !== 'edit' || !edPaint) return;
  const [x, y] = edCell(e); edApply(x, y, true);
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => canvas.addEventListener(n, () => { edPaint = false; }));
document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => {
  edTool = b.dataset.tool;
  document.querySelectorAll('[data-tool]').forEach(o => o.setAttribute('aria-pressed', o === b ? 'true' : 'false'));
}));
[['edLeft', -1], ['edRight', 1]].forEach(([id, d]) => {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); edScroll = d; try { b.setPointerCapture(e.pointerId); } catch (err) {} });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => b.addEventListener(n, () => { edScroll = 0; }));
});
$('edPlay').addEventListener('click', () => startRun('custom'));
$('edExit').addEventListener('click', showPicker);
$('editBtn').addEventListener('click', openEditor);
$('editChip').addEventListener('click', () => { openEditor(); $('editChip').blur(); });

document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => startRun(+b.dataset.level)));
$('againBtn').addEventListener('click', () => startRun());
$('nextBtn').addEventListener('click', () => startRun(levelIdx < LEVELS.length - 1 ? levelIdx + 1 : 0));
$('levelsBtn').addEventListener('click', showPicker);
$('restartBtn').addEventListener('click', () => { startRun(); $('restartBtn').blur(); });
$('soundBtn').addEventListener('click', () => {
  soundOn = !soundOn; save('jlava.sound', soundOn ? '1' : '0'); renderHud();
  if (soundOn) beep(660, 0.08, 'square', 0.03);
});

/* ---------- Arranque ---------- */
// La versión está en version.js. Si no se cargó, no se muestra nada.
if (window.JGAME_VERSION) { $('ver').textContent = 'v' + window.JGAME_VERSION + (CHANNEL ? ' ' + CHANNEL : ''); $('ver').hidden = false; }
if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
window.addEventListener('resize', resize);

function boot(data) {
  if (data && Number.isFinite(data.diamonds)) diamonds = Math.max(diamonds, data.diamonds);
  // Al abrir arranca solo el nivel 1 (o el que se estaba jugando, si la página se actualizó en vivo).
  pickLevel(data && Number.isFinite(data.level) ? data.level : 0);
  run = newRun(); state = 'play';
  resize(); renderHud();
  requestAnimationFrame(t => { last = t; frame(t); });
}
const hot = window.claude && window.claude.hot;
try { if (hot && typeof hot.snapshot === 'function') hot.snapshot(() => ({ diamonds, level: levelIdx })); } catch (e) {}
if (hot && typeof hot.ready === 'function') hot.ready(boot); else boot((hot && hot.data) || {});
