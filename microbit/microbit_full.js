// micro:bit MakeCode (JavaScript) — RemoteXY-lite+
// This program:
// - Serves a GUI config to the Web Runtime over BLE UART
// - Receives SET events from the Web UI
// - Sends UPD updates back (telemetry / UI state)
//
// Protocol supported:
//   Web -> micro:bit:  GETCFG
//   micro:bit -> Web:  (A) Framed JSON: CFGBEGIN <len> ... CFGEND
//                      (B) Chunked base64: CFGB64BEGIN <chunks> <len> ; CFGB64 i chunk ; CFGB64END
//   Web -> micro:bit:  SET <id> <value...>
//   micro:bit -> Web:  UPD <id> <value...>
//
// IMPORTANT (MakeCode): enable Bluetooth -> "No Pairing Required" in Project Settings.

bluetooth.startUartService()

// --------------------------
// 1) CONFIG (edit/generated)
// --------------------------
// Recommended: Framed JSON, stored as parts for readability.
// Builder can generate this for you.
const UI_CFG_PARTS: string[] = [
  // Example UI with all widgets:
  "{\"v\":1,\"title\":\"micro:bit Controller\",\"grid\":{\"w\":12,\"h\":8},\"widgets\":[",
  "{\"id\":\"btn1\",\"t\":\"btn\",\"w\":4,\"h\":2,\"label\":\"Button\",\"x\":0,\"y\":0},",
  "{\"id\":\"tgl1\",\"t\":\"tgl\",\"w\":4,\"h\":2,\"label\":\"Toggle\",\"value\":0,\"x\":4,\"y\":0},",
  "{\"id\":\"sld1\",\"t\":\"sld\",\"w\":12,\"h\":2,\"label\":\"Slider\",\"min\":0,\"max\":100,\"step\":1,\"value\":50,\"x\":0,\"y\":2},",
  "{\"id\":\"g1\",\"t\":\"g\",\"w\":9,\"h\":2,\"label\":\"Temp Gauge\",\"min\":0,\"max\":100,\"value\":0,\"x\":0,\"y\":4},",
  "{\"id\":\"lvl1\",\"t\":\"lvl\",\"w\":3,\"h\":4,\"label\":\"Light\",\"min\":0,\"max\":255,\"value\":0,\"x\":9,\"y\":4},",
  "{\"id\":\"txt1\",\"t\":\"txt\",\"w\":12,\"h\":2,\"label\":\"Status\",\"value\":\"Hello\",\"x\":0,\"y\":6},",
  "{\"id\":\"joy1\",\"t\":\"joy\",\"w\":6,\"h\":6,\"label\":\"Joystick\",\"deadzone\":5,\"x\":6,\"y\":0},",
  "{\"id\":\"led1\",\"t\":\"led\",\"w\":6,\"h\":6,\"label\":\"LED 5x5\",\"bits\":\"0000000000000000000000000\",\"x\":0,\"y\":0},",
  "{\"id\":\"snd1\",\"t\":\"snd\",\"w\":6,\"h\":3,\"label\":\"Sound\",\"vol\":60,\"x\":6,\"y\":6}",
  "]}"
]
const UI_CFG_JSON = UI_CFG_PARTS.join("")

// Optional: legacy base64 config (for maximum compatibility).
// If you want to use chunked base64, paste generated parts here (Builder can generate it).
const UI_B64_PARTS: string[] = [
  // e.g. "eyJ2IjoxLCJ0aXRsZSI6Ii4uLiJ9" ...
]
const UI_CFG_B64 = UI_B64_PARTS.join("")

// --------------------------
// 2) Helpers
// --------------------------
function sendLine(s: string) {
    bluetooth.uartWriteLine(s)
}

function upd(id: string, value: any) {
    // Keep messages short; value can be number or string (no newlines).
    sendLine("UPD " + id + " " + value)
}

// Framed JSON (preferred)
function sendConfigFramedJson() {
    sendLine("CFGBEGIN " + UI_CFG_JSON.length)
    bluetooth.uartWriteString(UI_CFG_JSON)
    sendLine("") // ensure newline boundary after uartWriteString
    sendLine("CFGEND")
}

// Chunked base64 (fallback for very large configs or older runtimes)
function sendConfigB64Chunked() {
    // If UI_CFG_B64 is empty, this won't work.
    if (UI_CFG_B64.length == 0) {
        // Fall back to framed JSON
        sendConfigFramedJson()
        return
    }
    sendLine("CFGB64BEGIN " + UI_B64_PARTS.length + " " + UI_CFG_B64.length)
    for (let i = 0; i < UI_B64_PARTS.length; i++) {
        sendLine("CFGB64 " + i + " " + UI_B64_PARTS[i])
    }
    sendLine("CFGB64END")
}

// Choose best send mode automatically
function sendConfig() {
    // If config JSON is very large, framed JSON still works for most cases,
    // but chunked base64 is the most robust. Use base64 only if provided.
    if (UI_CFG_JSON.length > 500 && UI_CFG_B64.length > 0) {
        sendConfigB64Chunked()
    } else {
        sendConfigFramedJson()
    }
}

