/* J y la Lava: ruidos y música. */
'use strict';

/* ---------- Sonido ---------- */
let actx = null;
function beep(freq, dur, type, vol, slide, delay) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t0 = actx.currentTime + (delay || 0);
    const o = actx.createOscillator(), gn = actx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    gn.gain.setValueAtTime(vol || 0.04, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); gn.connect(actx.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  } catch (e) {}
}
const sfx = {
  jump: () => beep(420, 0.13, 'square', 0.035, 300),
  star: () => { beep(880, 0.09, 'square', 0.04); beep(1320, 0.16, 'square', 0.04, 0, 0.08); },
  dead: () => beep(260, 0.4, 'sawtooth', 0.05, -190),
  win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'square', 0.04, 0, i * 0.11)),
  diamond: () => [1047, 1319, 1568, 2093].forEach((f, i) => beep(f, 0.2, 'triangle', 0.06, 0, 0.5 + i * 0.09))
};

/* ---------- Música: una canción propia por nivel ----------
   Cada número es una nota MIDI; 0 es silencio. 64 pasos = 4 compases que se repiten.
   "bass" es el bajo, "notes" la melodía, "bpm" la velocidad. */
const SONGS = [
  // Las piedritas: alegre
  {"bpm":120,"lead":"square","leadVol":0.022,"bass":[48,0,0,0,55,0,0,0,48,0,0,0,55,0,0,0,53,0,0,0,60,0,0,0,53,0,0,0,60,0,0,0,55,0,0,0,62,0,0,0,55,0,0,0,62,0,0,0,48,0,0,0,55,0,0,0,48,0,55,0,52,0,50,0],"notes":[72,0,76,0,79,0,76,0,72,0,0,0,74,0,76,0,77,0,0,0,81,0,77,0,76,0,0,0,0,0,0,0,79,0,77,0,74,0,71,0,74,0,0,0,77,0,79,0,76,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0]},
  // Los pinchos: en puntas de pie
  {"bpm":110,"lead":"triangle","leadVol":0.05,"hold":1.0,"kick":8,"bass":[45,0,0,0,0,0,52,0,45,0,0,0,0,0,52,0,45,0,0,0,0,0,52,0,45,0,0,0,0,0,52,0,50,0,0,0,0,0,57,0,50,0,0,0,0,0,57,0,52,0,0,0,0,0,59,0,52,0,0,0,56,0,59,0],"notes":[69,0,0,72,0,0,76,0,0,0,75,0,76,0,0,0,69,0,0,72,0,0,76,0,0,0,79,0,77,0,76,0,74,0,0,77,0,0,81,0,0,0,80,0,81,0,0,0,76,0,0,80,0,0,83,0,80,0,76,0,71,0,0,0]},
  // Pinchos altos: marcha de héroe
  {"bpm":126,"lead":"square","leadVol":0.022,"hold":2.6,"bass":[50,0,50,0,57,0,50,0,50,0,50,0,57,0,50,0,46,0,46,0,53,0,46,0,46,0,46,0,53,0,46,0,48,0,48,0,55,0,48,0,48,0,48,0,55,0,48,0,50,0,50,0,57,0,50,0,50,0,57,0,53,0,52,0],"notes":[74,0,0,0,0,0,74,0,77,0,0,0,81,0,0,0,82,0,0,0,0,0,81,0,77,0,0,0,74,0,0,0,76,0,0,0,0,0,76,0,79,0,0,0,84,0,0,0,81,0,0,0,0,0,0,0,77,0,76,0,74,0,0,0]},
  // La lava sube: apurada, el bajo va subiendo
  {"bpm":150,"lead":"triangle","leadVol":0.05,"bass":[40,0,40,0,40,0,40,0,40,0,40,0,40,0,47,0,42,0,42,0,42,0,42,0,42,0,42,0,42,0,49,0,43,0,43,0,43,0,43,0,43,0,43,0,43,0,50,0,45,0,45,0,45,0,45,0,47,0,47,0,47,0,46,0],"notes":[64,0,67,0,71,0,67,0,64,0,67,0,71,0,76,0,66,0,69,0,73,0,69,0,66,0,69,0,73,0,78,0,67,0,71,0,74,0,71,0,67,0,71,0,74,0,79,0,81,0,0,0,79,0,0,0,78,0,0,0,75,0,0,0]},
  // Techo de pinchos: la melodía va bajando
  {"bpm":132,"lead":"square","leadVol":0.02,"hold":2.4,"bass":[48,0,0,48,0,0,48,0,48,0,0,48,0,0,48,0,48,0,0,48,0,0,48,0,48,0,0,48,0,0,48,0,44,0,0,44,0,0,44,0,44,0,0,44,0,0,44,0,43,0,0,43,0,0,43,0,43,0,0,43,0,0,47,0],"notes":[84,0,0,0,82,0,0,0,80,0,0,0,79,0,0,0,77,0,0,0,75,0,0,0,74,0,75,0,72,0,0,0,80,0,0,0,79,0,0,0,77,0,0,0,75,0,0,0,74,0,0,0,71,0,0,0,74,0,0,0,79,0,0,0]},
  // La trampa: el bajo sube y la melodía baja
  {"bpm":160,"lead":"triangle","leadVol":0.045,"bass":[38,0,38,0,41,0,41,0,43,0,43,0,45,0,45,0,46,0,46,0,45,0,45,0,43,0,43,0,41,0,40,0,38,0,38,0,41,0,41,0,43,0,43,0,45,0,45,0,46,0,46,0,48,0,48,0,49,0,49,0,50,0,50,50],"notes":[86,0,0,0,84,0,0,0,82,0,0,0,81,0,0,0,79,0,81,0,82,0,81,0,79,0,77,0,76,0,0,0,86,0,0,0,84,0,0,0,82,0,0,0,81,0,0,0,79,0,77,0,76,0,73,0,74,0,0,0,74,0,74,0]},
  // Los monstruos: peligro
  {"bpm":140,"lead":"triangle","leadVol":0.05,"bass":[45,0,45,0,45,0,46,0,45,0,45,0,48,0,46,0,45,0,45,0,45,0,46,0,45,0,43,0,40,0,43,44,45,0,45,0,45,0,46,0,45,0,45,0,48,0,46,0,45,0,45,0,46,0,46,0,48,0,48,0,51,0,50,48],"notes":[0,0,0,0,76,0,0,0,77,0,76,0,0,0,0,0,0,0,0,0,75,0,0,0,76,0,72,0,69,0,0,0,0,0,0,0,76,0,0,0,77,0,76,0,79,0,77,0,76,0,75,0,74,0,72,0,70,0,69,0,68,0,69,0]},
  // Los láseres: arpegios rápidos, como de máquina
  {"bpm":136,"lead":"square","leadVol":0.018,"hold":1.2,"bass":[40,0,52,0,40,0,52,0,40,0,52,0,40,0,52,0,36,0,48,0,36,0,48,0,36,0,48,0,36,0,48,0,38,0,50,0,38,0,50,0,38,0,50,0,38,0,50,0,35,0,47,0,35,0,47,0,35,0,47,0,35,0,47,0],"notes":[76,0,79,0,83,0,79,0,76,0,79,0,83,0,88,0,72,0,76,0,79,0,76,0,72,0,76,0,79,0,84,0,74,0,78,0,81,0,78,0,74,0,78,0,81,0,86,0,71,0,75,0,78,0,75,0,83,0,0,0,78,0,75,0]}
];
const music = { song: null, timer: null, step: 0, next: 0 };
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function tone(freq, t0, dur, type, vol, slideTo) {
  const o = actx.createOscillator(), gn = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(gn); gn.connect(actx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function musicTick() {
  try {
    const sg = music.song;
    if (!actx || !sg) return;
    const stepT = 60 / sg.bpm / 4;
    if (music.next < actx.currentTime) music.next = actx.currentTime + 0.05;
    while (music.next < actx.currentTime + 0.25) {
      const i = music.step % sg.bass.length;
      if (sg.bass[i]) tone(midi(sg.bass[i]), music.next, stepT * 1.6, 'square', 0.028);
      if (sg.notes[i]) tone(midi(sg.notes[i]), music.next, stepT * (sg.hold || 1.9), sg.lead, sg.leadVol);
      if (i % (sg.kick || 4) === 0) tone(120, music.next, 0.09, 'sine', 0.08, 45);          // bombo
      if (i % 8 === 4) tone(2400, music.next, 0.03, 'square', 0.008);                       // tic
      music.step++; music.next += stepT;
    }
  } catch (e) {}
}
function setMusic(song) {
  if (song === music.song) return;
  music.song = song;
  if (music.timer) { clearInterval(music.timer); music.timer = null; }
  if (!song) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    music.step = 0; music.next = actx.currentTime + 0.08;
    musicTick(); music.timer = setInterval(musicTick, 80);
  } catch (e) { music.song = null; }
}
let gesture = false;
['keydown', 'pointerdown'].forEach(n => window.addEventListener(n, () => {
  gesture = true;
  if (actx && actx.state === 'suspended') actx.resume();
}, true));
function updateMusic() {
  const playing = gesture && (state === 'play' || state === 'dead') && soundOn && !document.hidden;
  setMusic(playing ? SONGS[level.custom ? 2 : levelIdx] || null : null);
}
