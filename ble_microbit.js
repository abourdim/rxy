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

  const isNotifier = (c) => !!(c && c.properties && (c.properties.notify || c.properties.indicate));
  const isWriter = (c) => !!(c && c.properties && (c.properties.writeWithoutResponse || c.properties.write));

  // Try exact UUIDs first
  let rx = null, tx = null;
  try { rx = await service.getCharacteristic(NUS_RX_UUID); } catch (e) {}
  try { tx = await service.getCharacteristic(NUS_TX_UUID); } catch (e) {}

  // Validate properties; some firmwares expose different UUIDs / properties.
  if (rx && !isWriter(rx)) rx = null;
  if (tx && !isNotifier(tx)) tx = null;

  // If that fails, pick by properties
  if (!rx || !tx) {
    log("BLE: notify failed, rescanning NUS chars…", "info");
    const chars = await service.getCharacteristics();
    if (!tx) tx = chars.find(isNotifier);
    if (!rx) rx = chars.find(isWriter);
  }

  if (!rx || !tx) throw new Error("NUS characteristics not found (need notify/indicate + write)");
  return { name: "nus", rx, tx, service };
}

async function mbConnect() {
  try {
    if (!navigator.bluetooth) {
      log("Web Bluetooth not available. Use Chrome/Edge.", "error");
      return false;
    }

    log("BLE: requesting device…", "info");
    btDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
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

    log("BLE: starting notifications…", "info");
    try {
      await notifyChar.startNotifications();
    } catch (eNotify) {
      // Some NUS implementations expose different TX characteristics or only indicate.
      // Retry by rescanning characteristics and picking one that supports notify/indicate.
      if (activeProfile === "nus" && prof.service) {
        log("BLE: notify failed, rescanning NUS chars…", "info");
        const chars = await prof.service.getCharacteristics();
        const tx2 = chars.find(c => c.properties && (c.properties.notify || c.properties.indicate));
        if (tx2) {
          notifyChar = tx2;
          await notifyChar.startNotifications();
        } else {
          throw eNotify;
        }
      } else {
        throw eNotify;
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
