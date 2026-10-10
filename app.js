'use strict';

// ---- Tilt settings ----
// The game reads gravity along the axis that points out of the screen (z).
// Phone upright on the forehead: z is near 0.
// Screen tips toward the floor (nod forward): z goes negative  -> CORRECT.
// Screen tips toward the ceiling (lean back): z goes positive -> SKIP.
// The z value does not depend on which way the phone is turned sideways.
const TILT_TRIGGER = 6.0;   // m/s², about 38 degrees from upright
const TILT_NEUTRAL = 3.0;   // m/s², about 18 degrees from upright
const SMOOTHING = 0.3;      // 0..1, higher reacts faster
const FLASH_MS = 700;       // how long the green or orange screen shows
const READY_HOLD_MS = 600;  // how long the phone must stay upright to start

const $ = (id) => document.getElementById(id);

const ROUND_TYPES = {
  describe: '🗣️ Describe it',
  act: '🎭 Act it out — no talking!',
  sound: '🔊 Sounds only — no words!',
};

const GAMES = {
  word: { title: '🔤 Word Guess', lists: () => window.WORD_LISTS },
  picture: { title: '🖼️ Picture Guess', lists: () => window.PICTURE_LISTS },
};

const state = {
  screen: 'home',
  mode: 'word',     // 'word' or 'picture'
  category: null,
  decks: {},        // "mode:category" -> { words: [...], next: index }
  results: [],      // { item, correct }
  word: null,       // current item: { pic, text }
  armed: false,     // true when the phone came back upright since the last answer
  busy: false,      // true while the answer flash shows
  endAt: 0,
  timerId: null,
  z: null,          // smoothed gravity on the z axis
  uprightSince: 0,
  sensorSeen: false,
};

// ---- Storage (optional) ----
function loadSetting(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage not available */ }
}

// ---- Screens ----
function show(name) {
  state.screen = name;
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// ---- Sound and vibration ----
let audio = null;
function initAudio() {
  if (audio) return;
  try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
}
function beep(freq, ms) {
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.2, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + ms / 1000);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + ms / 1000);
}
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ---- Keep the screen on ----
let wakeLock = null;
async function keepAwake() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { wakeLock = null; }
}
function releaseAwake() {
  wakeLock?.release().catch(() => {});
  wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.screen !== 'home' && !wakeLock) keepAwake();
});

