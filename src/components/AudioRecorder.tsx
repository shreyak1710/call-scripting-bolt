import { useEffect, useRef, useState } from 'react';

interface AudioRecorderProps {
  onAudioData: (audioData: Blob) => void;
  isRecording: boolean;
}

export function AudioRecorder({ onAudioData, isRecording }: AudioRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      visualize();

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();

      recordingIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();

          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            onAudioData(audioBlob);
          }

          chunksRef.current = [];
          mediaRecorderRef.current.start();
        }
      }, 3000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setAudioLevel(0);
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const animate = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 255) * 200));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center gap-1">
        {[...Array(20)].map((_, i) => {
          const barHeight = Math.max(4, (audioLevel / 100) * 40 * (1 - Math.abs(i - 10) / 10));
          return (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full transition-all duration-75"
              style={{ height: `${barHeight}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}
