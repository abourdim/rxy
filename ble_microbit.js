// ble_microbit.js — micro:bit BLE UART helper (Browser-only)
// Works with:
//  A) micro:bit UART service (UUID e95d...)
//  B) Nordic UART Service (NUS) (UUID 6e40...)
// Exposes globals: mbConnect(), mbDisconnect(), mbSendLine(line), mbIsConnected(), mbProfile()
// App hooks (optional):
//   window.mbOnLog(text, kind)
//   window.mbOnConnectionChange(connected)
//   window.mbOnChunk(chunkText)

const MB_UART_SERVICE_UUID = "e95d0753-251d-470a-a062-fa1922dfa9a8";
const MB_UART_RX_UUID      = "e95d93ee-251d-470a-a062-fa1922dfa9a8"; // write
const MB_UART_TX_UUID      = "e95d9250-251d-470a-a062-fa1922dfa9a8"; // notify

const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX_UUID      = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write
const NUS_TX_UUID      = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify

let btDevice = null;
let writeChar = null;
let notifyChar = null;
let connected = false;
let activeProfile = null; // "microbit-uart" | "nus"
let writeWithoutResponse = false;

window.mbOnLog = window.mbOnLog || ((text, kind) => console.log(kind || "info", text));
window.mbOnConnectionChange = window.mbOnConnectionChange || ((c) => console.log("BLE connected:", c));
window.mbOnChunk = window.mbOnChunk || ((chunk) => {});

function log(text, kind) { window.mbOnLog(text, kind || "info"); }
function setConn(c) { connected = c; window.mbOnConnectionChange(c); }

function encodeUtf8(str) { return new TextEncoder().encode(str); }

function onNotify(event) {
  const chunk = new TextDecoder().decode(event.target.value);
  try { window.mbOnChunk(chunk); } catch (e) {}
}

async function tryMicrobitUart(server) {
  log("BLE: trying micro:bit UART service…", "info");
  const service = await server.getPrimaryService(MB_UART_SERVICE_UUID);
  const rx = await service.getCharacteristic(MB_UART_RX_UUID);
  const tx = await service.getCharacteristic(MB_UART_TX_UUID);
  return { name: "microbit-uart", rx, tx };
}

async function tryNus(server) {
  log("BLE: trying Nordic UART service (NUS)…", "info");
  const service = await server.getPrimaryService(NUS_SERVICE_UUID);

  // Try exact UUIDs first
  let rx = null, tx = null;
  try { rx = await service.getCharacteristic(NUS_RX_UUID); } catch (e) {}
  try { tx = await service.getCharacteristic(NUS_TX_UUID); } catch (e) {}

  // Helper: pick characteristics by properties (more reliable across firmwares)
  async function pickByProps() {
    const chars = await service.getCharacteristics();
    // TX must support notify OR indicate
    const tx2 = chars.find(c => c.properties && (c.properties.notify || c.properties.indicate));
    // RX must support write OR writeWithoutResponse
    const rx2 = chars.find(c => c.properties && (c.properties.writeWithoutResponse || c.properties.write));
    return { rx2, tx2 };
  }

  // Validate properties even if UUID lookup succeeded
  const txOk = !!(tx && tx.properties && (tx.properties.notify || tx.properties.indicate));
  const rxOk = !!(rx && rx.properties && (rx.properties.writeWithoutResponse || rx.properties.write));

  if (!txOk || !rxOk) {
    log("BLE: NUS char properties mismatch, rescanning by properties…", "info");
    const picked = await pickByProps();
    if (!rxOk) rx = picked.rx2;
    if (!txOk) tx = picked.tx2;
  }

  if (!rx || !tx) throw new Error("NUS characteristics not found");
  return { name: "nus", rx, tx, service };
}

