import { useRef, useCallback } from 'react';

type SoundType = 'exerciseComplete' | 'switchSides' | 'restOver';

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [getContext]);

  const play = useCallback((sound: SoundType) => {
    switch (sound) {
      case 'exerciseComplete':
        playTone(880, 0.15, 'square');
        setTimeout(() => playTone(880, 0.15, 'square'), 200);
        break;
      case 'switchSides':
        playTone(660, 0.3, 'sine');
        break;
      case 'restOver':
        playTone(523, 0.15, 'sine');
        setTimeout(() => playTone(659, 0.15, 'sine'), 150);
        setTimeout(() => playTone(784, 0.25, 'sine'), 300);
        break;
    }
  }, [playTone]);

  const unlock = useCallback(() => { getContext(); }, [getContext]);

  return { play, unlock };
}
