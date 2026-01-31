# 🎮 Micro:bit Remote Builder

![Powered by Workshop-DIY.org](https://img.shields.io/badge/Powered%20by-Workshop--DIY.org-blue?style=for-the-badge)
![micro:bit](https://img.shields.io/badge/micro:bit-V1%20%26%20V2-00ED00?style=for-the-badge)
![Bluetooth](https://img.shields.io/badge/Bluetooth-BLE-0082FC?style=for-the-badge)

> 🚀 **Build your own Bluetooth remote controller for micro:bit - No coding required!**

---

## 📋 Table of Contents

- [🌟 What is this?](#-what-is-this)
- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🎯 How It Works](#-how-it-works)
- [🔧 The Builder Interface](#-the-builder-interface)
- [🎮 All Widgets Explained](#-all-widgets-explained)
  - [📥 Input Widgets](#-input-widgets-you-control)
  - [📤 Output Widgets](#-output-widgets-micro-bit-controls)
- [💻 MakeCode Examples](#-makecode-examples)
- [🔌 Bluetooth Protocol](#-bluetooth-protocol)
- [❓ Troubleshooting](#-troubleshooting)
- [🌐 Links & Resources](#-links--resources)

---

## 🌟 What is this?

**Micro:bit Remote Builder** is a fun web app that lets you create custom Bluetooth remote controllers for your BBC micro:bit! 

🎨 **Drag & drop** widgets to design your remote  
📱 **Connect** via Bluetooth from your phone/tablet  
🎮 **Control** your micro:bit projects wirelessly!

Perfect for:
- 🤖 Robot control
- 🎮 Game controllers
- 💡 Smart home projects
- 🏎️ RC cars
- 🎵 Music instruments
- And anything you can imagine! 🚀

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Builder** | Drag & drop interface - no coding needed! |
| 📱 **Works Everywhere** | Phone, tablet, or computer |
| 🔵 **Bluetooth BLE** | Wireless connection to micro:bit |
| 🎮 **12 Widget Types** | Buttons, sliders, joysticks, and more! |
| 🌍 **Multi-language** | English, French, Arabic |
| 🎨 **Themes** | Multiple color themes to choose from |
| 💾 **Save & Load** | Export/import your designs |
| 📄 **Auto Code** | Generates MakeCode automatically! |

---

## 🚀 Quick Start

### Step 1: Design Your Remote 🎨

1. Open the app in your browser
2. Click **"✏️ Build"** tab
3. Choose a template OR start fresh
4. Drag widgets onto the canvas
5. Customize colors, labels, and sizes

### Step 2: Get the MakeCode 📄

1. Click **"📄 Code"** button
2. Copy the generated code
3. Go to [makecode.microbit.org](https://makecode.microbit.org)
4. Create new project → **JavaScript** mode
5. Paste the code
6. Click **Download** to flash your micro:bit

### Step 3: Connect & Play! 🎮

1. Click **"▶️ Play"** tab
2. Click the big **"📡 Tap to Connect!"** button
3. Select your micro:bit from the list
4. Start controlling! 🚀

---

## 🎯 How It Works

```
┌─────────────────┐         Bluetooth          ┌─────────────────┐
│                 │  ◄───────────────────────► │                 │
│   📱 Your App   │         BLE UART           │  🔲 micro:bit   │
│   (Phone/PC)    │                            │                 │
└─────────────────┘                            └─────────────────┘
        │                                              │
        │  You press a button                         │
        │  ─────────────────►  SET btn_fire 1         │
        │                                              │
        │                      micro:bit runs code    │
        │                      and can send back:     │
        │  UPD led_status 1   ◄─────────────────      │
        │                                              │
```

### The Magic: 🪄

1. **You design** a remote with widgets
2. **The app generates** MakeCode for your micro:bit
3. **The micro:bit stores** your layout and sends it back when connected
4. **Both devices talk** using simple text messages over Bluetooth!

---

## 🔧 The Builder Interface

### 🎛️ Top Bar

| Button | What it does |
|--------|--------------|
| ✏️ **Build** | Design your remote |
| ▶️ **Play** | Use your remote |
| 🎮 **Demo** | Try all 12 widgets |
| 📦 **Export** | Save design as JSON |
| 📂 **Import** | Load a saved design |
| 📄 **Code** | Get MakeCode for micro:bit |

### 🎨 Widget Palette

Click a widget type, then click on the canvas to place it!

### 🛠️ Properties Panel

Select a widget to edit:
- 📝 **Label** - The text shown on the widget
- 🎨 **Model** - Visual style (neo, glass, neon, etc.)
- 📏 **Size** - Width and height
- 🔢 **Min/Max** - For sliders and gauges
- 🎨 **Colors** - For LEDs and themes

---

## 🎮 All Widgets Explained

### 📥 Input Widgets (You Control)

These widgets send data **FROM the app TO micro:bit** when you interact with them.

---

#### 👆 Button

**What it does:** Send a signal when pressed/released

**Looks like:** A big tappable button

**Message format:**
```
SET button_id 1    ← When pressed
SET button_id 0    ← When released
```

**MakeCode example:**
```javascript
// When button is pressed
if (id == "btn_fire" && val == "1") {
    // 🔥 Fire the laser!
    basic.showIcon(IconNames.Skull)
    pins.digitalWritePin(DigitalPin.P0, 1)
}

// When button is released  
if (id == "btn_fire" && val == "0") {
    // Stop firing
    basic.clearScreen()
    pins.digitalWritePin(DigitalPin.P0, 0)
}
```

**Use it for:** 🔫 Shooting, 🎵 Sound effects, 💡 Lights on/off, 🚀 Actions

---

#### 🎚️ Slider

**What it does:** Send a value from min to max

**Looks like:** A vertical slider you drag up/down

**Message format:**
```
SET slider_id 75    ← Value between 0-100 (or your min/max)
```

**MakeCode example:**
```javascript
// Control motor speed with slider
if (id == "slider_speed") {
    let speed = parseInt(val)  // 0 to 100
    
    // Show on LED display
    led.plotBarGraph(speed, 100)
    
    // Control a motor on P0 (PWM)
    pins.analogWritePin(AnalogPin.P0, speed * 10)
    
    // Or control a servo
    pins.servoWritePin(AnalogPin.P1, Math.map(speed, 0, 100, 0, 180))
}
```

**Use it for:** 🏎️ Speed control, 🔊 Volume, 💡 Brightness, 🤖 Servo angle

---

#### 🔘 Toggle

**What it does:** Switch ON or OFF (like a light switch)

**Looks like:** A switch that stays on or off

**Message format:**
```
SET toggle_id 1    ← Switched ON
SET toggle_id 0    ← Switched OFF
```

**MakeCode example:**
```javascript
// Toggle turbo mode
if (id == "toggle_turbo") {
    if (val == "1") {
        // 🚀 Turbo ON!
        basic.showIcon(IconNames.Chessboard)
        turboMode = true
    } else {
        // Turbo OFF
        basic.showIcon(IconNames.Asleep)
        turboMode = false
    }
}
```

**Use it for:** ⚡ Turbo mode, 🛡️ Shield, 🔦 Flashlight, 🎵 Music on/off

---

#### 🕹️ Joystick

**What it does:** Send direction and distance (like a game controller stick)

**Looks like:** A circular pad with a movable stick

**Message format:**
```
SET joystick_id 45 80    ← angle=45°, distance=80%
SET joystick_id 0 0      ← centered (released)
```

**Angle directions:**
```
           270° (up)
              ↑
    180° ←    ●    → 0° (right)
    (left)    ↓
            90° (down)
```

**MakeCode example:**
```javascript
// Drive a robot with joystick
if (id == "joy_move") {
    let parts = val.split(" ")
    let angle = parseInt(parts[0])    // 0-360 degrees
    let distance = parseInt(parts[1]) // 0-100 (0=center)
    
    if (distance < 10) {
        // Joystick centered - STOP!
        basic.showIcon(IconNames.SmallDiamond)
        pins.analogWritePin(AnalogPin.P0, 0)  // Left motor
        pins.analogWritePin(AnalogPin.P1, 0)  // Right motor
    } else {
        // Moving!
        let speed = distance * 10  // 0-1000
        
        if (angle < 45 || angle >= 315) {
            // RIGHT
            basic.showArrow(ArrowNames.East)
        } else if (angle < 135) {
            // DOWN (backward)
            basic.showArrow(ArrowNames.South)
        } else if (angle < 225) {
            // LEFT
            basic.showArrow(ArrowNames.West)
        } else {
            // UP (forward)
            basic.showArrow(ArrowNames.North)
        }
    }
}
```

**Use it for:** 🤖 Robot steering, 🎮 Game movement, 🚁 Drone control, 🕹️ Pan/tilt

---

#### ✛ D-Pad

**What it does:** Send direction when pressing up/down/left/right buttons

**Looks like:** A cross with 4 arrow buttons (like Nintendo controller)

**Message format:**
```
SET dpad_id up 1       ← Up pressed
SET dpad_id up 0       ← Up released
SET dpad_id down 1     ← Down pressed
SET dpad_id left 1     ← Left pressed
SET dpad_id right 1    ← Right pressed
```

**MakeCode example:**
```javascript
// Control with D-Pad
if (id == "dpad_nav") {
    let parts = val.split(" ")
    let direction = parts[0]  // "up", "down", "left", "right"
    let pressed = parts[1] == "1"
    
    if (pressed) {
        basic.clearScreen()
        
        if (direction == "up") {
            basic.showArrow(ArrowNames.North)
            // Move forward
            pins.digitalWritePin(DigitalPin.P0, 1)
        } else if (direction == "down") {
            basic.showArrow(ArrowNames.South)
            // Move backward
            pins.digitalWritePin(DigitalPin.P1, 1)
        } else if (direction == "left") {
            basic.showArrow(ArrowNames.West)
            // Turn left
            pins.digitalWritePin(DigitalPin.P2, 1)
        } else if (direction == "right") {
            basic.showArrow(ArrowNames.East)
            // Turn right
            pins.digitalWritePin(DigitalPin.P8, 1)
        }
    } else {
        // Button released - stop
        basic.clearScreen()
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P1, 0)
        pins.digitalWritePin(DigitalPin.P2, 0)
        pins.digitalWritePin(DigitalPin.P8, 0)
    }
}
```

**Use it for:** 🎮 Menu navigation, 🤖 Robot movement, 🕹️ Retro games, 📺 TV remote

---

#### 📍 XY Pad

**What it does:** Send X and Y position (like a touchpad)

**Looks like:** A square pad where you tap/drag anywhere

**Message format:**
```
SET xypad_id 75 30    ← x=75%, y=30%
```

**Position:**
```
(0,0) ─────────────── (100,0)
  │                      │
  │         ●            │  ← You tapped here (75,30)
  │                      │
(0,100) ─────────────(100,100)
```

**MakeCode example:**
```javascript
// Aim with XY pad
if (id == "xypad_aim") {
    let parts = val.split(" ")
    let x = parseInt(parts[0])  // 0-100 (left to right)
    let y = parseInt(parts[1])  // 0-100 (top to bottom)
    
    // Show position on micro:bit LED (5x5)
    basic.clearScreen()
    let ledX = Math.floor(x / 25)  // 0-4
    let ledY = Math.floor(y / 25)  // 0-4
    led.plot(ledX, ledY)
    
    // Control 2 servos for pan/tilt camera
    pins.servoWritePin(AnalogPin.P0, Math.map(x, 0, 100, 0, 180))
    pins.servoWritePin(AnalogPin.P1, Math.map(y, 0, 100, 0, 180))
}
```

**Use it for:** 🎯 Aiming, 📸 Pan/tilt camera, 🎨 Drawing, 🎵 Music pad

---

#### ⏱️ Timer

**What it does:** Start/stop/reset a timer, sends elapsed seconds

**Looks like:** A digital clock display with control buttons

**Message format:**
```
SET timer_id 30    ← 30 seconds elapsed (sent every 5 seconds)
```

**MakeCode example:**
```javascript
// React to timer
if (id == "timer_game") {
    let seconds = parseInt(val)
    
    serial.writeLine("Timer: " + seconds + "s")
    
    // Beep every 10 seconds
    if (seconds % 10 == 0) {
        music.playTone(Note.C, music.beat(BeatFraction.Quarter))
    }
    
    // Game over at 60 seconds
    if (seconds >= 60) {
        basic.showIcon(IconNames.Sad)
        music.playMelody("C D E F G A B C5", 120)
    }
}
```

**Use it for:** ⏱️ Game timer, 🍳 Cooking timer, 🏃 Race countdown, ⏰ Reminders

---

### 📤 Output Widgets (micro:bit Controls)

These widgets receive data **FROM micro:bit TO the app**. Your micro:bit code sends updates to change them!

---

#### 💡 LED

**What it does:** Show ON/OFF status (like a light bulb)

**Looks like:** A glowing dot or ring

**How to update from micro:bit:**
```javascript
// Turn LED ON
sendValue("led_status", "1")

// Turn LED OFF  
sendValue("led_status", "0")
```

**Full example:**
```javascript
// Blink LED based on temperature
basic.forever(function() {
    if (input.temperature() > 25) {
        sendValue("led_hot", "1")   // Hot! LED ON
        sendValue("led_cold", "0")
    } else {
        sendValue("led_hot", "0")
        sendValue("led_cold", "1")  // Cold! LED ON
    }
    basic.pause(500)
})
```

**Use it for:** ⚠️ Warnings, ✅ Status indicators, 🔔 Notifications, 🎮 Game state

---

#### 🏷️ Label

**What it does:** Display text from micro:bit

**Looks like:** A text display area

**How to update from micro:bit:**
```javascript
// Show score
sendValue("label_score", "Score: 150")

// Show temperature
sendValue("label_temp", input.temperature() + "°C")

// Show any message!
sendValue("label_msg", "Hello!")
```

**Full example:**
```javascript
let score = 0

// Update score label every second
basic.forever(function() {
    score += Math.randomRange(1, 10)
    sendValue("label_score", "🏆 Score: " + score)
    basic.pause(1000)
})

// Show messages on button press
input.onButtonPressed(Button.A, function() {
    sendValue("label_msg", "🎉 Button A!")
})
```

**Use it for:** 🏆 Scores, 🌡️ Sensor readings, 💬 Messages, 📊 Stats

---

#### 🧭 Gauge

**What it does:** Display a value on a dial (like speedometer)

**Looks like:** A semicircle gauge with a needle

**How to update from micro:bit:**
```javascript
// Send value (0-100 by default, or your min/max)
sendValue("gauge_speed", "75")

// Send temperature (if gauge min=0, max=50)
sendValue("gauge_temp", "" + input.temperature())
```

**Full example:**
```javascript
// Real-time sensor dashboard
basic.forever(function() {
    // Temperature gauge (0-50°C)
    sendValue("gauge_temp", "" + input.temperature())
    
    // Light level gauge (0-255)
    sendValue("gauge_light", "" + Math.round(input.lightLevel() / 2.55))
    
    // Compass heading gauge (0-360)
    sendValue("gauge_compass", "" + Math.round(input.compassHeading() / 3.6))
    
    basic.pause(200)
})
```

**Use it for:** 🌡️ Temperature, 🔊 Sound level, 🧭 Compass, 🏎️ Speed

---

#### 📈 Graph

**What it does:** Display real-time data as a line chart

**Looks like:** A scrolling graph with one or more lines

**How to update from micro:bit:**
```javascript
// Single value
sendValue("graph_data", "42")

// Multiple series (comma-separated)
sendValue("graph_data", "42,78,15")
```

**Full example:**
```javascript
// Plot temperature and light over time
basic.forever(function() {
    let temp = input.temperature()
    let light = Math.round(input.lightLevel() / 2.55)
    
    // Send both values as "temp,light"
    sendValue("graph_sensors", temp + "," + light)
    
    basic.pause(500)
})
```

**Use it for:** 📊 Sensor data, 📈 Trends, 🎵 Sound waves, 💓 Heart rate

---

#### 🔋 Battery

**What it does:** Display battery/power level

**Looks like:** A battery icon that fills up

**How to update from micro:bit:**
```javascript
// Send percentage 0-100
sendValue("battery_power", "75")
```

**Full example:**
```javascript
// Monitor battery voltage (if connected to P0)
basic.forever(function() {
    let voltage = pins.analogReadPin(AnalogPin.P0)
    let percent = Math.round(voltage / 10.23)  // 0-1023 → 0-100
    
    sendValue("battery_level", "" + percent)
    
    // Warning if low
    if (percent < 20) {
        sendValue("led_warning", "1")
    } else {
        sendValue("led_warning", "0")
    }
    
    basic.pause(1000)
})
```

**Use it for:** 🔋 Battery level, ⛽ Fuel gauge, 💧 Water level, 📶 Signal strength

---

## 💻 MakeCode Examples

### 🤖 Complete Robot Example

```javascript
/**
 * 🤖 ROBOT CONTROLLER
 * Controls: Joystick for movement, Slider for speed, Toggle for turbo
 */

let turboMode = false
let maxSpeed = 50

// Handle all widgets
function handleWidget(id: string, val: string) {
    serial.writeLine(id + " = " + val)
    
    // 🕹️ Joystick - Movement
    if (id == "joy_drive") {
        let parts = val.split(" ")
        let angle = parseInt(parts[0])
        let power = parseInt(parts[1])
        
        let speed = turboMode ? maxSpeed * 2 : maxSpeed
        let motorPower = (power / 100) * speed
        
        if (power < 10) {
            // Stop
            setMotors(0, 0)
        } else if (angle >= 315 || angle < 45) {
            // Forward-Right
            setMotors(motorPower, motorPower * 0.5)
        } else if (angle < 135) {
            // Backward
            setMotors(-motorPower, -motorPower)
        } else if (angle < 225) {
            // Forward-Left
            setMotors(motorPower * 0.5, motorPower)
        } else {
            // Forward
            setMotors(motorPower, motorPower)
        }
    }
    
    // 🎚️ Slider - Max Speed
    if (id == "slider_speed") {
        maxSpeed = parseInt(val)
        sendValue("gauge_speed", val)
    }
    
    // 🔘 Toggle - Turbo Mode
    if (id == "toggle_turbo") {
        turboMode = val == "1"
        sendValue("led_turbo", val)
    }
}

// Motor control helper
function setMotors(left: number, right: number) {
    pins.analogWritePin(AnalogPin.P0, Math.abs(left) * 10)
    pins.analogWritePin(AnalogPin.P1, Math.abs(right) * 10)
    pins.digitalWritePin(DigitalPin.P2, left >= 0 ? 1 : 0)
    pins.digitalWritePin(DigitalPin.P8, right >= 0 ? 1 : 0)
}

// Send sensor data to app
basic.forever(function() {
    if (cfgSent) {
        sendValue("gauge_temp", "" + input.temperature())
        sendValue("label_status", turboMode ? "🚀 TURBO!" : "🐢 Normal")
    }
    basic.pause(500)
})
```

---

### 🎮 Game Controller Example

```javascript
/**
 * 🎮 GAME CONTROLLER
 * D-Pad for movement, Buttons for actions
 */

function handleWidget(id: string, val: string) {
    
    // ✛ D-Pad - Movement keys
    if (id == "dpad_move") {
        let parts = val.split(" ")
        let dir = parts[0]
        let pressed = parts[1] == "1"
        
        // Send keyboard commands (if using as HID)
        if (pressed) {
            if (dir == "up") keyboard.key(keyboard.Keys.W, keyboard.KeyEvent.Down)
            if (dir == "down") keyboard.key(keyboard.Keys.S, keyboard.KeyEvent.Down)
            if (dir == "left") keyboard.key(keyboard.Keys.A, keyboard.KeyEvent.Down)
            if (dir == "right") keyboard.key(keyboard.Keys.D, keyboard.KeyEvent.Down)
        } else {
            keyboard.key(keyboard.Keys.W, keyboard.KeyEvent.Up)
            keyboard.key(keyboard.Keys.S, keyboard.KeyEvent.Up)
            keyboard.key(keyboard.Keys.A, keyboard.KeyEvent.Up)
            keyboard.key(keyboard.Keys.D, keyboard.KeyEvent.Up)
        }
    }
    
    // 👆 Buttons - Actions
    if (id == "btn_jump" && val == "1") {
        keyboard.key(keyboard.Keys.Space, keyboard.KeyEvent.Click)
        sendValue("label_action", "🦘 JUMP!")
    }
    
    if (id == "btn_fire" && val == "1") {
        keyboard.key(keyboard.Keys.E, keyboard.KeyEvent.Click)
        sendValue("label_action", "🔥 FIRE!")
    }
}
```

---

### 🌡️ Sensor Dashboard Example

```javascript
/**
 * 🌡️ SENSOR DASHBOARD
 * Display all micro:bit sensors in the app
 */

basic.forever(function() {
    if (cfgSent) {
        // 🌡️ Temperature
        let temp = input.temperature()
        sendValue("gauge_temp", "" + temp)
        sendValue("label_temp", "🌡️ " + temp + "°C")
        
        // 💡 Light Level
        let light = Math.round(input.lightLevel() / 2.55)
        sendValue("gauge_light", "" + light)
        
        // 🧭 Compass
        let heading = input.compassHeading()
        sendValue("gauge_compass", "" + Math.round(heading / 3.6))
        
        // 📊 Graph - temp and light
        sendValue("graph_sensors", temp + "," + light)
        
        // 🔋 Battery (simulated with light)
        sendValue("battery_level", "" + light)
        
        // 💡 LED warnings
        sendValue("led_hot", temp > 30 ? "1" : "0")
        sendValue("led_dark", light < 20 ? "1" : "0")
    }
    basic.pause(500)
})
```

---

## 🔌 Bluetooth Protocol

### Message Format

All messages are simple text lines sent over Bluetooth UART:

| Direction | Format | Example |
|-----------|--------|---------|
| App → micro:bit | `SET widget_id value` | `SET slider_speed 75` |
| micro:bit → App | `UPD widget_id value` | `UPD gauge_temp 23` |
| App → micro:bit | `GETCFG` | Request layout config |
| micro:bit → App | `CFGBEGIN` | Start of config |
| micro:bit → App | `CFG xxxxx` | Config data chunks |
| micro:bit → App | `CFGEND` | End of config |

### Configuration Transfer

When the app connects, it asks for the layout:

```
App:      GETCFG
micro:bit: CFGBEGIN
micro:bit: CFG eyJ0aXRsZSI6...  (Base64 chunks, 18 bytes each)
micro:bit: CFG IlN1cGVyIERl...
micro:bit: CFG bW8gUmVtb3Rl...
micro:bit: CFGEND
```

The config is your remote layout encoded as Base64 JSON!

---

## ❓ Troubleshooting

### 🔴 Can't connect to micro:bit?

1. **Check Bluetooth is ON** on your phone/computer
2. **Make sure micro:bit shows ❤️** (heart icon = ready)
3. **Try refreshing** the page and connecting again
4. **Pair first** in your device's Bluetooth settings if needed
5. **Only one device** can connect at a time!

### 🔴 Buttons not working?

1. **Check the code** is flashed to micro:bit
2. **Look at serial monitor** in MakeCode to debug
3. **Make sure widget IDs match** in code and app

### 🔴 micro:bit disconnects?

1. **Stay close** - Bluetooth range is ~10 meters
2. **Check battery** - low power causes disconnects
3. **Reduce updates** - too many messages can overload BLE

### 🔴 No arrow on micro:bit for D-Pad?

1. **Regenerate the code** after making changes
2. **Flash the new code** to micro:bit
3. **Check serial output** for debug messages

---

## 🌐 Links & Resources

| Resource | Link |
|----------|------|
| 🌐 **Workshop-DIY.org** | [https://workshop-diy.org](https://workshop-diy.org) |
| 💻 **MakeCode** | [https://makecode.microbit.org](https://makecode.microbit.org) |
| 📚 **micro:bit Docs** | [https://microbit.org/get-started](https://microbit.org/get-started) |
| 🔵 **Web Bluetooth API** | [https://webbluetoothcg.github.io/web-bluetooth](https://webbluetoothcg.github.io/web-bluetooth) |

---

## 📜 License

MIT License - Feel free to use, modify, and share!

---

<div align="center">

### 🎮 Happy Building! 🚀

**Made with ❤️ by Workshop-DIY.org**

![Workshop-DIY Logo](logo.svg)

*Empowering kids to build amazing things!*

</div>
