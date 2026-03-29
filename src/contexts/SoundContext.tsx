import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface SoundContextType {
  muted: boolean;
  toggleMute: () => void;
  playSound: (type: "add" | "remove" | "spin" | "win" | "order") => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const MUTE_KEY = "sb-sound-muted";

// Web Audio API sound generator
function createBeep(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playAddSound() {
  createBeep(880, 0.15, "sine", 0.25);
  setTimeout(() => createBeep(1100, 0.12, "sine", 0.2), 100);
}

function playRemoveSound() {
  createBeep(500, 0.15, "sine", 0.2);
  setTimeout(() => createBeep(350, 0.2, "sine", 0.15), 100);
}

function playSpinSound() {
  // Tick-tick-tick effect
  let i = 0;
  const interval = setInterval(() => {
    createBeep(600 + Math.random() * 400, 0.05, "square", 0.1);
    i++;
    if (i > 30) clearInterval(interval);
  }, 120);
  return () => clearInterval(interval);
}

function playWinSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => createBeep(freq, 0.25, "sine", 0.2), i * 150);
  });
}

function playOrderSound() {
  createBeep(660, 0.15, "sine", 0.2);
  setTimeout(() => createBeep(880, 0.15, "sine", 0.2), 120);
  setTimeout(() => createBeep(1100, 0.2, "sine", 0.25), 240);
}

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
  }, [muted]);

  const toggleMute = useCallback(() => setMuted(p => !p), []);

  const playSound = useCallback((type: "add" | "remove" | "spin" | "win" | "order") => {
    if (muted) return;
    switch (type) {
      case "add": playAddSound(); break;
      case "remove": playRemoveSound(); break;
      case "spin": playSpinSound(); break;
      case "win": playWinSound(); break;
      case "order": playOrderSound(); break;
    }
  }, [muted]);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
};
