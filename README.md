# Career Day Presentation

A slide deck built with [reveal.js](https://revealjs.com) and Vite.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the dev server with live reload
- `npm run build` — build a static site into `dist/`
- `npm run preview` — preview the built site

## Structure

- `index.html` — the slides (each `<section>` is a slide; nested sections are vertical slides)
- `src/main.js` — reveal.js setup, plugins and theme
- `src/styles.css` — custom styles
- `public/images/` — images, referenced as `/images/name.png`

## Tips

- Press `S` for speaker notes (`<aside class="notes">`), `Esc` for the overview, `F` for fullscreen.

## Desktop theme

The deck looks like a computer desktop: wallpaper, menu bar (live clock + slide counter) and a dock
whose Terminal / Preview icons light up when that kind of window is on the slide.

**Terminal window** — each `.cmd-block` types its command, then shows its output. An idle prompt
with a blinking cursor is added at the end (opt out with `data-no-idle`).

```html
<div class="window terminal" data-title="optional title">
  <div class="cmd-block">
    <div class="cmd">whoami</div>
    <div class="out">Output goes here</div>
  </div>
</div>
```

Use `<div class="out pre">` to keep line breaks/spacing exactly as typed. Text helpers:
`.big`, `.dim`, `.green`, `.blue`, `.yellow`, `.pink`. Fragments work inside `.out`.

**Preview (image) window**

```html
<div class="window preview" data-title="photo.jpg" data-subtitle="1 of 3" data-caption="Optional caption">
  <img src="/images/photo.jpg" alt="Description" />
</div>
```

**Click-to-continue steps (the icebreaker slides)** — the name types out first; pressing next types a
second command and a Preview window pops open on top. Copy any icebreaker slide in `index.html`:
`data-wait` on a `.cmd-block` pauses before it, the `<span class="fragment gate">` is the "press next"
step, and `.window.preview.gated` stays hidden until that step has run (`data-gate="2"` for later steps).
Put the pictures in `public/images/icebreaker/` named `haskell.png`, `onix.png`, … — a missing
picture shows the placeholder, and for a `.jpg` change the extension in the slide's `src` and command.

**Sizes & layout** — add `sm` or `lg` to a `.window`; wrap two windows in `<div class="split">` to show them side by side.

**Customise** — prompt user/host/folder and typing speed are in the `TERMINAL` settings at the top of
`src/main.js` (or per window with `data-user`, `data-host`, `data-dir`). Colours and wallpaper are CSS
variables at the top of `src/styles.css`.

## Publishing (GitHub Pages)

The site is fully static. `npm run build` writes it to `dist/`, using relative URLs (`base: './'` in
`vite.config.js`), so it works from `https://<user>.github.io/<repo>/` or any other static host.
Fonts are bundled, so it also works offline once loaded.

1. Push this repo to GitHub (branch `main`).
2. In the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes the deck.

Pictures live in `public/images/` and are published with the site, so only commit images you are happy
to have public. To present without internet, run `npm run build` then `npm run preview`
(opening `dist/index.html` directly from disk does not work because browsers block module scripts on `file://`).
