import Reveal from 'reveal.js';
import Notes from 'reveal.js/plugin/notes';

import 'reveal.js/reveal.css';
// fonts are bundled with the site, so it looks the same offline
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/jetbrains-mono/latin-800.css';
import './styles.css';

/* ---------------------------------------------------------
   Settings — change these to personalise the desktop
   --------------------------------------------------------- */
const TERMINAL = {
  user: 'daniel',
  host: 'vhs-career-day',
  dir: '~',
  typeSpeed: [40, 90], // ms per character (min, max)
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------
   Wallpaper: give every blob its own random timing, travel
   distance and starting point so the motion feels organic.
   --------------------------------------------------------- */
const rand = (min, max) => min + Math.random() * (max - min);
const SINE = 'cubic-bezier(0.37, 0, 0.63, 1)'; // smooth ease-in-out, no sudden stops

// Each blob = 4 nested layers, each with ONE slow back-and-forth motion on its
// own random timer. Adding several out-of-sync smooth waves together gives a
// wandering, organic path without any jerks.
document.querySelectorAll('.wallpaper .blob').forEach((blob) => {
  const x = document.createElement('div');
  const y = document.createElement('div');
  const s = document.createElement('div');
  const shape = document.createElement('div');
  shape.className = 'shape';
  s.append(shape);
  y.append(s);
  x.append(y);
  blob.append(x);

  if (reduceMotion) return;

  const wave = (el, from, to, seconds) => {
    const duration = seconds * 1000;
    el.animate([{ transform: from }, { transform: to }], {
      duration,
      iterations: Infinity,
      direction: 'alternate',
      easing: SINE,
      delay: -rand(0, duration * 2), // start somewhere mid-motion
    });
  };

  const ax = rand(6, 14) * (Math.random() < 0.5 ? -1 : 1);
  const ay = rand(6, 14) * (Math.random() < 0.5 ? -1 : 1);
  wave(x, `translateX(${-ax}vmax)`, `translateX(${ax}vmax)`, rand(14, 26));
  wave(y, `translateY(${-ay}vmax)`, `translateY(${ay}vmax)`, rand(17, 31));
  wave(s, `scale(${rand(0.8, 0.9)})`, `scale(${rand(1.1, 1.22)})`, rand(9, 16));

  // slow continuous turn — the oval shape makes the outline shift as it rotates
  shape.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
    duration: rand(60, 110) * 1000,
    iterations: Infinity,
    direction: Math.random() < 0.5 ? 'normal' : 'reverse',
    delay: -rand(0, 60000),
  });
});

/* ---------------------------------------------------------
   Window chrome: turn simple markup into full windows
   --------------------------------------------------------- */
const icons = {
  zoomOut:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5h6"/></svg>',
  zoomIn:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5h6M10.5 7.5v6"/></svg>',
  share:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9H6.5A1.5 1.5 0 0 0 5 10.5v9A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 17.5 9H16M12 3v11M8.5 6.5 12 3l3.5 3.5"/></svg>',
  markup:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 15 1-3.5 5-5 2.5 2.5-5 5L9 15Z"/></svg>',
};

const lights = '<div class="lights"><i></i><i></i><i></i></div>';

function promptHTML(term) {
  const user = term.dataset.user ?? TERMINAL.user;
  const host = term.dataset.host ?? TERMINAL.host;
  const dir = term.dataset.dir ?? TERMINAL.dir;
  return `<span class="prompt"><span class="user">${user}@${host}</span> <span class="dir">${dir}</span> % </span>`;
}

function buildTerminal(term) {
  const user = term.dataset.user ?? TERMINAL.user;
  const title = term.dataset.title ?? `${user} — zsh — 80×24`;

  const body = document.createElement('div');
  body.className = 'window-body';
  body.append(...term.childNodes);

  // Always finish with an idle prompt + blinking cursor (opt out with data-no-idle)
  if (!('noIdle' in term.dataset)) {
    const idle = document.createElement('div');
    idle.className = 'cmd-block';
    idle.innerHTML = '<div class="cmd idle"></div>';
    body.append(idle);
  }

  body.querySelectorAll('.cmd').forEach((cmd) => {
    cmd.dataset.full = cmd.textContent.trim();
    cmd.innerHTML = `${promptHTML(term)}<span class="typed"></span>`;
  });

  term.innerHTML = `<div class="titlebar">${lights}<div class="title">${title}</div></div>`;
  term.append(body);
}

