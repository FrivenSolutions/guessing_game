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

// ---- Emoji support (modern or old phone) ----
// Draw a 2022 emoji (Unicode 15.0) on a hidden canvas. A phone that knows it
// draws it in color. A phone that does not draws a gray box or nothing.
function drawsInColor(emoji) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.textBaseline = 'top';
  ctx.font = '28px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(emoji, 0, 0);
  const d = ctx.getImageData(0, 0, 32, 32).data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0 && (Math.abs(d[i] - d[i + 1]) > 40 || Math.abs(d[i + 1] - d[i + 2]) > 40)) return true;
  }
  return false;
}

function detectModernEmoji() {
  try {
    // If even an old emoji is not in color, the test does not work here. Assume modern.
    if (!drawsInColor('😀')) return true;
    return drawsInColor('🫎') && drawsInColor('🪼');
  } catch {
    return true;
  }
}

const emoji = { detected: null, old: false };

function applyEmojiMode() {
  const mode = $('emoji-mode').value;
  if (emoji.detected === null) emoji.detected = detectModernEmoji();
  emoji.old = mode === 'old' || (mode === 'auto' && !emoji.detected);
  $('emoji-status').textContent = mode === 'auto'
    ? 'Auto: this phone has ' + (emoji.detected ? 'modern emoji 🫎' : 'old emoji. Some items are hidden.')
    : mode === 'old' ? 'Old phone: new emoji are swapped or hidden.' : 'Modern phone: all emoji on.';
  // Start fresh decks so the new mode takes effect at once.
  state.decks = {};
  riddles.deck = [];
}

