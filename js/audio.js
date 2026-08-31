/**
 * Canlı Saat - Web Audio API Ses Sentezleyici Motoru
 * Herhangi bir harici ses dosyasına ihtiyaç duymadan gerçek zamanlı ses üretir.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API başlatılamadı:', e);
        }
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // 1. Guguk Kuşu Sesi ("Guu-guk!")
    playCuckoo() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Birinci hece: "Guu" (F5 ~ 698.46 Hz)
        this._playCuckooNote(698.46, now, 0.28);

        // İkinci hece: "guk!" (D5 ~ 587.33 Hz)
        this._playCuckooNote(587.33, now + 0.32, 0.35);
    }

    _playCuckooNote(freq, startTime, duration) {
        if (!this.ctx || !this.masterGain) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            // Hafif frekans bükülmesi (doğal kuş tonu)
            osc.frequency.exponentialRampToValueAtTime(freq * 0.96, startTime + duration);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2200, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.6, startTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        } catch (e) {
            console.warn(e);
        }
    }

    // 2. Balon Patlama Sesi
    playBalloonPop() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, now);
            filter.Q.setValueAtTime(1.5, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.09);
            oscGain.gain.setValueAtTime(0.9, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.connect(oscGain);
            oscGain.connect(this.masterGain);

            noise.start(now);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {}
    }

    // 3. Havai Fişek Fırlatma ve Patlama Sesi
    playFireworkRocket() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(1400, now + 0.8);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.9);
        } catch (e) {}
    }

    playFireworkBoom() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.8);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, now);
            filter.frequency.linearRampToValueAtTime(80, now + 0.7);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(1.0, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start(now);
        } catch (e) {}
    }

    // 4. Konfeti Topu Patlama Sesi
    playConfettiCannon() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    // 5. Tıklanabilir Jöle Rakam Zilleri
    playDigitChime(index = 0) {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
            const freq = scale[index % scale.length] || 523.25;
            const now = this.ctx.currentTime;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 2.01, now);

            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            gain2.gain.setValueAtTime(0.2, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc2.connect(gain2);
            gain2.connect(this.masterGain);

            osc.start(now);
            osc2.start(now);
            osc.stop(now + 0.45);
            osc2.stop(now + 0.45);
        } catch (e) {}
    }

    // 6. Slot Makinesi Dönüş & Kilit Sesi
    playSlotTick() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(700 + Math.random() * 200, now);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    playSlotLock() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.28);
        } catch (e) {}
    }

    // 7. Dilek Yıldızı Parıltısı
    playWishChime() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const notes = [1046.50, 1318.51, 1567.98, 2093.00];
            notes.forEach((freq, idx) => {
                const now = this.ctx.currentTime + idx * 0.08;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now);
                osc.stop(now + 0.65);
            });
        } catch (e) {}
    }

    // 8. Renk Patlaması (Color Splash) Ses Dalgası
    playColorSplash() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.4);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.linearRampToValueAtTime(2500, now + 0.35);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.55);
        } catch (e) {}
    }

    // 9. Bando Trampet Vuruşu
    playDrumRoll() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            for (let i = 0; i < 4; i++) {
                const time = now + i * 0.12;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, time);
                osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(time);
                osc.stop(time + 0.1);
            }
        } catch (e) {}
    }

    // 10. Altın Toplama Sesi (Coin Ping)
    playCoinCollect() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.setValueAtTime(1318.51, now + 0.08);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {}
    }

    // 11. Yerçekimi Anomalisi / Uzay Dalgası
    playGravityShift() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 1.2);
            osc.frequency.exponentialRampToValueAtTime(90, now + 2.5);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 2.7);
        } catch (e) {}
    }

    // 12. UFO / Uzay Balinası Işın Sesi
    playUfoBeam() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.4);
            osc.frequency.linearRampToValueAtTime(220, now + 0.8);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 1.0);
        } catch (e) {}
    }

    // 13. Kar Fırtınası / Rüzgar Uğultusu
    playWind() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 2.0);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(320, now);
            filter.frequency.linearRampToValueAtTime(600, now + 1.0);
            filter.frequency.linearRampToValueAtTime(280, now + 2.0);
            filter.Q.setValueAtTime(3.0, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start(now);
        } catch (e) {}
    }

    // 14. Kozmik Portal Girdabı
    playPortalSwirl() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 1.5);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 1.9);
        } catch (e) {}
    }

    // 15. Saat Başı Yumuşak Tibet Gong / Çan Tonu
    playHourGong() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        try {
            const now = this.ctx.currentTime;
            const freqs = [174.61, 261.63, 392.00, 523.25]; // F3, C4, G4, C5
            freqs.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = idx === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.4 / (idx + 1), now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now);
                osc.stop(now + 4.6);
            });
        } catch (e) {}
    }

    // 16. Üretken Ambiyans & Lo-Fi Manzara (Generative Soundscape)
    toggleAmbientSoundscape() {
        this.ambientActive = !this.ambientActive;
        this.resume();
        if (!this.ctx) return false;

        if (this.ambientActive) {
            this.startAmbientSoundscape();
        } else {
            this.stopAmbientSoundscape();
        }
        return this.ambientActive;
    }

    startAmbientSoundscape() {
        if (!this.ctx) return;
        try {
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.ambientGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 2.0);
            this.ambientGain.connect(this.masterGain);

            // Derin kozmik/lo-fi drone osilatörleri
            this.ambientOsc1 = this.ctx.createOscillator();
            this.ambientOsc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();

            this.ambientOsc1.type = 'sine';
            this.ambientOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

            this.ambientOsc2.type = 'triangle';
            this.ambientOsc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, this.ctx.currentTime);

            this.ambientOsc1.connect(filter);
            this.ambientOsc2.connect(filter);
            filter.connect(this.ambientGain);

            this.ambientOsc1.start();
            this.ambientOsc2.start();
        } catch (e) {}
    }

    setSoundscapeMood(mood) {
        if (!this.ambientActive || !this.ambientOsc1 || !this.ambientOsc2 || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            if (mood === 'cyberpunk') {
                this.ambientOsc1.frequency.linearRampToValueAtTime(110, now + 1.5);
                this.ambientOsc2.frequency.linearRampToValueAtTime(164.81, now + 1.5);
            } else if (mood === 'cosmos') {
                this.ambientOsc1.frequency.linearRampToValueAtTime(73.42, now + 1.5); // D2
                this.ambientOsc2.frequency.linearRampToValueAtTime(146.83, now + 1.5); // D3
            } else if (mood === 'ghibli') {
                this.ambientOsc1.frequency.linearRampToValueAtTime(130.81, now + 1.5); // C3
                this.ambientOsc2.frequency.linearRampToValueAtTime(196.00, now + 1.5); // G3
            } else if (mood === 'retro') {
                this.ambientOsc1.frequency.linearRampToValueAtTime(146.83, now + 1.5); // D3
                this.ambientOsc2.frequency.linearRampToValueAtTime(220.00, now + 1.5); // A3
            }
        } catch (e) {}
    }

    stopAmbientSoundscape() {
        if (this.ambientGain && this.ctx) {
            try {
                this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
                setTimeout(() => {
                    if (this.ambientOsc1) { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); }
                    if (this.ambientOsc2) { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); }
                }, 1050);
            } catch (e) {}
        }
    }
}

window.soundEngine = new SoundEngine();
