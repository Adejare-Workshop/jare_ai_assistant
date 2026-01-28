import { useCallback } from 'react';

export const useSound = () => {
  
  const playTone = useCallback((freq, type, duration) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }, []);

  const playHover = () => playTone(800, 'sine', 0.05); // High tiny blip
  const playClick = () => playTone(600, 'square', 0.1); // Mechanical click
  const playSuccess = () => {
    // A major chord arpeggio
    setTimeout(() => playTone(440, 'sine', 0.2), 0);
    setTimeout(() => playTone(554, 'sine', 0.2), 100);
    setTimeout(() => playTone(659, 'sine', 0.4), 200);
  };
  const playError = () => playTone(150, 'sawtooth', 0.3); // Low buzz

  return { playHover, playClick, playSuccess, playError };
};
