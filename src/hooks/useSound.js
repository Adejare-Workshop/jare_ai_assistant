import { useCallback, useRef } from 'react';

export const useSound = () => {
  const audioCtxRef = useRef(null);

  const getContext = () => {
    // Create context only once
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (Fixes the Console Error)
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = useCallback((freq, type, duration) => {
    try {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn("Sound blocked by browser policy");
    }
  }, []);

  const playHover = () => playTone(800, 'sine', 0.05); 
  const playClick = () => playTone(600, 'square', 0.1); 
  const playSuccess = () => {
    setTimeout(() => playTone(440, 'sine', 0.2), 0);
    setTimeout(() => playTone(554, 'sine', 0.2), 100);
    setTimeout(() => playTone(659, 'sine', 0.4), 200);
  };
  const playError = () => playTone(150, 'sawtooth', 0.3);

  return { playHover, playClick, playSuccess, playError };
};
