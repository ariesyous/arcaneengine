// audio.js - Simple synthesizer for retro sound effects using Web Audio API

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
        btn.textContent = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
    }
    return soundEnabled;
}

function playTone(freq, type, duration, volScale = 1, freqRamp = null) {
    if (!soundEnabled) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    if (freqRamp) {
        osc.frequency.exponentialRampToValueAtTime(freqRamp, audioCtx.currentTime + duration);
    }

    gainNode.gain.setValueAtTime(0.1 * volScale, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Noise buffer for hit/error sounds
let noiseBuffer = null;
function playNoise(duration, volScale = 1) {
    if (!soundEnabled) return;
    initAudio();

    if (!noiseBuffer) {
        const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.1 * volScale, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    whiteNoise.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();
    whiteNoise.stop(audioCtx.currentTime + duration);
}

const Audio = {
    playHit: () => {
        playNoise(0.2, 1.5);
        playTone(150, 'sawtooth', 0.15, 1, 50);
    },
    playShield: () => {
        playTone(300, 'sine', 0.3, 1, 600);
    },
    playGold: () => {
        playTone(900, 'triangle', 0.1, 0.5);
        setTimeout(() => playTone(1200, 'triangle', 0.2, 0.5), 100);
    },
    playError: () => {
        playTone(150, 'square', 0.2, 0.8);
    },
    playDrop: () => {
        playNoise(0.05, 0.2);
    },
    playLoop: () => {
        playTone(400, 'sine', 0.2, 1, 800);
        setTimeout(() => playTone(600, 'sine', 0.3, 1, 1200), 100);
    }
};