// --------------------------
// 3) Example state + actions
// --------------------------
let toggleState = 0
let sliderValue = 50
let soundVol = 60

// LED bits for led1 (25 chars '0'/'1')
let ledBits = "0000000000000000000000000"

// Joystick values -100..100
let joyX = 0
let joyY = 0

function renderLedBits(bits: string) {
    // bits index: row-major 5x5
    ledBits = bits
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const i = y * 5 + x
            if (bits.charAt(i) == "1") led.plot(x, y)
            else led.unplot(x, y)
        }
    }
}

function showJoyDirection(x: number, y: number) {
    basic.clearScreen()
    // Simple direction indicator
    if (x == 0 && y == 0) {
        led.plot(2, 2)
        return
    }
    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) led.plot(4, 2) else led.plot(0, 2)
    } else {
        if (y > 0) led.plot(2, 4) else led.plot(2, 0)
    }
}

// --------------------------
// 4) SET dispatcher
// --------------------------
function handleSet(id: string, valueStr: string) {

    // Button: btn1 (expects 1 press, 0 release)
    if (id == "btn1") {
        const v = parseInt(valueStr)
        if (v == 1) {
            basic.showIcon(IconNames.Happy)
            upd("txt1", "Button pressed")
        } else {
            basic.clearScreen()
            upd("txt1", "Button released")
        }
        upd("btn1", v)
        return
    }

    // Toggle: tgl1 (expects 0/1)
    if (id == "tgl1") {
        toggleState = parseInt(valueStr) ? 1 : 0
        if (toggleState) led.plot(2, 2) else led.unplot(2, 2)
        upd("tgl1", toggleState)
        upd("txt1", toggleState ? "Toggle ON" : "Toggle OFF")
        return
    }

    // Slider: sld1 (expects 0..100)
    if (id == "sld1") {
        sliderValue = parseInt(valueStr)
        if (sliderValue < 0) sliderValue = 0
        if (sliderValue > 100) sliderValue = 100
        const br = Math.idiv(sliderValue * 255, 100)
        led.plotBrightness(0, 0, br)
        upd("sld1", sliderValue)
        upd("txt1", "Slider=" + sliderValue)
        return
    }

    // Joystick: joy1 (expects "x y")
    if (id == "joy1") {
        const parts = valueStr.split(" ")
        if (parts.length >= 2) {
            joyX = parseInt(parts[0])
            joyY = parseInt(parts[1])
        } else {
            // Some runtimes may send "x,y"
            const p2 = valueStr.split(",")
            if (p2.length >= 2) { joyX = parseInt(p2[0]); joyY = parseInt(p2[1]); }
        }
        upd("joy1", "" + joyX + " " + joyY)
        showJoyDirection(joyX, joyY)
        return
    }

    // LED grid: led1 (expects 25-char bitstring)
    if (id == "led1") {
        if (valueStr.length == 25) {
            renderLedBits(valueStr)
            upd("led1", valueStr)
            upd("txt1", "LED updated")
        }
        return
    }

    // Sound: snd1
    // Commands:
    //   SET snd1 VOL <0..100>
    //   SET snd1 PLAY
    if (id == "snd1") {
        if (valueStr.substr(0, 3) == "VOL") {
            // "VOL 60"
            const v = parseInt(valueStr.substr(3).trim())
            soundVol = v
            if (soundVol < 0) soundVol = 0
            if (soundVol > 100) soundVol = 100
            music.setVolume(Math.idiv(soundVol * 255, 100))
            upd("txt1", "Volume=" + soundVol)
            upd("snd1", "VOL " + soundVol)
            return
        }
        if (valueStr == "PLAY") {
            music.setVolume(Math.idiv(soundVol * 255, 100))
            // Example: pitch depends on sliderValue
            const freq = 200 + sliderValue * 8
            music.playTone(freq, music.beat(BeatFraction.Eighth))
            upd("txt1", "Play " + freq + "Hz")
            upd("snd1", "PLAY")
            return
        }
        return
    }

    // Unknown
    upd("txt1", "Unknown SET: " + id)
}

// --------------------------
// 5) BLE RX handler
// --------------------------
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    const line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)).trim()

    if (line == "GETCFG") {
        sendConfig()
        return
    }

    if (line.substr(0, 4) == "SET ") {
        // SET <id> <value...>
        const parts = line.split(" ")
        if (parts.length >= 3) {
            const id = parts[1]
            const valueStr = parts.slice(2).join(" ")
            handleSet(id, valueStr)
        }
    }
})

// --------------------------
// 6) Telemetry loop (UPD)
// --------------------------
// Push temperature into g1 (0..100-ish)
// Push light level into lvl1 (0..255)
basic.forever(function () {
    const temp = input.temperature()
    let g = temp * 3
    if (g < 0) g = 0
    if (g > 100) g = 100
    upd("g1", g)

    const light = input.lightLevel() // 0..255
    upd("lvl1", light)

    // Status text
    upd("txt1", "T=" + temp + "C L=" + light + " Joy=" + joyX + "," + joyY)

    basic.pause(700)
})

// Startup
basic.showIcon(IconNames.Heart)
music.setVolume(Math.idiv(soundVol * 255, 100))
renderLedBits(ledBits)
