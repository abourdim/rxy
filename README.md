# micro:bit BLE GUI (RemoteXY-lite+)

A **browser-only** “RemoteXY-like” system for **micro:bit over BLE (Web Bluetooth + UART)**:

- **builder.html** — build a simple GUI (grid layout) and export micro:bit config code.
- **runtime.html** — connect to micro:bit, download its GUI config, render controls dynamically, send events, receive updates.
- **microbit/microbit_full.js** — a full MakeCode JavaScript example that serves the config and handles widget events.

No servers, no frameworks. Just static files.

---

## Browser support

Web Bluetooth works best on:
- **Chrome / Edge (desktop)**
- **Chrome (Android)**

It generally does **not** work on iOS Safari (no Web Bluetooth) and often not on Firefox.

Also: Web Bluetooth requires **HTTPS** or **http://localhost**.

---

## Quick start (desktop)

### 1) Download + run locally
Put these files in a folder and run:

```bash
cd path/to/project
python3 -m http.server 8000
```

Open:
- Builder: `http://localhost:8000/builder.html`
- Runtime: `http://localhost:8000/runtime.html`

(Using `localhost` is allowed even though it's HTTP.)

---

## micro:bit setup (MakeCode)

1) Open https://makecode.microbit.org/
2) Create a new project, switch to **JavaScript**.
3) Copy/paste the content of `microbit/microbit_full.js`.
4) In MakeCode:
   - **Gear icon → Project Settings → Bluetooth**
   - Enable **No Pairing Required** (recommended)
5) Download and flash to micro:bit.

---

## How it works (protocol)

The Runtime asks for the GUI config:

- Web → micro:bit:  
  `GETCFG`

micro:bit can respond in any of these formats (Runtime supports all):

### A) Framed JSON (recommended)
```
CFGBEGIN <len>
{...raw JSON...}
CFGEND
```

### B) Legacy base64 (small configs)
```
CFG <base64(json)>
```

### C) Chunked base64 (large configs)
```
CFGB64BEGIN <chunks> <len>
CFGB64 0 <chunk>
CFGB64 1 <chunk>
...
CFGB64END
```

Events + updates:

- Web → micro:bit: `SET <id> <value...>`
- micro:bit → Web: `UPD <id> <value...>`

---

## Using the Builder

1) Open **builder.html**
2) Add widgets (Button, Toggle, Slider, Gauge, Level, Text, Joystick, LED Grid, Sound)
3) Click a widget in Preview to edit label/position/size, etc.
4) Export:
   - **Export MakeCode (framed JSON)** — paste the generated snippet into your MakeCode project
   - or **Export MakeCode (legacy base64)** — if you want the older format (Runtime supports both)
5) Builder automatically saves your latest config in **localStorage** for Offline Preview.

---

## Using the Runtime

1) Open **runtime.html**
2) Click **Connect**
3) Choose your micro:bit (usually appears as “BBC micro:bit”)
4) Runtime sends `GETCFG`, receives the config, renders UI.
5) Interact — it sends `SET ...`, micro:bit can reply with `UPD ...`.

### Offline preview mode

Click **Offline preview**:
- **Load from Builder**: loads the last config the Builder saved
- or paste JSON manually and click **Apply pasted JSON**

This lets you design/test UI without a micro:bit connected.

---

## Widgets included

- `btn` — button (press/release)
- `tgl` — toggle (0/1)
- `sld` — slider (min/max/step)
- `g` — gauge (read-only)
- `lvl` — level bar (read-only)
- `txt` — text (read-only)
- `joy` — joystick (sends `SET id x y`, -100..100)
- `led` — 5x5 LED grid (sends `SET id <25-bitstring>`)
- `snd` — sound (sends `SET id VOL n` and `SET id PLAY`)

---

## Tips

- If your config becomes large, prefer **chunked base64** for maximum robustness.
- Keep `UPD` values short (no newlines).
- If you add your own widget types, extend both:
  - runtime renderer (`renderUI`)
  - micro:bit `handleSet` / telemetry (`upd`)

---

## Files

- `builder.html`
- `runtime.html`
- `microbit/microbit_full.js`
