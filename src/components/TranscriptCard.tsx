interface TranscriptCardProps {
  turn: number;
  transcript: string;
  suggestion: string;
  timestamp: string;
}

export function TranscriptCard({ turn, transcript, suggestion, timestamp }: TranscriptCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-500">Turn {turn}</span>
        <span className="text-xs text-gray-400">{timestamp}</span>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Transcript (English)
        </h3>
        <p className="text-gray-800 leading-relaxed">{transcript}</p>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          AI Suggestion
        </h3>
        <p className="text-gray-700 leading-relaxed">{suggestion}</p>
      </div>
    </div>
  );
}
