/* J y la Lava: el único lugar donde se guardan los datos del jugador. Hoy, en el navegador (localStorage).
   Si algún día se guardan en la nube o en una copia de seguridad, se cambia solo este archivo. */
'use strict';

// La beta (JGAME_CHANNEL en version.js) guarda todo con otro nombre: sus datos no se mezclan con los del juego.
const CHANNEL = window.JGAME_CHANNEL || '';

// Qué se guarda (cada uno con su nombre):
//   diamonds  número de diamantes          sound   1 o 0
//   best      estrellas por nivel [3, 2…]  time    mejor tiempo por nivel en segundos [14.2, …]
//   level     último nivel jugado          mine    "Mis niveles": { list: [{ id, name, cells, start, goal }], current }
//   custom    (viejo) el único nivel propio de antes; se pasa a "mine" la primera vez
const store = {
  key: name => 'jlava' + (CHANNEL ? '-' + CHANNEL : '') + '.' + name,
  get(name, fallback) {
    try {
      const v = localStorage.getItem(store.key(name));
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(name, value) {
    try { localStorage.setItem(store.key(name), JSON.stringify(value)); } catch (e) {}
  },
  // Leer lo que guardó otro canal del mismo sitio (el estable lee la beta para traer sus niveles).
  getFrom(channel, name, fallback) {
    try {
      const v = localStorage.getItem('jlava' + (channel ? '-' + channel : '') + '.' + name);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  // Todo junto, para una copia de seguridad o, más adelante, para la nube.
  NAMES: ['diamonds', 'sound', 'best', 'time', 'level', 'mine'],
  exportAll() {
    const data = {};
    for (const n of store.NAMES) { const v = store.get(n, undefined); if (v !== undefined) data[n] = v; }
    return data;
  },
  importAll(data) {
    for (const n of store.NAMES) if (data && n in data) store.set(n, data[n]);
  }
};