function buildPreview(win) {
  const img = win.querySelector('img');
  const file = win.dataset.title ?? img?.getAttribute('src')?.split('/').pop() ?? 'Untitled';
  const subtitle = win.dataset.subtitle ?? '';

  const body = document.createElement('div');
  body.className = 'window-body';
  body.append(...win.childNodes);

  if (win.dataset.caption) {
    const cap = document.createElement('figcaption');
    cap.textContent = win.dataset.caption;
    body.append(cap);
  }

  win.innerHTML = `
    <div class="titlebar">
      ${lights}
      <div class="title"><b>${file}</b>${subtitle ? `<small>${subtitle}</small>` : ''}</div>
      <div class="tools">${icons.zoomOut}${icons.zoomIn}${icons.share}${icons.markup}</div>
    </div>`;
  win.append(body);
}

document.querySelectorAll('.window.terminal').forEach(buildTerminal);
document.querySelectorAll('.window.preview').forEach(buildPreview);

// .terminal.scroll behaves like a real terminal: fixed height, newest output at the bottom
document.querySelectorAll('.terminal.scroll .window-body').forEach((body) => {
  new MutationObserver(() => {
    body.scrollTop = body.scrollHeight;
  }).observe(body, { subtree: true, childList: true, attributes: true, characterData: true });
});

/* ---------------------------------------------------------
   Terminal typing: each .cmd-block types its command, then
   shows its .out, then moves on to the next block.

   Click-to-continue steps: put data-wait on a .cmd-block and a
   <span class="fragment gate"></span> in the slide. The deck
   pauses (showing a blinking prompt) until you press next, then
   types that block. A .window.gated window pops open once the
   step finishes (data-gate="N" picks which step, default 1);
   add data-swap and it closes again when the next step begins.
   data-clear on a step's first block clears the terminal when that step starts;
   data-opens on a block opens the step's windows as soon as that block is done.
   --------------------------------------------------------- */
let runId = 0;

const groupsOf = (slide) => {
  const groups = [[]];
  slide.querySelectorAll('.cmd-block').forEach((block) => {
    if (block.hasAttribute('data-wait')) groups.push([]);
    groups.at(-1).push(block);
  });
  return groups;
};

/* "stream" output: <div class="out stream"> whose .line children appear one by one.
   - .line.meter      gets a bar that fills up (data-duration in ms, data-max = where it
                      stops 0..1, class ok = stays green, class fail = stays red, class warn = amber;
                      data-reveal-next shows the line below as soon as the bar starts)
   - .count[data-to]  counts up to that number */
const fmtCount = (el, v) => (el.textContent = Math.round(v).toLocaleString('en-US'));

