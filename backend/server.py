from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import openai
import asyncio
import json
import base64
import io
from dotenv import load_dotenv
from typing import List
import wave

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    client = openai.OpenAI()
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    print("Please ensure OPENAI_API_KEY is set in your environment.")

conversation_history: List[dict] = []

def transcribe_and_translate(audio_data: bytes):
    """Sends audio data to OpenAI for translation (any language -> English)."""
    try:
        audio_file = io.BytesIO(audio_data)
        audio_file.name = "audio.wav"

        translation_response = client.audio.translations.create(
            model="whisper-1",
            file=audio_file
        )
        return translation_response.text
    except Exception as e:
        return ""

def generate_suggestion(translated_text: str, history: List[dict]):
    """Uses the Chat API to generate a contextual suggestion for the listener."""

    system_prompt = {
        "role": "system",
        "content": (
            "You are a helpful real-time communication assistant. Analyze the user's last statement. "
            "Provide a concise, professional suggestion on how the listener should respond, or what topic "
            "to address next. The suggestion MUST be in English and should only be 1-2 short sentences. "
            "DO NOT reply to the user, only provide the suggestion."
        )
    }

    messages = history[-5:] + [
        {"role": "user", "content": translated_text}
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[system_prompt] + messages,
            max_tokens=60,
            temperature=0.0
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"GPT Suggestion Error: {e}")
        return "Suggestion service temporarily unavailable."

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "audio":
                audio_base64 = message["data"]
                audio_bytes = base64.b64decode(audio_base64)

                translated_text = transcribe_and_translate(audio_bytes)

                if translated_text and len(translated_text.strip().split()) > 1:
                    translated_text = translated_text.strip()
                    conversation_history.append({"role": "user", "content": translated_text})

                    suggestion = generate_suggestion(translated_text, conversation_history)

                    await websocket.send_json({
                        "type": "transcription",
                        "transcript": translated_text,
                        "suggestion": suggestion,
                        "turn": len(conversation_history)
                    })

            elif message["type"] == "clear_history":
                conversation_history.clear()
                await websocket.send_json({
                    "type": "history_cleared"
                })

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.get("/")
async def root():
    return {"message": "Real-time Translation & Suggestion API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
