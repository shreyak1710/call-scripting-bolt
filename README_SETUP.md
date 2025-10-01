# Real-Time Translation Assistant - Setup Guide

This application provides real-time translation from any language to English with AI-powered conversation suggestions.

## Architecture

- **Frontend**: React + TypeScript with Vite, TailwindCSS
- **Backend**: FastAPI with WebSocket support
- **AI Services**: OpenAI Whisper (translation) + GPT-4o-mini (suggestions)

## Prerequisites

1. Python 3.8+
2. Node.js 18+
3. OpenAI API Key

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
echo "OPENAI_API_KEY=your_api_key_here" > ../.env
```

### 2. Frontend Setup

```bash
# From project root
npm install
```

### 3. Running the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python server.py
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Use

1. Open the application in your browser
2. Ensure the status shows "Connected" (green)
3. Click the microphone button to start recording
4. Speak in any language
5. View real-time English translations and AI suggestions

## Features

- Real-time audio capture with visual feedback
- Automatic language detection and translation to English
- Context-aware AI suggestions for conversation flow
- Clean, modern interface with animation effects
- Conversation history with timestamps
- WebSocket-based low-latency communication

## Troubleshooting

**"Disconnected" status:**
- Ensure the backend server is running on port 8000
- Check that WebSocket connection isn't blocked by firewall

**No audio input:**
- Grant microphone permissions in your browser
- Check system audio settings

**API errors:**
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI API usage limits
