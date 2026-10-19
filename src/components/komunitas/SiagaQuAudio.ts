/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SiagaQuAudio - Emergency Siren & Alarm Synthesizer (Web Audio API)
 * Menghasilkan suara sirene darurat / panic button autentik (700Hz - 1400Hz frequency modulation)
 * 100% offline-first, tanpa dependensi file MP3 eksternal.
 */

let sirenCtx: AudioContext | null = null;
let sirenOsc: OscillatorNode | null = null;
let sirenLfo: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let isSirenCurrentlyPlaying = false;

export function playEmergencySiren(): boolean {
  try {
    if (isSirenCurrentlyPlaying) return true;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return false;

    sirenCtx = new AudioContextClass();
    
    // Resume context jika ter-suspended oleh policy browser
    if (sirenCtx.state === 'suspended') {
      sirenCtx.resume();
    }

    // 1. Oscillator Utama (Nada Sirene)
    sirenOsc = sirenCtx.createOscillator();
    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(850, sirenCtx.currentTime); // Frekuensi dasar

    // 2. LFO (Low-Frequency Oscillator) untuk modulasi frekuensi naik-turun khas sirene
    sirenLfo = sirenCtx.createOscillator();
    sirenLfo.type = 'sine';
    sirenLfo.frequency.setValueAtTime(1.2, sirenCtx.currentTime); // 1.2 Hz cycle naik turun

    const lfoGain = sirenCtx.createGain();
    lfoGain.gain.setValueAtTime(350, sirenCtx.currentTime); // Ayunan rentang frekuensi (+- 350Hz)

    sirenLfo.connect(lfoGain);
    lfoGain.connect(sirenOsc.frequency);

    // 3. Master Volume Gain
    sirenGain = sirenCtx.createGain();
    sirenGain.gain.setValueAtTime(0.45, sirenCtx.currentTime);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(sirenCtx.destination);

    sirenOsc.start();
    sirenLfo.start();
    isSirenCurrentlyPlaying = true;
    return true;
  } catch (err) {
    console.warn('[SiagaQuAudio] Gagal memutar sirene:', err);
    return false;
  }
}

export function stopEmergencySiren(): void {
  try {
    if (sirenGain && sirenCtx) {
      sirenGain.gain.exponentialRampToValueAtTime(0.0001, sirenCtx.currentTime + 0.3);
    }
    setTimeout(() => {
      try {
        if (sirenOsc) { sirenOsc.stop(); sirenOsc.disconnect(); sirenOsc = null; }
        if (sirenLfo) { sirenLfo.stop(); sirenLfo.disconnect(); sirenLfo = null; }
        if (sirenCtx && sirenCtx.state !== 'closed') { sirenCtx.close(); sirenCtx = null; }
      } catch (e) {
        // Safe cleanup
      }
      isSirenCurrentlyPlaying = false;
    }, 350);
  } catch (err) {
    isSirenCurrentlyPlaying = false;
  }
}

export function isSirenActive(): boolean {
  return isSirenCurrentlyPlaying;
}