const barMax = (line) => Number(line.dataset.max ?? 1);
const barMin = (line) => Number(line.dataset.from ?? 0); // data-from: the bar starts part-way
function setBar(line, p) {
  const fill = line.querySelector('.bar-fill');
  if (!fill) return;
  fill.style.width = `${p * 100}%`;
  const hue = line.classList.contains('ok') ? 130 : line.classList.contains('fail') ? 0 : line.classList.contains('warn') ? 45 : Math.round(130 - 130 * p);
  fill.style.background = `hsl(${hue} 85% 56%)`; // default: green -> red
  // data-scale="6" data-unit="months": show 0..1 as 0..6 months instead of a percentage
  const scale = Number(line.dataset.scale ?? 0);
  line.querySelector('.bar-pct').textContent = scale
    ? `${Math.round(p * scale * 10) / 10} ${line.dataset.unit ?? ''}`.trim()
    : `${Math.round(p * 100)}%`;
}
// A line with data-finishes="bar-id" continues that earlier bar: to 100% (amber -> green) by default,
// or to data-finish-to (e.g. 0.95) keeping the bar's own colour.
const finishTo = (line) => Number(line.dataset.finishTo ?? 1);
const origCls = (bar) => (bar.dataset.origCls ??= ['ok', 'fail', 'warn'].find((c) => bar.classList.contains(c)) ?? 'ok');
function finishBar(bar, done, to = 1) {
  const orig = origCls(bar);
  bar.classList.remove('ok', 'fail', 'warn');
  bar.classList.add(done && to >= 1 ? 'ok' : orig);
  setBar(bar, done ? to : barMax(bar));
}
function finishTarget(line, done) {
  const bar = line.dataset.finishes && document.getElementById(line.dataset.finishes);
  if (bar) finishBar(bar, done, finishTo(line));
}
function setLineFinal(line) {
  line.classList.add('shown');
  line.querySelectorAll('.count').forEach((c) => fmtCount(c, Number(c.dataset.to)));
  setBar(line, barMax(line));
  finishTarget(line, true);
}
function resetLine(line) {
  line.classList.remove('shown');
  line.querySelectorAll('.count').forEach((c) => fmtCount(c, 0));
  setBar(line, barMin(line));
  finishTarget(line, false);
}
// Calls step(t) with t going 0 -> 1 over `duration` ms. Returns false if cancelled.
async function tween(duration, id, step) {
  const start = performance.now();
  for (;;) {
    if (id !== runId) return false;
    const t = Math.min(1, (performance.now() - start) / duration);
    step(t);
    if (t >= 1) return true;
    await sleep(30);
  }
}
async function playLine(line, id) {
  const target = line.dataset.finishes && document.getElementById(line.dataset.finishes);
  if (target) {
    const from = barMax(target);
    const to = finishTo(line);
    origCls(target);
    if (to >= 1) target.classList.replace('warn', 'ok');
    const dur = Number(line.dataset.finishDuration ?? 900);
    if (!(await tween(dur, id, (t) => setBar(target, from + (to - from) * t)))) return false;
    finishBar(target, true, to);
  }
  line.classList.add('shown');
  for (const c of line.querySelectorAll('.count')) {
    const to = Number(c.dataset.to);
    if (!(await tween(1500, id, (t) => fmtCount(c, to * (1 - (1 - t) ** 3))))) return false;
  }
  if (line.hasAttribute('data-reveal-next')) line.nextElementSibling?.classList.add('shown');
  if (line.querySelector('.bar-fill')) {
    const ms = Number(line.dataset.duration ?? 3500);
    if (!(await tween(ms, id, (t) => setBar(line, barMin(line) + t ** 1.4 * (barMax(line) - barMin(line)))))) return false;
  }
  return true;
}
async function streamBlock(block, id) {
  const out = block.querySelector('.stream');
  block.classList.add('live');
  const delay = Number(out.dataset.delay ?? 400);
  for (const line of out.querySelectorAll(':scope > .line')) {
    if (reduceMotion) {
      setLineFinal(line);
      continue;
    }
    if (line.classList.contains('shown')) continue; // already revealed by the line above
    await sleep(delay);
    if (id !== runId || !(await playLine(line, id))) return false;
  }
  return id === runId;
}
async function runOutput(block, id) {
  if (block.querySelector('.flood')) return floodBlock(block, id);
  if (block.querySelector('.stream')) return streamBlock(block, id);
  return true;
}
// progress lines get their bar markup once, up front
document.querySelectorAll('.stream > .line.meter').forEach((line) => {
  line.insertAdjacentHTML(
    'beforeend',
    '<span class="bar-track"><span class="bar-fill"></span></span><span class="bar-pct">0%</span>',
  );
});

/* "answer": <span class="answer" data-gate="1" data-text="..."></span> sits inside an
   earlier output line and gets typed in, as if by the user, when step N starts. */
const answerGate = (a) => Number(a.dataset.gate ?? 1);
async function typeAnswer(el, id) {
  const text = el.dataset.text ?? '';
  el.textContent = '';
  if (reduceMotion) {
    el.textContent = text;
    return true;
  }
  await sleep(700);
  const [min, max] = TERMINAL.typeSpeed;
  for (const ch of text) {
    if (id !== runId) return false;
    el.textContent += ch;
    await sleep(min + Math.random() * (max - min));
  }
  await sleep(500);
  return id === runId;
}

/* "flood" output: <div class="out flood" data-char="?"></div> fills the whole
   terminal window with a stream of that character (used by the dream slide). */
