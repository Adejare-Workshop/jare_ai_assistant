import { useState, useEffect, useCallback } from 'react';

export const useVoiceInput = (onSpeechEnd) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onstart = () => setIsListening(true);
      
      recog.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        if (onSpeechEnd) onSpeechEnd(text);
      };

      recog.onerror = (event) => {
        console.error("Speech Error:", event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []); // Run once on mount

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.warn("Microphone already active");
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  return { isListening, transcript, startListening, stopListening };
};