async function mbConnect() {
  try {
    if (!navigator.bluetooth) {
      log("Web Bluetooth not available. Use Chrome/Edge.", "error");
      return false;
    }

    log("BLE: requesting device…", "info");
    // Prefer filtering to avoid accidentally selecting a non-micro:bit device
    // that happens to expose a UART-like service.
    btDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [MB_UART_SERVICE_UUID, NUS_SERVICE_UUID]
    });

    btDevice.addEventListener("gattserverdisconnected", () => {
      log("BLE: device disconnected", "error");
      setConn(false);
    });

    log("BLE: connecting GATT…", "info");
    const server = await btDevice.gatt.connect();

    let prof = null;
    try {
      prof = await tryMicrobitUart(server);
    } catch (e1) {
      log("BLE: micro:bit UART not found, falling back to NUS…", "info");
      prof = await tryNus(server);
    }

    writeChar = prof.rx;
    notifyChar = prof.tx;
    activeProfile = prof.name;

    writeWithoutResponse = !!(writeChar.properties && writeChar.properties.writeWithoutResponse);

    // Start notifications; if the chosen TX does not actually support notify,
    // rescan and retry once (some stacks still return the UUID but disallow notify)
    log("BLE: starting notifications…", "info");
    try {
      await notifyChar.startNotifications();
    } catch (e2) {
      // Only retry for NUS profile
      if (activeProfile === "nus") {
        log("BLE: startNotifications failed, rescanning NUS chars and retrying…", "error");
        // Re-open service and pick by properties
        const service = await server.getPrimaryService(NUS_SERVICE_UUID);
        const chars = await service.getCharacteristics();
        const tx2 = chars.find(c => c.properties && (c.properties.notify || c.properties.indicate));
        const rx2 = chars.find(c => c.properties && (c.properties.writeWithoutResponse || c.properties.write));
        if (rx2) writeChar = rx2;
        if (tx2) notifyChar = tx2;
        writeWithoutResponse = !!(writeChar && writeChar.properties && writeChar.properties.writeWithoutResponse);
        await notifyChar.startNotifications();
      } else {
        throw e2;
      }
    }
    notifyChar.addEventListener("characteristicvaluechanged", onNotify);

    setConn(true);
    log("BLE connected ✔ profile=" + activeProfile, "success");
    return true;

  } catch (err) {
    // Avoid optional chaining for broad compatibility
    let emsg = "unknown error";
    try {
      if (err && err.message) emsg = "" + err.message;
      else if (err) emsg = "" + err;
    } catch (e) {}
    log("BLE connect failed: " + emsg, "error");
    setConn(false);
    return false;
  }
}

async function mbDisconnect() {
  try {
    log("BLE: disconnecting…", "info");
    if (notifyChar) {
      try { await notifyChar.stopNotifications(); } catch (e) {}
    }
    if (btDevice && btDevice.gatt && btDevice.gatt.connected) btDevice.gatt.disconnect();
  } finally {
    activeProfile = null;
    writeChar = null;
    notifyChar = null;
    setConn(false);
    log("BLE disconnected", "info");
  }
}

// Send a line with newline; chunk to 20 bytes for reliability
async function mbSendLine(line) {
  if (!writeChar || !connected) {
    log("TX blocked (not connected): " + line, "error");
    return false;
  }
  const data = encodeUtf8(line + "\n");
  try {
    log("TX > " + line, "tx");
    const CHUNK = 20;
    for (let i = 0; i < data.length; i += CHUNK) {
      const slice = data.slice(i, i + CHUNK);
      if (writeWithoutResponse && writeChar.writeValueWithoutResponse) {
        await writeChar.writeValueWithoutResponse(slice);
      } else {
        await writeChar.writeValue(slice);
      }
    }
    return true;
  } catch (err) {
    let emsg = "unknown error";
    try {
      if (err && err.message) emsg = "" + err.message;
      else if (err) emsg = "" + err;
    } catch (e) {}
    log("TX error: " + emsg, "error");
    return false;
  }
}

function mbIsConnected() { return connected; }
function mbProfile() { return activeProfile; }

window.mbConnect = mbConnect;
window.mbDisconnect = mbDisconnect;
window.mbSendLine = mbSendLine;
window.mbIsConnected = mbIsConnected;
window.mbProfile = mbProfile;