const FLOOD_COLORS = ['', '', '', '', '', 'yellow', 'pink', 'blue', 'green', 'dim'];
const floodBody = (out) => out.closest('.window-body');
const floodFull = (out) => {
  const body = floodBody(out);
  return body.clientHeight === 0 || body.scrollHeight > body.clientHeight + 1;
};
function floodChunk(out, n) {
  const chars = [...(out.dataset.char ?? '?')]; // several characters = a random mix (e.g. "01")
  let text = '';
  for (let i = 0; i < n; i++) text += Math.random() < 0.86 ? chars[Math.floor(Math.random() * chars.length)] : ' ';
  const span = document.createElement('span');
  // data-color="green" = one colour for the whole flood
  const color = out.dataset.color ?? FLOOD_COLORS[Math.floor(Math.random() * FLOOD_COLORS.length)];
  if (color) span.className = color;
  span.textContent = text;
  out.append(span);
}
function floodFill(out) {
  for (let guard = 0; !floodFull(out) && guard < 3000; guard++) floodChunk(out, 24);
}
/* data-endless on a flood: it never stops. The text is laid out in fixed-width rows, and once
   the window is full it keeps going like a real terminal, scrolling up one row at a time. */
function floodCols(out) {
  const probe = document.createElement('span');
  probe.textContent = 'M'.repeat(20);
  out.append(probe);
  const charW = probe.offsetWidth / 20; // layout size, not the on-screen size reveal scales the slide to
  probe.remove();
  return Math.max(1, Math.floor(out.clientWidth / charW));
}
function floodRows(out, n, cols) {
  const chars = [...(out.dataset.char ?? '?')];
  while (n > 0) {
    let row = out.lastElementChild;
    if (!row || Number(row.dataset.len) >= cols) {
      row = document.createElement('div');
      row.className = 'flood-row';
      row.dataset.len = '0';
      out.append(row);
    }
    const take = Math.min(n, cols - Number(row.dataset.len));
    let text = '';
    for (let i = 0; i < take; i++) text += Math.random() < 0.86 ? chars[Math.floor(Math.random() * chars.length)] : ' ';
    const span = document.createElement('span');
    const color = out.dataset.color ?? FLOOD_COLORS[Math.floor(Math.random() * FLOOD_COLORS.length)];
    if (color) span.className = color;
    span.textContent = text;
    row.append(span);
    row.dataset.len = String(Number(row.dataset.len) + take);
    n -= take;
  }
  // keep the newest output in view and drop rows that scrolled far out of sight
  const body = floodBody(out);
  body.scrollTop = body.scrollHeight;
  while (out.childElementCount > 120) out.firstElementChild.remove();
}
async function endlessFlood(block, out, id) {
  const cols = floodCols(out);
  if (reduceMotion) {
    for (let guard = 0; !floodFull(out) && guard < 500; guard++) floodRows(out, cols, cols);
    return id === runId;
  }
  await sleep(350);
  // starts as a trickle, speeds up, then keeps scrolling until the slide changes
  for (let step = 0; id === runId; step++) {
    floodRows(out, Math.min(1 + Math.floor(step / 5), Math.ceil(cols / 2)), cols);
    await sleep(40);
  }
  return false;
}

async function floodBlock(block, id) {
  const out = block.querySelector('.flood');
  block.classList.add('live');
  out.replaceChildren();
  if (out.hasAttribute('data-endless')) return endlessFlood(block, out, id);
  if (!reduceMotion) {
    await sleep(350);
    // starts as a trickle, then speeds up until the window is full
    for (let step = 0; id === runId && !floodFull(out); step++) {
      floodChunk(out, 1 + Math.floor(step / 5));
      await sleep(40);
    }
  }
  if (id !== runId) return false;
  floodFill(out);
  return true;
}

function resetBlock(block) {
  block.classList.remove('live');
  block.querySelector('.flood')?.replaceChildren();
  block.querySelectorAll('.stream > .line').forEach(resetLine);
  block.classList.remove('reached', 'done');
  const cmd = block.querySelector('.cmd');
  if (cmd) {
    cmd.classList.remove('typing', 'waiting');
    cmd.querySelector('.typed').textContent = '';
  }
}

