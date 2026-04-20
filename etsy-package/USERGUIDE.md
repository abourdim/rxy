# `etsy-package/` — User Guide

Everything in this folder exists for **one purpose**: to publish and maintain
the **Micro:bit Remote Builder** listing on Etsy.

> 🛒 **Create a listing**: <https://www.etsy.com/your/shops/me/listing-editor/create>

This guide walks through each file, what it's for, and at which step of
the Etsy workflow you actually use it.

---

## The product in one paragraph

**Micro:bit Remote Builder** is a drag-and-drop Bluetooth remote designer
for the BBC micro:bit V1 or V2. Users drag widgets onto a canvas, tap
**📄 Code** to auto-generate a MakeCode program, paste it into
`makecode.microbit.org`, flash their board, then switch to **▶️ Play**
and pair over BLE UART. No coding required.

- **Top bar — 6 buttons:** ✏️ Build · ▶️ Play · 🎮 Demo · 📦 Export · 📂 Import · 📄 Code
- **12 widgets** — 7 inputs (Button, Slider, Toggle, Joystick, D-Pad, XY Pad, Timer) and 5 outputs (LED, Label, Gauge, Graph, Battery)
- **Properties panel per widget:** Label, Model (neo / glass / neon), Size, Min/Max, Colors
- **Tagline:** "Build • Pair • Play — no code required"

Everything in this folder is for packaging and selling that product.

---

## Tour of the folder

```
etsy-package/
├── USERGUIDE.md                 📘 This document
├── README.md                    📄 Short layout reference
├── build-package.js             🛠  ZIP builder (Node + Playwright)
├── LICENSE.txt                  📜 Buyer license (ships in the ZIP)
│
├── quickstart-card.html         🖨 A4 printable
├── shortcuts-cheatsheet.html    🖨 A4 landscape printable (Builder controls & widget reference)
├── classroom-poster.html        🖨 A3 printable
├── lesson-plan-template.html    🖨 A4 printable
├── sticker-sheet.html           🖨 A4 printable
├── README-quickstart.html       🖨 A4 printable
├── etsy-listing-mockups.html    🖼 Source for the 7 listing images
│
├── output/                      🔧 Rendered PNGs (rebuilt on demand)
├── MicrobitRemote-v*/           📦 Build staging dir (rebuilt on demand)
├── MicrobitRemote-v*.zip        📦 Final ZIP (this is what the buyer downloads)
│
└── seller-only/                 🔒 Never ships to the buyer
    ├── ETSY_LISTING.md
    ├── ETSY_LISTING.html
    ├── ETSY_PUBLISH_GUIDE.html
    ├── etsy-playbook.html       (EN)
    ├── etsy-playbook-fr.html    (FR)
    ├── etsy-playbook-ar.html    (AR)
    ├── ETSY-1MIN-PLAYBOOK.md
    ├── LICENSE-SITE
    ├── SITE_LICENSE_CERTIFICATE.html
    ├── TODO.md
    └── pinterest-pins.html
```

---

## The two kinds of files

| Kind | Who sees it | Where it goes |
|------|-------------|---------------|
| **Buyer-facing** | The customer who pays on Etsy | Bundled into the ZIP, or used as listing images |
| **Seller-only** | You (and anyone running this shop) | Stays on your disk / in this repo — never uploaded |

Anything under `seller-only/` is strategy, legal, or video-production
material. It is never copied into the ZIP and should never be pasted
into the Etsy listing itself unless explicitly intended (e.g. title,
description, tags — which live in `ETSY_LISTING.md`).

---

## File-by-file reference

### 🛠 Tooling

#### `build-package.js`
- **What:** Node script that renders the printable HTML templates to
  PNG via Playwright, renders the 7 Etsy listing mockups, and zips
  everything into `MicrobitRemote-v<version>.zip`.
- **When to use:** every time you make a release. Run from the repo root:
  ```bash
  node etsy-package/build-package.js
  # or
  npm run build:etsy
  ```
- **Outputs:**
  - `etsy-package/output/*.png` (printables + mockups, rebuilt)
  - `etsy-package/MicrobitRemote-v<version>/` (staging dir, rebuilt)
  - `etsy-package/MicrobitRemote-v<version>.zip` (the buyer ZIP)

