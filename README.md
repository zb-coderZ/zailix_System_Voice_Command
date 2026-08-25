# Zailix

A self-hosted, voice-driven AI assistant interface, built by Haythix AI. Sci-fi HUD panel styling, real microphone-amplitude reactivity, and a live conversation readout — no backend, no external UI libraries.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in Chrome (recommended — best Web Speech API support). Click the settings gear, paste your n8n webhook URL, and save.

## Build for production

```bash
npm run build
npm run preview
```

## How it talks to n8n

On each recognized voice command, Zailix sends:

```json
POST <your webhook URL>
{ "command_text": "the recognized speech" }
```

It expects back a JSON body containing one of `output`, `reply`, or `text` — that value is shown in the readout panel and spoken aloud.

## Notes

- Requires a browser with Web Speech API support (`SpeechRecognition` / `webkitSpeechRecognition`) — Chrome and Edge are the most reliable.
- Microphone permission is requested the first time you tap the orb.
- Urdu-script replies (Unicode range U+0600–U+06FF) are spoken with an installed Urdu voice if your system has one, otherwise they fall back to the default system voice. Roman Urdu and English both use an `en-US` voice.
- Webhook URL and your last 5 conversation turns persist in `localStorage`, viewable from the settings panel's "Recent history" toggle.