// ---- Fullscreen and landscape lock (Android Chrome only, fails silently elsewhere) ----
async function goFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    await screen.orientation?.lock?.('landscape');
  } catch { /* not supported */ }
}
function leaveFullscreen() {
  try { screen.orientation?.unlock?.(); } catch { /* not supported */ }
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

// ---- Motion sensor ----
async function askMotionPermission() {
  // iPhone needs a permission prompt. Android does not.
  const DME = window.DeviceMotionEvent;
  if (DME && typeof DME.requestPermission === 'function') {
    try { await DME.requestPermission(); } catch { /* user said no */ }
  }
}

window.addEventListener('devicemotion', (e) => {
  const g = e.accelerationIncludingGravity;
  if (!g || g.z == null) return;
  state.sensorSeen = true;
  state.z = state.z == null ? g.z : state.z + SMOOTHING * (g.z - state.z);
  onMotion();
});

function onMotion() {
  const z = state.z;
  if (state.screen === 'ready') {
    if (Math.abs(z) < TILT_NEUTRAL) {
      if (!state.uprightSince) state.uprightSince = performance.now();
      else if (performance.now() - state.uprightSince > READY_HOLD_MS) startCountdown();
    } else {
      state.uprightSince = 0;
    }
    return;
  }
  if (state.screen !== 'play' || state.busy) return;
  if (!state.armed) {
    if (Math.abs(z) < TILT_NEUTRAL) state.armed = true;
    return;
  }
  if (z < -TILT_TRIGGER) answer(true);
  else if (z > TILT_TRIGGER) answer(false);
}

// Keyboard for testing on a computer: Down = correct, Up = skip.
window.addEventListener('keydown', (e) => {
  if (state.screen === 'play' && !state.busy) {
    if (e.key === 'ArrowDown') { e.preventDefault(); answer(true); }
    if (e.key === 'ArrowUp') { e.preventDefault(); answer(false); }
  } else if (state.screen === 'ready' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    startCountdown();
  }
});

// ---- Words ----
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Word lists hold strings; picture lists hold [emoji, word] pairs.
function toItem(entry) {
  return Array.isArray(entry) ? { pic: entry[0], text: entry[1] } : { pic: '', text: entry };
}
function itemLabel(item) {
  return item.pic ? item.pic + ' ' + item.text : item.text;
}

function nextWord() {
  const key = state.mode + ':' + state.category;
  let deck = state.decks[key];
  if (!deck || deck.next >= deck.words.length) {
    const list = GAMES[state.mode].lists()[state.category].words;
    deck = state.decks[key] = { words: shuffle(list), next: 0 };
  }
  return toItem(deck.words[deck.next++]);
}

function showWord(item) {
  state.word = item;
  $('pic').textContent = item.pic;
  $('word').textContent = item.text;
  fitText($('word'));
}

// Make the word as big as possible without overflow.
// A single word wider than the box overflows sideways (no mid-word breaks),
// so scrollWidth > clientWidth means "too big".
// Under a picture, the word is a smaller caption.
function fitText(el) {
  const withPic = $('pic').textContent !== '';
  const maxH = window.innerHeight * (withPic ? 0.22 : 0.7);
  let size = withPic
    ? Math.min(window.innerHeight * 0.14, window.innerWidth * 0.12)
    : Math.min(window.innerHeight * 0.45, window.innerWidth * 0.3);
  el.style.fontSize = size + 'px';
  while (size > 16 && (el.scrollWidth > el.clientWidth || el.scrollHeight > maxH)) {
    size *= 0.9;
    el.style.fontSize = size + 'px';
  }
}
window.addEventListener('resize', () => {
  if (state.screen === 'play' && state.word && !state.busy) fitText($('word'));
});

// ---- Guess games flow ----
async function startGame(categoryKey) {
  state.category = categoryKey;
  initAudio();
  audio?.resume?.();
  await askMotionPermission();
  goFullscreen();
  keepAwake();
  goReady();
}

function roundType() {
  return ROUND_TYPES[$('round-type').value] ? $('round-type').value : 'describe';
}

function goReady() {
  state.uprightSince = 0;
  $('ready-start').classList.add('hidden');
  $('ready-type').textContent = ROUND_TYPES[roundType()];
  $('ready-hint').textContent = 'Hold the phone upright. The game starts by itself.';
  show('ready');
  // If no sensor data arrives, let the player start by hand.
  setTimeout(() => {
    if (state.screen === 'ready' && !state.sensorSeen) {
      $('ready-hint').textContent = 'No tilt sensor found. Use Down arrow = correct, Up arrow = skip.';
      $('ready-start').classList.remove('hidden');
    }
  }, 1500);
}

function startCountdown() {
  if (state.screen !== 'ready') return;
  show('countdown');
  let n = 3;
  $('countdown').textContent = n;
  beep(440, 150);
  const id = setInterval(() => {
    n -= 1;
    if (n > 0) {
      $('countdown').textContent = n;
      beep(440, 150);
    } else {
      clearInterval(id);
      if (state.screen === 'countdown') startRound();
    }
  }, 1000);
}

function startRound() {
  const seconds = Number($('round-length').value) || 60;
  state.results = [];
  state.busy = false;
  // The phone must be upright before the first answer counts.
  state.armed = false;
  state.endAt = performance.now() + seconds * 1000;
  $('screen-play').classList.remove('flash-correct', 'flash-skip');
  $('round-tag').textContent = ROUND_TYPES[roundType()];
  show('play');
  showWord(nextWord());
  beep(880, 250);
  updateTimer();
  state.timerId = setInterval(updateTimer, 200);
}

let lastTick = null;
function updateTimer() {
  const left = Math.max(0, Math.ceil((state.endAt - performance.now()) / 1000));
  const el = $('timer');
  el.textContent = left;
  el.classList.toggle('low', left <= 5);
  if (left <= 5 && left > 0 && left !== lastTick) beep(660, 80);
  lastTick = left;
  if (left === 0 && !state.busy) endRound();
}

function answer(correct) {
  state.busy = true;
  state.armed = false;
  state.results.push({ item: state.word, correct });
  const play = $('screen-play');
  play.classList.add(correct ? 'flash-correct' : 'flash-skip');
  $('pic').textContent = '';
  $('word').textContent = correct ? 'CORRECT!' : 'PASS';
  fitText($('word'));
  if (correct) { beep(1046, 180); vibrate(80); } else { beep(220, 250); vibrate([40, 60, 40]); }

  setTimeout(() => {
    play.classList.remove('flash-correct', 'flash-skip');
    state.busy = false;
    if (performance.now() >= state.endAt) endRound();
    else showWord(nextWord());
  }, FLASH_MS);
}

function endRound() {
  if (state.screen !== 'play') return;
  clearInterval(state.timerId);
  beep(330, 500);
  vibrate(300);
  const score = state.results.filter((r) => r.correct).length;
  $('score').textContent = score;
  const list = $('results-list');
  list.innerHTML = '';
  for (const r of state.results) {
    const li = document.createElement('li');
    li.className = r.correct ? 'correct' : 'skip';
    li.textContent = (r.correct ? '✓ ' : '✗ ') + itemLabel(r.item);
    list.appendChild(li);
  }
  if (state.results.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No words this round.';
    list.appendChild(li);
  }
  show('results');
}

function stopRound() {
  clearInterval(state.timerId);
  releaseAwake();
  leaveFullscreen();
}

function goHome() {
  stopRound();
  show('home');
}

// Setup screen for Word Guess or Picture Guess.
function goSetup(mode = state.mode) {
  stopRound();
  state.mode = mode;
  $('setup-title').textContent = GAMES[mode].title;
  const box = $('categories');
  box.innerHTML = '';
  for (const [key, cat] of Object.entries(GAMES[mode].lists())) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-category';
    btn.textContent = cat.label;
    btn.addEventListener('click', () => startGame(key));
    box.appendChild(btn);
  }
  show('setup');
}