### 📜 Buyer license

#### `LICENSE.txt`
- **What:** the end-user license that ships inside the ZIP. Single-user
  / single-classroom terms. Covers the app + printables.
- **When to use:** automatically copied into the ZIP by `build-package.js`.

### 🖨 Printables (shipped in the ZIP)

All six are standalone HTML files designed to be rendered as PNGs by
`build-package.js` and included in the buyer ZIP under `printables/`.
The HTML sources ship too, so teachers can tweak them.

#### `quickstart-card.html` — A4 portrait
- **What:** 5-step setup card: Build → style in the Properties panel → 📄 Code → flash → Pair & Play. Plus a widget cheat grid.
- **When to use:** buyers print it as the first thing they hold when they unzip the package.

#### `shortcuts-cheatsheet.html` — A4 landscape
- **What:** Builder controls & widget reference — the 6 top-bar buttons, the 12-widget palette, the Properties panel fields, the BLE state cheat, and the BLE UART protocol. (The app has no keyboard shortcuts — it's a drag-drop + button UI.)
- **When to use:** teachers print and pin next to the classroom PC.

#### `classroom-poster.html` — A3 portrait
- **What:** "Build Your Own Remote Control!" poster in 5 big kid-safe steps, ending on the tagline.
- **When to use:** teachers print on A3 for classroom walls.

#### `lesson-plan-template.html` — A4 portrait
- **What:** Editable 45-minute lesson-plan template + one ready-to-teach sample ("Build a 2-Button Robot Remote") with a rubric.
- **When to use:** sell the "teacher-friendly" angle. Print, fill in by hand or in Canva, hand out.

#### `sticker-sheet.html` — A4 portrait
- **What:** 30 circular achievement badges — "First Widget Placed", "BLE Connected", "MakeCode Copied", "12 Widgets Mastered", "Joystick Jedi", "Robot Ready", "No Code Hero", "Theme Shifter", "JSON Exported" and more.
- **When to use:** teachers print on sticker paper (Avery 22807 or similar) for student rewards.

#### `README-quickstart.html` — A4 portrait
- **What:** Polished buyer welcome page ("Thank you for buying…" + the first 3 things to do).
- **When to use:** ships alongside `README.md` in the ZIP so buyers see a printable welcome, not just a plain text file.

### 🖼 Listing mockups

#### `etsy-listing-mockups.html`
- **What:** a single HTML file containing 7 `<div class="mockup">` elements, each 2000×1500 px. Rendered by `build-package.js` into `output/etsy-mockup-1.png` … `etsy-mockup-7.png`.
- **The seven mockups:**
  1. **Hero** — product name + tagline + screenshot + compat badge
  2. **Widget palette** — all 12 widgets labeled
  3. **MakeCode generation view** — shows "Auto MakeCode"
  4. **Play mode** — controlling a robot/target
  5. **What's in the ZIP** — file manifest
  6. **Theme showcase** — neo / glass / neon
  7. **Use cases** — robot control / game controller / smart-home
- **When to use:** upload as the 7 listing images on Etsy in this order. Etsy shows the first image as the thumbnail in search.

### 🔒 `seller-only/` — strategy, legal, video

All files here are **gitignored for the ZIP** (the build script never
touches them) and should never be pasted verbatim into the public
Etsy listing.

#### `ETSY_LISTING.md` and `ETSY_LISTING.html`
- **What:** the full business playbook. Title, description, pricing ladder (Launch $12.99 → Standard $17.99 → Bundle $29.99 → Tripwire $5 → Site $199 → District $499 → Promo `RXYLAUNCH` $7), all candidate tags, paste-ready social copy, compare table, FAQ, post-purchase templates. `.html` is the HTML twin of the `.md`.
- **When to use:** your source of truth when you're actually typing into the Etsy "Create listing" form. Copy from here, paste into Etsy.

#### `ETSY_PUBLISH_GUIDE.html`
- **What:** photo & video plan for launch day. 10-image shot list, 60-second video plan, social launch week, post-launch checklist.
- **When to use:** open this in a browser **first** on launch day.

#### `etsy-playbook.html` / `-fr.html` / `-ar.html`
- **What:** 60-second video script + shot list for the Etsy listing video. Trilingual EN / FR / AR (Etsy lets you upload one video per listing; use whichever language best matches your target audience, or record three separate videos for international listings).
- **When to use:** day you film the product video. Keep the playbook open on a second screen while recording.

#### `ETSY-1MIN-PLAYBOOK.md`
- **What:** Markdown twin of the playbooks. Same content (EN), easier to diff in Git when you iterate.
- **When to use:** interchangeable with the HTML — use whichever is handier.

#### `LICENSE-SITE`
- **What:** legal text for the **School Site License** tier ($199, up to 30 teachers at one school, unlimited students).
- **When to use:** when you create the higher-tier listing on Etsy. Rename to `LICENSE` inside that tier's ZIP before shipping.

#### `SITE_LICENSE_CERTIFICATE.html`
- **What:** per-sale certificate template. Fill in the school name, order date, number of seats → print to PDF → email to the buyer.
- **When to use:** after each School Site License order on Etsy.

#### `TODO.md`
- **What:** pre-launch manual checklist — the tasks the build pipeline can't automate (shoot hero photo, record video, create promo code).
- **When to use:** review before hitting Publish on Etsy.

#### `pinterest-pins.html`
- **What:** 4 ready-to-screenshot Pinterest pin layouts (hero, widget palette, what's in the ZIP, themes/workflow).
- **When to use:** launch-week social plan.

---

## The full Etsy workflow, in order

Numbered by when each file enters the picture:

### 1. Prep (once per release)

1. Bump `VERSION` in `build-package.js` and `package.json` (and `product.json`).
2. Run `npm run build:etsy` — produces the ZIP and the 7 mockup PNGs.
3. Open `seller-only/ETSY_LISTING.md`, update anything that changed (features list, pricing, version number).
4. Preview `etsy-listing-mockups.html` in Chrome; verify all 7 mockups render with current branding.

### 2. Record the video (once per language)

5. Open `seller-only/etsy-playbook.html` (EN / FR / AR) on a second screen. Record following the shot list.
6. Export a 60-second MP4, ≤100 MB, 1080p or higher (Etsy's limit).

### 3. Create the listing (launch day)

7. Open `seller-only/ETSY_PUBLISH_GUIDE.html` in Chrome. Tick each step.
8. Create the Etsy listing. Paste title, description, tags from `seller-only/ETSY_LISTING.md`.
9. Upload the 7 mockup PNGs from `output/etsy-mockup-1.png` … `etsy-mockup-7.png` **in numeric order** (Etsy uses the first one as the thumbnail).
10. Upload the video from step 6.
11. Attach the digital file: `MicrobitRemote-v<version>.zip`.
12. Set pricing from the `ETSY_LISTING.md` pricing table.
13. Publish.

### 4. After each sale

14. For a **single-user** or **classroom** sale: nothing to do — Etsy delivers the ZIP automatically. The buyer opens the ZIP and sees `README-quickstart.html` + `quickstart-card.pdf` first.
15. For a **School Site License** sale: fill in `seller-only/SITE_LICENSE_CERTIFICATE.html`, print to PDF, email to the buyer.

### 5. Ongoing maintenance

16. When the app ships a new feature, edit `ETSY_LISTING.md`, bump the version, re-run `npm run build:etsy`, and update the Etsy listing's description + attached ZIP.

---

## Rules of thumb

- **Never** paste pricing strategy from `ETSY_LISTING.md` into the public listing description — that's your playbook, not the pitch.
- **Never** zip `seller-only/` manually into the buyer ZIP. `build-package.js` intentionally excludes it.
- **Always** rebuild the ZIP after editing anything in `assets/`, `script.js`, `styles.css`, `index.html`, or the root app files.
- When in doubt: if a file has "LISTING", "PUBLISH", "PLAYBOOK", "SITE", "CERTIFICATE", or "TODO" in its name — it's seller-only.

---

See also:
- [../README.md](../README.md) — project overview
- [README.md](README.md) — short layout reference
