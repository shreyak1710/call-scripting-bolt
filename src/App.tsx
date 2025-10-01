import { useState, useEffect } from 'react';
import { Mic, MicOff, Trash2, Wifi, WifiOff } from 'lucide-react';
import { AudioRecorder } from './components/AudioRecorder';
import { TranscriptCard } from './components/TranscriptCard';
import { useWebSocket } from './hooks/useWebSocket';

interface Transcript {
  turn: number;
  transcript: string;
  suggestion: string;
  timestamp: string;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const WS_URL = 'ws://localhost:8000/ws';

  const { isConnected, lastMessage, sendAudioData, clearHistory } = useWebSocket(WS_URL);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'transcription') {
      const newTranscript: Transcript = {
        turn: lastMessage.turn || 0,
        transcript: lastMessage.transcript || '',
        suggestion: lastMessage.suggestion || '',
        timestamp: new Date().toLocaleTimeString(),
      };
      setTranscripts((prev) => [...prev, newTranscript]);
    }
  }, [lastMessage]);

  const handleAudioData = (audioBlob: Blob) => {
    sendAudioData(audioBlob);
  };

  const handleClearHistory = () => {
    setTranscripts([]);
    clearHistory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Real-Time Translation Assistant
          </h1>
          <p className="text-gray-600">
            Speak in any language, get instant English translations and AI suggestions
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Disconnected</span>
                </>
              )}
            </div>

            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={transcripts.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => setIsRecording(!isRecording)}
              disabled={!isConnected}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              } ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>

            {isRecording && (
              <div className="w-full max-w-md">
                <AudioRecorder onAudioData={handleAudioData} isRecording={isRecording} />
              </div>
            )}

            <p className="text-sm text-gray-600">
              {isRecording ? (
                <span className="font-semibold text-red-600">Recording... Speak now</span>
              ) : (
                'Click the microphone to start recording'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {transcripts.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transcripts yet. Start recording to begin.</p>
            </div>
          ) : (
            transcripts.map((transcript, index) => (
              <TranscriptCard
                key={index}
                turn={transcript.turn}
                transcript={transcript.transcript}
                suggestion={transcript.suggestion}
                timestamp={transcript.timestamp}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