// ---- Would You Rather ----
const wyr = { deck: [], next: 0, easyOnly: false };

function nextWyr() {
  if (wyr.next >= wyr.deck.length) {
    const all = window.WYR_QUESTIONS;
    wyr.deck = shuffle(wyr.easyOnly ? all.filter((q) => q[2]) : all);
    wyr.next = 0;
  }
  const [a, b] = wyr.deck[wyr.next++];
  $('wyr-a').textContent = a;
  $('wyr-b').textContent = b;
  $('wyr-a').classList.remove('picked');
  $('wyr-b').classList.remove('picked');
}

function goWyr() {
  if (!wyr.deck.length) nextWyr();
  show('wyr');
}

// ---- Offline games ----
function buildOffline() {
  const box = $('offline-list');
  for (const g of window.OFFLINE_GAMES) {
    const d = document.createElement('details');
    d.className = 'offline-game';
    const s = document.createElement('summary');
    s.textContent = g.emoji + ' ' + g.name;
    const ages = document.createElement('span');
    ages.className = 'ages';
    ages.textContent = g.ages;
    s.appendChild(ages);
    const ol = document.createElement('ol');
    for (const step of g.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      ol.appendChild(li);
    }
    const tip = document.createElement('p');
    tip.className = 'tip';
    tip.textContent = '💡 ' + g.tip;
    d.append(s, ol, tip);
    box.appendChild(d);
  }
}

// ---- Set up ----
function bindSetting(id, key, fallback) {
  const select = $(id);
  select.value = loadSetting(key, fallback);
  if (!select.value) select.value = fallback;
  select.addEventListener('change', () => saveSetting(key, select.value));
}

function init() {
  document.querySelectorAll('[data-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const game = btn.dataset.game;
      if (game === 'wyr') goWyr();
      else if (game === 'offline') show('offline');
      else goSetup(game);
    });
  });

  bindSetting('round-length', 'roundLength', '60');
  bindSetting('round-type', 'roundType', 'describe');

  $('ready-start').addEventListener('click', startCountdown);
  $('play-again').addEventListener('click', () => { keepAwake(); goFullscreen(); goReady(); });
  document.querySelectorAll('.js-home').forEach((b) => b.addEventListener('click', goHome));
  document.querySelectorAll('.js-setup').forEach((b) => b.addEventListener('click', () => goSetup()));

  $('wyr-next').addEventListener('click', nextWyr);
  for (const id of ['wyr-a', 'wyr-b']) {
    $(id).addEventListener('click', () => $(id).classList.toggle('picked'));
  }
  $('wyr-easy').checked = loadSetting('wyrEasy', '0') === '1';
  wyr.easyOnly = $('wyr-easy').checked;
  $('wyr-easy').addEventListener('change', (e) => {
    wyr.easyOnly = e.target.checked;
    saveSetting('wyrEasy', wyr.easyOnly ? '1' : '0');
    wyr.deck = [];
    nextWyr();
  });

  buildOffline();
}

init();
