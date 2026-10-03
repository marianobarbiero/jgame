/* J y la Lava: la pantalla del editor de "Tu nivel". */
'use strict';

/* ---------- Editor ---------- */
function openEditor() {
  stopAuto();
  if (!ed) newMine();
  playFrom = 'editor';
  useLevel(buildCustom(ed));
  run = newRun(); state = 'edit'; parts.length = 0;
  startOverlay.hidden = true; winOverlay.hidden = true; pauseOverlay.hidden = true; myOverlay.hidden = true;
  document.body.classList.add('editing'); $('tools').hidden = false;
  edCam = Math.max(0, Math.min(edCam, ED_COLS * ED - viewW));
  renderHud();
}
function closeEditor() {
  document.body.classList.remove('editing'); $('tools').hidden = true; edPaint = false; edScroll = 0;
}
function edChanged() {
  saveMine();
  useLevel(buildCustom(ed)); run = newRun();
}
// Pone (o borra) lo que diga la herramienta en el casillero x, y.
function edApply(x, y, painting) {
  if (x < 0 || y < 0 || x >= ED_COLS || y >= ED_ROWS) return;
  const key = x + ',' + y, c = ed.cells;
  const isStart = ed.start[0] === x && ed.start[1] === y, isGoal = ed.goal[0] === x && ed.goal[1] === y;
  if (painting && edTool !== 'rock' && edTool !== 'erase') return;
  if (edTool === 'erase') {
    if (c[key]) delete c[key];
    else if (c[x + ',0'] === 'laser') delete c[x + ',0'];      // el láser se borra tocando cualquier lugar de su columna
    else return;
  } else if (edTool === 'start' || edTool === 'goal') {
    if ((edTool === 'start' && isGoal) || (edTool === 'goal' && isStart)) return;
    delete c[key]; ed[edTool] = [x, y];
  } else {
    if (isStart || isGoal) return;
    const k = edTool === 'laser' ? x + ',0' : key;              // el láser va por columna: se guarda arriba de todo
    if (c[k] === edTool) return;
    if (edTool === 'star' && Object.values(c).filter(v => v === 'star').length >= 3) {
      toast = { t: 2.5, text: 'Ya hay 3 estrellas: borrá una para mover' }; beep(200, 0.12, 'square', 0.03); return;
    }
    c[k] = edTool;
  }
  if (!painting || edTool === 'erase') beep(edTool === 'erase' ? 300 : 520, 0.05, 'square', 0.025);
  edChanged();
}
function edCell(e) {
  const r = canvas.getBoundingClientRect();
  const lx = (e.clientX - r.left) * (canvas.width / r.width) / scale + cam;
  const ly = (e.clientY - r.top) * (canvas.height / r.height) / scale;
  return [Math.floor(lx / ED), Math.floor(ly / ED)];
}
function drawGrid() {
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  for (let x = Math.floor(cam / ED) * ED; x < cam + viewW + ED; x += ED) ctx.fillRect(x, 0, 1, ED_ROWS * ED);
  for (let y = 0; y <= ED_ROWS * ED; y += ED) ctx.fillRect(cam, y, viewW, 1);
}