function finishBlock(block) {
  const cmd = block.querySelector('.cmd');
  if (cmd) {
    cmd.classList.remove('typing', 'waiting');
    cmd.querySelector('.typed').textContent = cmd.dataset.full ?? '';
  }
  const flood = block.querySelector('.flood');
  if (flood) {
    block.classList.add('live');
    if (!flood.childElementCount) floodFill(flood);
  }
  if (block.querySelector('.stream')) {
    block.classList.add('live');
    block.querySelectorAll('.stream > .line').forEach(setLineFinal);
  }
  block.classList.add('reached', 'done');
}

// Returns false if a newer run took over while typing.
async function typeBlock(block, id, onTyped) {
  block.classList.add('reached');
  const cmd = block.querySelector('.cmd');
  const text = cmd?.dataset.full ?? '';

  if (text) {
    const typed = cmd.querySelector('.typed');
    cmd.classList.remove('waiting');
    if (reduceMotion) {
      typed.textContent = text;
    } else {
      cmd.classList.add('typing');
      await sleep(block.hasAttribute('data-wait') ? 250 : 450);
      const [min, max] = TERMINAL.typeSpeed;
      for (const ch of text) {
        if (id !== runId) return false;
        typed.textContent += ch;
        await sleep(min + Math.random() * (max - min));
      }
      await sleep(200);
      cmd.classList.remove('typing');
    }
  }
  if (id !== runId) return false;
  onTyped?.();
  if (!(await runOutput(block, id))) return false;
  block.classList.add('done');
  if (!reduceMotion) await sleep(300);
  return id === runId;
}

/* Bring a slide's terminal(s) to the right state for the number of steps
   (gates) already shown. Earlier steps are shown finished; the current step
   is typed out when `animate` is true. */
async function syncSlide(slide, { animate = false } = {}) {
  const id = ++runId;
  slide.classList.remove('processing');
  const groups = groupsOf(slide);
  const shown = slide.querySelectorAll('.gate.visible').length; // steps already taken

  groups.forEach((blocks, g) =>
    blocks.forEach((b) => (g < shown || (g === shown && !animate) ? finishBlock(b) : resetBlock(b))),
  );

  // data-clear on a step's first block = the screen is "cleared" when that step starts
  groups.forEach((blocks, g) => {
    const cleared = groups.some((later, h) => h > g && h <= shown && later[0]?.hasAttribute('data-clear'));
    blocks.forEach((b) => b.classList.toggle('cleared', cleared));
  });

  const answers = [...slide.querySelectorAll('.answer')];
  answers.forEach((a) => {
    const g = answerGate(a);
    a.textContent = g < shown || (g === shown && !animate) ? (a.dataset.text ?? '') : '';
  });

  // data-on="2,4": the element (a binary card) is "lit" while the slide is on one of these steps
  const cards = [...slide.querySelectorAll('[data-on]')];
  const setCards = (step) =>
    cards.forEach((c) => c.classList.toggle('on', c.dataset.on.split(',').map(Number).includes(step)));
  setCards(animate && shown > 0 ? shown - 1 : shown); // the new step lights up once it has run

  const windows = [...slide.querySelectorAll('.window.gated')];
  // done = has the current step finished; instant = skip the pop-open animation
  const setWindows = (done, instant) => {
    windows.forEach((w) => {
      const gate = Number(w.dataset.gate ?? 1);
      w.classList.toggle('instant', instant);
      const swap = w.hasAttribute('data-swap'); // swap windows close when the next step begins
      const closeAt = Number(w.dataset.closeAt ?? Infinity); // data-close-at="4": closes when step 4 begins
      w.classList.toggle('open', ((gate === shown && done) || (gate < shown && !swap)) && shown < closeAt);
    });
    slide.classList.toggle('windows-open', windows.some((w) => w.classList.contains('open'))); // lets other elements react (binary digits rise)
  };
  const prepareNext = () => {
    // show a blinking prompt while waiting for the next step
    const next = groups[shown + 1]?.[0];
    if (next) {
      next.classList.add('reached');
      next.querySelector('.cmd')?.classList.add('waiting');
    }
  };

  setWindows(!animate, true);
  if (!animate) {
    prepareNext();
    updateDesktop();
    return;
  }

  for (const a of answers.filter((el) => answerGate(el) === shown)) {
    if (!(await typeAnswer(a, id))) return;
  }
  // while a step's output runs the slide has .processing (a "Searching..." state on a web page, a pressed button)
  if (groups[shown]?.length) slide.classList.add('processing');
  for (const block of groups[shown] ?? []) {
    if (!(await typeBlock(block, id, block.hasAttribute('data-opens-early') ? () => setWindows(true, false) : undefined))) return;
    if (block.hasAttribute('data-opens')) setWindows(true, false); // window pops open mid-step
  }
  slide.classList.remove('processing');
  setCards(shown);
  setWindows(true, false); // pops the window open with its animation
  prepareNext();
  updateDesktop();
}