// Entries are [emoji, text] or [emoji, text, old]. In old-phone mode, swap in
// the older emoji, or drop the entry when old is null.
function forPhone(entries) {
  if (!emoji.old) return entries;
  const out = [];
  for (const e of entries) {
    if (!Array.isArray(e) || e.length < 3) out.push(e);
    else if (e[2] !== null) out.push([e[2], e[1]]);
  }
  return out;
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
    const list = forPhone(GAMES[state.mode].lists()[state.category].words);
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
  stopSimon();
  stopRace();
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
    btn.innerHTML = '<span class="cat-emoji"></span><span class="cat-label"></span>';
    btn.firstChild.textContent = cat.emoji;
    btn.lastChild.textContent = cat.label;
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

// ---- Emoji Riddles ----
const riddles = { category: 'all', deck: [], next: 0 };

function riddlePool() {
  const lists = window.RIDDLE_LISTS;
  if (riddles.category !== 'all') return forPhone(lists[riddles.category].riddles);
  return forPhone(Object.values(lists).flatMap((l) => l.riddles));
}

function nextRiddle() {
  if (riddles.next >= riddles.deck.length) {
    riddles.deck = shuffle(riddlePool());
    riddles.next = 0;
  }
  const [clue, answer] = riddles.deck[riddles.next++];
  $('riddle-emoji').textContent = clue;
  $('riddle-answer').textContent = '';
  $('riddle-answer').dataset.answer = answer;
  $('riddle-reveal').disabled = false;
}

function buildRiddleCats() {
  const box = $('riddle-cats');
  const cats = [['all', '🎲 All']].concat(
    Object.entries(window.RIDDLE_LISTS).map(([k, l]) => [k, l.emoji + ' ' + l.label]));
  for (const [key, label] of cats) {
    const b = document.createElement('button');
    b.textContent = label;
    b.classList.toggle('on', key === riddles.category);
    b.addEventListener('click', () => {
      riddles.category = key;
      riddles.deck = [];
      box.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      nextRiddle();
    });
    box.appendChild(b);
  }
}

function goRiddles() {
  if (!riddles.deck.length) nextRiddle();
  show('riddles');
}

// ---- Simon Says ----
const simon = { running: false, timerId: null, last: -1 };

function speak(text) {
  if (!$('simon-voice').checked || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function simonTick() {
  const list = forPhone(window.SIMON_ACTIONS);
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (i === simon.last && list.length > 1);
  simon.last = i;
  const [emoji, action] = list[i];
  // About 7 in 10 commands are real "Simon says" commands.
  const real = Math.random() < 0.7;
  const text = action.charAt(0).toUpperCase() + action.slice(1) + '!';
  $('simon-prefix').innerHTML = real ? 'Simon says…' : '&nbsp;';
  $('simon-emoji').textContent = emoji;
  $('simon-text').textContent = text;
  const stage = document.querySelector('.simon-stage');
  stage.classList.remove('pop');
  void stage.offsetWidth;  // restart the animation
  stage.classList.add('pop');
  speak((real ? 'Simon says, ' : '') + action);
  simon.timerId = setTimeout(simonTick, Number($('simon-speed').value) || 4500);
}

function startSimon() {
  simon.running = true;
  $('simon-start').textContent = 'Pause';
  keepAwake();
  simonTick();
}

function stopSimon() {
  simon.running = false;
  clearTimeout(simon.timerId);
  if (window.speechSynthesis) speechSynthesis.cancel();
  $('simon-start').textContent = 'Start';
  releaseAwake();
}

// ---- Reaction Race ----
const RACE_TARGET = 5;
const race = { score: [0, 0], phase: 'idle', timerId: null, goAt: 0 };
const raceHalves = () => [document.querySelector('.race-bottom'), document.querySelector('.race-top')];

function raceShow(msgs) {
  raceHalves().forEach((h, p) => {
    h.querySelector('.race-score').textContent = race.score[p];
    h.querySelector('.race-msg').textContent = msgs[p];
  });
}

function raceReset() {
  clearTimeout(race.timerId);
  race.score = [0, 0];
  race.phase = 'idle';
  $('screen-race').classList.remove('go');
  raceHalves().forEach((h) => h.classList.remove('won', 'foul'));
  raceShow(['Tap to start', 'Tap to start']);
}

function raceRound() {
  race.phase = 'wait';
  $('screen-race').classList.remove('go');
  raceHalves().forEach((h) => h.classList.remove('won', 'foul'));
  raceShow(['Wait for green…', 'Wait for green…']);
  race.timerId = setTimeout(() => {
    race.phase = 'go';
    race.goAt = performance.now();
    $('screen-race').classList.add('go');
    raceShow(['TAP!', 'TAP!']);
    beep(880, 120);
  }, 1500 + Math.random() * 3000);
}

function raceTap(player) {
  if (race.phase === 'idle' || race.phase === 'over') {
    if (race.phase === 'over') raceReset();
    raceRound();
    return;
  }
  if (race.phase !== 'wait' && race.phase !== 'go') return;
  const other = 1 - player;
  const halves = raceHalves();
  const msgs = ['', ''];
  if (race.phase === 'wait') {
    // Tapped too early: the other player gets the point.
    clearTimeout(race.timerId);
    race.score[other]++;
    halves[player].classList.add('foul');
    halves[other].classList.add('won');
    msgs[player] = 'Too early!';
    msgs[other] = '+1 point';
    beep(220, 250);
  } else {
    race.score[player]++;
    halves[player].classList.add('won');
    msgs[player] = 'You win! ' + ((performance.now() - race.goAt) / 1000).toFixed(2) + ' s';
    msgs[other] = 'Too slow!';
    beep(1046, 180);
  }
  $('screen-race').classList.remove('go');
  vibrate(60);
  const winner = race.score.findIndex((n) => n >= RACE_TARGET);
  if (winner >= 0) {
    race.phase = 'over';
    msgs[winner] = '🏆 You win the match!';
    msgs[1 - winner] = 'Good game! Tap to play again';
    raceShow(msgs);
    // Ignore taps for a moment so a late tap does not restart the match.
    race.phase = 'pause';
    race.timerId = setTimeout(() => { race.phase = 'over'; }, 1500);
    return;
  }
  race.phase = 'pause';
  raceShow(msgs);
  race.timerId = setTimeout(raceRound, 1800);
}

function goRace() {
  raceReset();
  keepAwake();
  show('race');
}

function stopRace() {
  clearTimeout(race.timerId);
  race.phase = 'idle';
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
      else if (game === 'riddles') goRiddles();
      else if (game === 'simon') show('simon');
      else if (game === 'race') goRace();
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

  bindSetting('emoji-mode', 'emojiMode', 'auto');
  $('emoji-mode').addEventListener('change', applyEmojiMode);
  applyEmojiMode();

  buildRiddleCats();
  $('riddle-next').addEventListener('click', nextRiddle);
  $('riddle-reveal').addEventListener('click', () => {
    $('riddle-answer').textContent = $('riddle-answer').dataset.answer;
    $('riddle-reveal').disabled = true;
  });

  bindSetting('simon-speed', 'simonSpeed', '4500');
  $('simon-voice').checked = loadSetting('simonVoice', '1') === '1';
  $('simon-voice').addEventListener('change', (e) => saveSetting('simonVoice', e.target.checked ? '1' : '0'));
  $('simon-start').addEventListener('click', () => {
    initAudio();
    if (simon.running) stopSimon(); else startSimon();
  });

  raceHalves().forEach((h, p) => h.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    initAudio();
    raceTap(p);
  }));
}

init();
