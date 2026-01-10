# micro:bit BLE Dynamic UI (RemoteXY-style)

This project gives you a **100% in-browser Web App** that connects to a **micro:bit over BLE UART** and renders a **custom GUI defined by the micro:bit**.

## What’s inside

- `builder.html` – GUI Builder (creates JSON config + MakeCode snippet)
- `runtime.html` – Web Runtime (connects over BLE, requests config, renders UI)
- `ble_microbit.js` – Browser BLE helper (auto-detects micro:bit UART or NUS)
- `microbit/microbit_full.js` – Example MakeCode JS for micro:bit (UART + widgets)

## Protocol (v1)

### Get config
- Web → micro:bit: `GETCFG`

### Framed JSON config (recommended)
- micro:bit → Web:
  - `CFGBEGIN <len>`
  - `<raw JSON characters, length exactly <len>>`
  - `CFGEND` (optional; runtime ignores it if length framing is used)

### User events
- Web → micro:bit: `SET <id> <value>`

### Micro:bit updates
- micro:bit → Web: `UPD <id> <value>`

## Run the web app (important)

**Do NOT open `runtime.html` by double-click** (`file://`) — Web Bluetooth may fail.

Serve it locally:

```bash
cd /path/to/project-folder
python3 -m http.server 8038
```

Open:

- http://localhost:8038/runtime.html
- http://localhost:8038/builder.html

## Use it

### 1) Flash the micro:bit (MakeCode)

1. Open MakeCode: https://makecode.microbit.org/
2. Create a new project
3. Paste `microbit/microbit_full.js` into JavaScript
4. **Project Settings → Bluetooth → No Pairing Required**
5. Download and flash to micro:bit

### 2) Connect from the Runtime

1. Open `runtime.html`
2. Click **Connect**
3. Select your micro:bit
4. The runtime sends `GETCFG`
5. micro:bit replies `CFGBEGIN ...` + JSON
6. UI appears

### 3) Build your own GUI

1. Open `builder.html`
2. Add/edit widgets
3. Click **Export MakeCode**
4. Copy the generated snippet into your MakeCode project (replace the config section)
5. Flash micro:bit again
6. Runtime will show your new GUI

## Widgets supported

- `btn` – Button (press/release → `SET id 1/0`)
- `tgl` – Toggle (`SET id 0/1`)
- `sld` – Slider (`SET id value`)
- `g` – Gauge (read-only, update via `UPD`)
- `lvl` – Level meter (read-only, update via `UPD`)
- `txt` – Text label (read-only, update via `UPD`)
- `joy` – Joystick pad (`SET id x,y` where x,y ∈ [-100..100])
- `led` – LED 5x5 bit grid (`SET id <25bits>`)
- `snd` – Sound (`SET id freq,ms`)

## Troubleshooting

### “GATT Error: Not supported”
- Close other BLE apps/tabs (only one can connect sometimes)
- Power-cycle the micro:bit (unplug/replug)
- Make sure you are using **Chrome/Edge** and **http://localhost**
- Ensure micro:bit program includes `bluetooth.startUartService()`

### UI config JSON.parse error
- With this version, the runtime uses **length framing**, so chunking is safe.
- Ensure the micro:bit sends `CFGBEGIN <len>` where `<len>` is exactly `UI_CFG_JSON.length`.

## Next improvements (easy)
- Add more widget types (graph, numeric keypad, dropdown)
- Add ACK/ERR messages from micro:bit
- Add “auto codegen” for `handleSet()` stubs from widget IDs
