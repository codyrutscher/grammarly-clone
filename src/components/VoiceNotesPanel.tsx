import React, { useState, useRef, useEffect } from 'react';
import type { VoiceNote } from '../types';

interface VoiceNotesPanelProps {
  onInsertTranscript: (text: string) => void;
  onClose: () => void;
}

export const VoiceNotesPanel: React.FC<VoiceNotesPanelProps> = ({
  onInsertTranscript,
  onClose
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [currentRecording, setCurrentRecording] = useState<{
    mediaRecorder: MediaRecorder | null;
    startTime: number;
  } | null>(null);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Speech Recognition setup
  const recognition = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      
      recognition.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
        }
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const duration = Date.now() - (currentRecording?.startTime || 0);
        
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          title: `Voice Note ${voiceNotes.length + 1}`,
          audioBlob,
          duration: duration / 1000,
          createdAt: new Date(),
        };

        setVoiceNotes(prev => [newNote, ...prev]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setCurrentRecording({ mediaRecorder, startTime: Date.now() });
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (currentRecording?.mediaRecorder) {
      currentRecording.mediaRecorder.stop();
      setCurrentRecording(null);
      setIsRecording(false);
    }
  };

  const playNote = (note: VoiceNote) => {
    if (audioRef.current) {
      const audioUrl = URL.createObjectURL(note.audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingNoteId(note.id);

      audioRef.current.onended = () => {
        setPlayingNoteId(null);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const deleteNote = (noteId: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setTranscript('');
      recognition.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const insertTranscript = () => {
    if (transcript.trim()) {
      onInsertTranscript(transcript);
      setTranscript('');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">🎤 Voice Notes</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Speech to Text Section */}
          {hasSpeechRecognition && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🗣️ Speech to Text</h3>
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
                  </button>
                  {transcript && (
                    <button
                      onClick={insertTranscript}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📝 Insert Text
                    </button>
                  )}
                </div>
                {transcript && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-gray-700">{transcript}</p>
                  </div>
                )}
                {isListening && (
                  <p className="text-blue-600 text-sm">🔴 Listening... Speak now!</p>
                )}
              </div>
            </div>
          )}

          {/* Voice Recording Section */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎵 Voice Recordings</h3>
            <div className="flex justify-center mb-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </button>
            </div>
            {isRecording && (
              <p className="text-center text-red-600 text-sm">🔴 Recording in progress...</p>
            )}
          </div>

          {/* Voice Notes List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Saved Voice Notes</h3>
            {voiceNotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No voice notes yet. Record your first one!</p>
            ) : (
              <div className="space-y-3">
                {voiceNotes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{note.title}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDuration(note.duration)} • {note.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => playNote(note)}
                          disabled={playingNoteId === note.id}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {playingNoteId === note.id ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}; 