import { useState, useEffect, useCallback } from 'react';

export const useVoiceInput = (onSpeechEnd) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const reco = new SpeechRecognition();
      reco.continuous = false; // Stop after one sentence (Jarvis style)
      reco.interimResults = true; // Show text while speaking
      reco.lang = 'en-US';

      reco.onstart = () => setIsListening(true);
      
      reco.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      reco.onend = () => {
        setIsListening(false);
        if (onSpeechEnd) onSpeechEnd(); // Trigger processing when silence is detected
      };

      setRecognition(reco);
    }
  }, [onSpeechEnd]);

  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript("");
      recognition.start();
    } else {
      alert("Voice interaction not supported in this browser. Try Chrome.");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) recognition.stop();
  }, [recognition]);

  return { isListening, transcript, startListening, stopListening };
};
