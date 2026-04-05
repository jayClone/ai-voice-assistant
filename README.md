# Voice AI Assistant MVP

Production-ready Node.js backend MVP for an audio-upload based Voice AI Assistant.

## Features

- Upload voice input via `/api/voice`
- Speech-to-text using OpenAI Whisper
- Multi-turn conversation handling with in-memory context
- Structured requirement extraction:
  - `name` (optional)
  - `budget`
  - `location`
  - `requirement`
- Booking readiness detection
- Mock appointment booking
- Text-to-speech reply using ElevenLabs
- Returns both text and audio (base64 encoded mp3)

## Tech Stack

- Node.js
- Express
- OpenAI API (Whisper STT)
- Gemini API (LLM conversation)
- ElevenLabs API
- Multer for audio uploads

## Project Structure

```text
voice-ai-assistant/
├── src/
│   ├── routes/
│   │   └── voice.route.js
│   ├── controllers/
│   │   └── voice.controller.js
│   ├── services/
│   │   ├── stt.service.js
│   │   ├── llm.service.js
│   │   ├── tts.service.js
│   │   ├── memory.service.js
│   │   ├── booking.service.js
│   │   └── conversation.service.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── config/
│   │   └── env.js
│   └── app.js
├── uploads/
├── .env
├── .env.example
├── package.json
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key
WHISPER_MODEL=whisper-1
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
MAX_CONTEXT_MESSAGES=10
```

3. Start server:

```bash
npm run dev
```

## API

### POST `/api/voice`

`multipart/form-data`

- `audio`: audio file (required)
- `conversationId`: string (optional, default: `default`)

Example curl:

```bash
curl -X POST http://localhost:3000/api/voice \
  -F "conversationId=user-123" \
  -F "audio=@sample.webm"
```

## Response Format

```json
{
  "conversationId": "user-123",
  "transcript": "I am looking for a 2BHK in Pune under 80 lakh",
  "reply": "Perfect, I have everything I need...",
  "intent": "completed",
  "data": {
    "name": null,
    "budget": "80 lakh",
    "location": "Pune",
    "requirement": "2BHK"
  },
  "booking_ready": true,
  "booking": {
    "bookingId": "BK-12345678",
    "conversationId": "user-123",
    "status": "confirmed",
    "scheduledWindow": "Next available slot",
    "summary": "Appointment confirmed for 2BHK in Pune with budget 80 lakh.",
    "createdAt": "2026-04-05T00:00:00.000Z"
  },
  "audio": {
    "mimeType": "audio/mpeg",
    "base64": "..."
  }
}
```

## Notes

- This MVP stores memory in process memory (`Map`) and resets when the server restarts.
- For production, replace memory service with Redis or a database.
- LLM output is forced into JSON and merged with saved context to avoid redundant questions.
