# Zailix — Voice-Driven AI Assistant Interface

A self-hosted, real-time voice command interface with sci-fi HUD styling, microphone reactivity, and live conversation tracking. Built with React, Vite, and Tailwind CSS — no backend dependencies, zero external UI libraries.

**Built by:** Haythix AI

---

## 🌟 Features

### Core Functionality
- **Real-time Voice Recognition** — Instant interim transcription and smart silence detection (~750ms vs Chrome's default 4s)
- **Live Microphone Amplitude Reactivity** — Visual feedback via WebAudio API analyser
- **Multi-language Text-to-Speech** — Automatic language detection (Urdu script, Roman Urdu, English)
- **Webhook-driven Responses** — Seamless integration with n8n or any HTTP endpoint
- **Conversation History** — Last 10 turns persisted in `localStorage` with recent history toggle

### UI/UX Components
- **Central Interactive Orb** — Tap to start/stop voice recognition with real-time amplitude visualization
- **Left Telemetry Gauge** — System status and signal strength indicator
- **Right HUD Panels** — Response display and conversation readout
- **Bottom System Console** — Real-time logs with timestamped events (up to 40 entries)
- **Settings Panel** — Webhook URL configuration and conversation history viewer
- **Circuit Background** — Animated sci-fi aesthetic

### Advanced Features
- **Connection Status Monitor** — Real-time ping/latency detection to webhook endpoint
- **Error Message Display** — User-friendly feedback for failed commands
- **Tap-to-Send** — Instant manual submission without waiting for silence detection
- **System Logging** — Diagnostic-friendly timestamped event tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **UI Framework** | React 18.3 + JSX |
| **Build Tool** | Vite 6.4 |
| **Styling** | Tailwind CSS 3.4 + PostCSS 8.4 |
| **APIs** | Web Speech API, Web Audio API, Speech Synthesis API |
| **State Management** | React hooks (useState, useCallback, useEffect) |
| **Storage** | localStorage (JSON persistence) |

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in your browser.

**Recommended browser:** Chrome or Edge (best Web Speech API support)

### Initial Setup

1. Click the **⚙️ gear icon** in the top-right corner
2. Paste your n8n webhook URL
3. Click **Save**
4. Grant microphone permission when prompted (first tap on the orb)

### Production Build

```bash
npm run build
npm run preview
```

---

## 🔌 Webhook Integration (n8n / HTTP)

Zailix communicates with your automation backend via HTTP POST requests.

### Request Format

On each recognized voice command:

```json
POST <your-webhook-url>
Content-Type: application/json

{
  "command_text": "the recognized speech from user"
}
```

### Response Format

Expected JSON response body containing **one** of these fields:

```json
{
  "output": "This will be displayed and spoken"
}
```

or

```json
{
  "reply": "Alternative field name for response text"
}
```

or

```json
{
  "text": "Another valid response field"
}
```

**Response Processing:**
- The first matching field (`output`, `reply`, or `text`) is extracted
- Text is displayed in the **Right HUD Panel** and simultaneously spoken aloud
- Urdu-script responses are automatically detected and spoken with an Urdu voice if available

### Example n8n Workflow

In n8n, create a webhook trigger node that:
1. Receives the POST request from Zailix
2. Processes the `command_text`
3. Returns a JSON response with one of the valid fields

---

## 🧠 Architecture & Components

### Core Hooks

#### `useSpeechRecognition(options)`
- **Purpose:** Wraps the Web Speech API for real-time voice input
- **Features:**
  - Instant interim results (live streaming text)
  - Configurable silence timeout (default: 800ms)
  - Real-time audio amplitude monitoring via WebAudio API
  - Callbacks: `onResult`, `onInterimResult`, `onError`
- **Returns:** `{ isListening, amplitude, start(), stop() }`

#### `useSpeak()`
- **Purpose:** Wraps the Speech Synthesis API for text-to-speech output
- **Features:**
  - Automatic Urdu script detection (Unicode U+0600–U+06FF)
  - Language-aware voice selection
  - Queue management for multiple speak requests
  - Cancellation support
- **Returns:** `{ speak(text), cancelSpeaking(), isSpeaking }`

#### `useLocalStorage(key, initialValue)`
- **Purpose:** React hook for persistent state across browser sessions
- **Features:**
  - JSON serialization/deserialization
  - Fallback to initial value if key missing
- **Persisted Keys:**
  - `zailix.webhookUrl` — Saved webhook endpoint
  - `zailix.history` — Last 10 conversation turns

### UI Components

| Component | Purpose |
|-----------|---------|
| **CircuitBackground** | Animated sci-fi grid background |
| **Orb** | Central interactive control; tap to listen; visualizes amplitude in real-time |
| **LeftTelemetryGauge** | Displays system state (idle, listening, processing, speaking) |
| **RightHudPanels** | Shows current response, connection status, and latency |
| **BottomHudConsole** | System event log with 40-entry buffer; auto-scrolls |
| **StatusReadout** | Last response text and error messages |
| **SettingsPanel** | Webhook URL input, recent history viewer |

### State Flow

```
App (main state hub)
├── webhookUrl → SettingsPanel (input) + sent with each request
├── history → StatusReadout (last turn) + BottomHudConsole (log)
├── connectionStatus → RightHudPanels (online/offline indicator)
├── assistantState → LeftTelemetryGauge + ambient visual glow
├── liveTranscript → StatusReadout (interim text while listening)
└── systemLogs → BottomHudConsole (timestamped events)
```

---

## 🎤 Browser Requirements

- **Required:** Web Speech API support (`window.SpeechRecognition` or `window.webkitSpeechRecognition`)
- **Recommended Browsers:**
  - ✅ Chrome 25+
  - ✅ Edge 79+
  - ⚠️ Firefox 63+ (Speech Synthesis only, no recognition)
  - ❌ Safari (partial support; Web Speech API unreliable)

**Microphone Permission:**
- Requested automatically on first orb tap
- Must be granted for voice input to function

---

## 🔊 Multi-Language & Text-to-Speech

### Language Detection

- **Urdu Script** (Unicode U+0600–U+06FF) → Spoken with Urdu voice
- **Roman Urdu** (Latin script) → Treated as English (no ML needed)
- **English** → `en-US` voice

### Voice Selection

The system attempts to find a voice matching the detected language:
- If an Urdu voice is installed on the system → used for Urdu text
- Otherwise → falls back to default system voice
- Roman Urdu and English always use `en-US` voice

---

## 💾 Data Persistence

All persistent data is stored in browser `localStorage`:

| Key | Content | Max Entries | Viewer |
|-----|---------|-------------|--------|
| `zailix.webhookUrl` | Your webhook endpoint URL | 1 | Settings panel |
| `zailix.history` | User→AI conversation turns | 10 | Settings panel → "Recent history" toggle |

**Clear Data:**
- Open browser DevTools → Application → Storage → Local Storage
- Find entries starting with `zailix.` and delete as needed

---

## ⚙️ Configuration & Customization

### Environment

Edit `vite.config.js` to adjust server settings:

```javascript
server: {
  host: true,        // Allow network access
  port: 5173,        // Change default port
}
```

### Styling

Tailwind CSS configuration in `tailwind.config.js`:
- Customize colors, fonts, and spacing
- Adjust sci-fi aesthetic via CSS classes in components

### Silence Timeout

Default silence detection: **800ms** (can be tuned in `useSpeechRecognition.js`)

### History Buffer

- **UI console:** 40 latest logs shown in BottomHudConsole
- **Conversation history:** 10 latest turns persisted in localStorage

---

## 🐛 Troubleshooting

### Microphone Not Working
- ✅ Confirm Chrome/Edge is used
- ✅ Check browser microphone permissions (address bar 🔒)
- ✅ Ensure microphone is not in use by another app
- ✅ Try restarting the browser

### Webhook Not Responding
- ✅ Verify webhook URL is correct in settings
- ✅ Check n8n workflow is active and listening
- ✅ Test webhook manually: `curl -X POST <url> -H "Content-Type: application/json" -d '{"command_text": "test"}'`
- ✅ Check browser Console (F12) for network errors

### Speech Synthesis (TTS) Not Working
- ✅ Confirm system has voices available: `window.speechSynthesis.getVoices()` in console
- ✅ For Urdu: Install Urdu language pack on system
- ✅ Fallback to default system voice always available

### Silenc Timeout Too Short/Long
- Edit `silenceTimeoutMs` in `useSpeechRecognition()` hook (default 800ms)
- Increase for slower speakers, decrease for fast-paced commands

---

## 📁 Project Structure

```
zailix/
├── src/
│   ├── App.jsx                          # Main app logic & state
│   ├── main.jsx                         # React entry point
│   ├── index.css                        # Global styles
│   ├── components/
│   │   ├── CircuitBackground.jsx        # Animated background
│   │   ├── Orb.jsx                      # Central voice control orb
│   │   ├── LeftTelemetryGauge.jsx       # Status indicator
│   │   ├── RightHudPanels.jsx           # Response & connection display
│   │   ├── BottomHudConsole.jsx         # System log viewer
│   │   ├── SettingsPanel.jsx            # Webhook & history UI
│   │   └── StatusReadout.jsx            # Current response display
│   └── hooks/
│       ├── useSpeechRecognition.js      # Web Speech API wrapper
│       ├── useSpeak.js                  # Speech Synthesis wrapper
│       └── useLocalStorage.js           # localStorage persistence
├── public/                              # Static assets
├── index.html                           # HTML entry point
├── vite.config.js                       # Vite build config
├── tailwind.config.js                   # Tailwind CSS config
├── postcss.config.js                    # PostCSS config
├── package.json                         # Dependencies & scripts
└── README.md                            # This file
```

---

## 🤝 Integration Examples

### n8n Webhook Node Setup

1. **Trigger:** Webhook (POST method)
2. **Nodes:**
   - Parse `command_text` from request body
   - Route to AI/automation logic
   - Return response in `reply` field

Example response:

```json
{
  "reply": "Your command has been executed"
}
```

### Custom HTTP Backend

Zailix works with **any HTTP endpoint** that accepts JSON POST and returns a JSON response:

```python
# Python example
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/command', methods=['POST'])
def handle_command():
    data = request.json
    command = data.get('command_text', '')
    
    # Process command...
    response_text = f"You said: {command}"
    
    return jsonify({'output': response_text})
```

---

## 📝 Development Notes

- **No external UI libraries:** All styling via Tailwind CSS
- **No backend:** Pure frontend application; communicates via webhooks
- **React 18:** Uses modern hooks (no class components)
- **Vite:** Fast HMR (hot module replacement) during development
- **Web APIs only:** Web Speech, Web Audio, Speech Synthesis, localStorage

---

## 📄 License

Built by Haythix AI

---

## 🎯 Future Enhancement Ideas

- [ ] Voice command history with searchable transcripts
- [ ] Multiple language/locale selection dropdown
- [ ] Adjustable UI themes (dark/light)
- [ ] Export conversation history as JSON/PDF
- [ ] Voice profile training for improved recognition
- [ ] Offline fallback mode with service worker

---

**Ready to get started? Clone the repo, run `npm install && npm run dev`, and tap the orb!**