function enterSlide(slide) {
  runId++; // cancel anything still typing on the previous slide
  // wait a tick so reveal has finished showing/hiding fragments
  setTimeout(() => {
    const shown = slide.querySelectorAll('.gate.visible').length;
    syncSlide(slide, { animate: shown === 0 });
  }, 0);
}

// Pictures that are missing fall back to the placeholder
document.querySelectorAll('.window.preview img').forEach((img) => {
  const fallback = () => {
    if (!img.src.endsWith('/images/placeholder.svg')) img.src = `${import.meta.env.BASE_URL}images/placeholder.svg`;
  };
  img.addEventListener('error', fallback);
  if (img.complete && img.naturalWidth === 0) fallback();
});

/* ---------------------------------------------------------
   Menu bar clock, slide counter, dock indicators
   --------------------------------------------------------- */
const clock = document.querySelector('.menubar .clock');
function tick() {
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  clock.textContent = `${day}  ${time}`;
}
tick();
setInterval(tick, 10_000);

function updateDesktop() {
  const slide = deck.getCurrentSlide();
  document.querySelector('.menubar .slide-count').textContent =
    `${deck.getSlidePastCount() + 1} / ${deck.getTotalSlides()}`;

  const hasTerminal = !!slide.querySelector('.terminal');
  const popup = !!slide.querySelector('.preview.gated.open'); // a window just opened on top
  const hasPreview = !!slide.querySelector('.preview:not(.gated)') || popup;
  // a web browser window counts once it is on screen (gated ones only after they have opened)
  const hasBrowser = [...slide.querySelectorAll('.window.browser')].some((w) => !w.classList.contains('gated') || w.classList.contains('open'));
  document.querySelector('.dock [data-app="browser"]').classList.toggle('running', hasBrowser);
  // from the slide marked data-dock="claude" onwards, the Claude icon is in the dock, running
  const claude = document.querySelector('.dock [data-app="claude"]');
  const slides = deck.getSlides();
  const claudeFrom = slides.findIndex((s) => s.dataset.dock === 'claude');
  const hasClaude = claudeFrom >= 0 && slides.indexOf(slide) >= claudeFrom;
  claude.hidden = !hasClaude;
  claude.classList.toggle('running', hasClaude);
  document.querySelector('.dock [data-app="terminal"]').classList.toggle('running', hasTerminal);
  document.querySelector('.dock [data-app="preview"]').classList.toggle('running', hasPreview);
  document.querySelector('.menubar .app').textContent = popup
    ? 'Preview'
    : hasBrowser && !hasTerminal && !hasPreview ? 'Browser'
    : hasBrowser ? 'Desktop'
    : hasTerminal && !hasPreview ? 'Terminal' : hasPreview && !hasTerminal ? 'Preview' : 'Desktop';
}

/* ---------------------------------------------------------
   reveal.js
   --------------------------------------------------------- */
const deck = new Reveal({
  width: 1280,
  height: 720,
  margin: 0.12,
  hash: true,
  center: true,
  progress: false,
  slideNumber: false,
  transition: 'fade',
  transitionSpeed: 'fast',
  plugins: [Notes],
});

deck.on('ready', ({ currentSlide }) => {
  updateDesktop();
  enterSlide(currentSlide);
});
deck.on('slidechanged', ({ currentSlide }) => {
  updateDesktop();
  enterSlide(currentSlide);
});

// Gate fragments = "press next to run the next command"
deck.on('fragmentshown', ({ fragment }) => {
  if (fragment.classList.contains('gate')) syncSlide(deck.getCurrentSlide(), { animate: true });
});
deck.on('fragmenthidden', ({ fragment }) => {
  if (fragment.classList.contains('gate')) syncSlide(deck.getCurrentSlide(), { animate: false });
});

deck.initialize();
