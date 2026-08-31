/**
 * Canlı Saat - Ana Uygulama & Zaman Kontrolcüsü
 * Tüm modülleri (Fizik, Havai Fişek, Guguk Kuşu, Bando, Dilek Modu, Tipografi) entegre eder.
 */

class LiveClockApp {
    constructor() {
        this.lastSecond = -1;
        this.lastMinute = -1;
        this.lastHour = -1;
        this.isFastForwarding = false;
        this.simulatedOffset = 0; // ms cinsinden simülasyon farkı

        this.themes = [
            {
                name: 'Cyberpunk Neon',
                bg: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
                primary: '#00F0FF',
                secondary: '#FF007F',
                accent: '#FFE600',
                glow: 'rgba(0, 240, 255, 0.45)'
            },
            {
                name: 'Aurora Borealis',
                bg: 'radial-gradient(ellipse at bottom, #0d324d 0%, #020b14 100%)',
                primary: '#00FF9D',
                secondary: '#7928CA',
                accent: '#60EFFF',
                glow: 'rgba(0, 255, 157, 0.45)'
            },
            {
                name: 'Sunset Gold',
                bg: 'radial-gradient(ellipse at bottom, #3b142b 0%, #0f0514 100%)',
                primary: '#FF8A00',
                secondary: '#E52E71',
                accent: '#FFD600',
                glow: 'rgba(255, 138, 0, 0.45)'
            },
            {
                name: 'Deep Oceanic',
                bg: 'radial-gradient(ellipse at bottom, #09203f 0%, #030a14 100%)',
                primary: '#4facfe',
                secondary: '#00f2fe',
                accent: '#a8edea',
                glow: 'rgba(79, 172, 254, 0.45)'
            },
            {
                name: 'Midnight Amethyst',
                bg: 'radial-gradient(ellipse at bottom, #2b1055 0%, #08020f 100%)',
                primary: '#b000ff',
                secondary: '#ff00aa',
                accent: '#d870ff',
                glow: 'rgba(176, 0, 255, 0.45)'
            }
        ];
        this.currentThemeIndex = 0;
    }

    init() {
        // Alt Motorları Başlat
        const universeCanvas = document.getElementById('universe-canvas');
        if (universeCanvas) window.universeEngine.init(universeCanvas);

        const ecosystemCanvas = document.getElementById('ecosystem-canvas');
        if (ecosystemCanvas) window.ecosystemEngine.init(ecosystemCanvas);

        const moodCanvas = document.getElementById('mood-canvas');
        if (moodCanvas) window.moodEngine.init(moodCanvas);

        window.eventManager.init();
        window.radarHUD.init();
        window.collectionEngine.init();
        window.screensaverEngine.init();

        const physicsCanvas = document.getElementById('physics-canvas');
        if (physicsCanvas) window.physicsEngine.init(physicsCanvas);

        const fireworksCanvas = document.getElementById('fireworks-canvas');
        if (fireworksCanvas) window.fireworksEngine.init(fireworksCanvas);

        window.cuckooClock.init();
        window.characterParade.init();
        window.typographyEngine.init();
        window.wishMode.init();

        this.bindEvents();
        this.updateClockDisplay(this.getCurrentDate());

        // Ana Saat Döngüsü (Hassas ms zamanlayıcı)
        this.tick = this.tick.bind(this);
        requestAnimationFrame(this.tick);
    }

    bindEvents() {
        // Atmosfer / Mood Değiştirici Buton
        const moodBtn = document.getElementById('btn-mood-switch');
        if (moodBtn) {
            moodBtn.addEventListener('click', () => {
                const moods = ['cyberpunk', 'cosmos', 'ghibli', 'retro'];
                const nextIndex = (moods.indexOf(window.moodEngine.currentMood) + 1) % moods.length;
                window.moodEngine.setMood(moods[nextIndex]);
            });
        }

        // Üretken Lo-Fi / Ambiyans Sesi Butonu
        const lofiBtn = document.getElementById('btn-lofi');
        if (lofiBtn) {
            lofiBtn.addEventListener('click', () => {
                const active = window.soundEngine.toggleAmbientSoundscape();
                lofiBtn.classList.toggle('active', active);
                lofiBtn.innerHTML = active 
                    ? '🎵 <span class="btn-label">Lo-Fi: Açık</span>' 
                    : '🎵 <span class="btn-label">Lo-Fi Ambiyans</span>';
            });
        }

        // Ayarlar Modalı Aç / Kapat
        const btnSettings = document.getElementById('btn-open-settings');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings-btn');
        const selectFreq = document.getElementById('select-frequency');

        if (btnSettings && settingsModal) {
            btnSettings.addEventListener('click', () => settingsModal.classList.add('active'));
        }
        if (closeSettings && settingsModal) {
            closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
        }
        if (selectFreq) {
            selectFreq.addEventListener('change', (e) => {
                window.eventManager.setFrequency(e.target.value);
            });
        }

        // Ses Butonu
        const muteBtn = document.getElementById('btn-sound');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = window.soundEngine.toggleMute();
                muteBtn.innerHTML = isMuted ? '🔇 <span class="btn-label">Sessiz</span>' : '🔊 <span class="btn-label">Ses Açık</span>';
                muteBtn.classList.toggle('active', !isMuted);
            });
        }

        // Tam Ekran Butonu
        const fsBtn = document.getElementById('btn-fullscreen');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Tipografi Modu Seçici
        const typoSelect = document.getElementById('select-typography');
        if (typoSelect) {
            typoSelect.addEventListener('change', (e) => {
                window.typographyEngine.setMode(e.target.value);
            });
        }

        // --- TEST / SİMÜLASYON BARLARI ---
        document.getElementById('test-sim-hour')?.addEventListener('click', () => this.simulateHourTurnover());
        document.getElementById('test-sim-wish')?.addEventListener('click', () => window.wishMode.triggerWishMode('11:11'));
        document.getElementById('test-sim-cuckoo')?.addEventListener('click', () => {
            const now = this.getCurrentDate();
            window.cuckooClock.trigger(now.getHours() || 3);
        });
        document.getElementById('test-sim-fireworks')?.addEventListener('click', () => window.fireworksEngine.startShow(8000));
        document.getElementById('test-sim-confetti')?.addEventListener('click', () => window.physicsEngine.launchConfetti(200));
        document.getElementById('test-sim-balloons')?.addEventListener('click', () => window.physicsEngine.spawnBalloons(15));

        // Canlı Event Simülasyon Butonları
        document.getElementById('test-sim-gravity')?.addEventListener('click', () => window.eventManager.triggerGravityGlitch());
        document.getElementById('test-sim-gold')?.addEventListener('click', () => window.eventManager.triggerGoldenRush());
        document.getElementById('test-sim-ufo')?.addEventListener('click', () => window.eventManager.triggerCosmicVisitor());
        document.getElementById('test-sim-blizzard')?.addEventListener('click', () => window.eventManager.triggerBlizzard());
        document.getElementById('test-sim-boss')?.addEventListener('click', () => window.eventManager.triggerBossParade());

        // Klavye Kısayolları (Mood 1-4, Lo-Fi L, F Fullscreen, M Mute vb.)
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const key = e.key.toUpperCase();
            if (key === '1') window.moodEngine.setMood('cyberpunk');
            if (key === '2') window.moodEngine.setMood('cosmos');
            if (key === '3') window.moodEngine.setMood('ghibli');
            if (key === '4') window.moodEngine.setMood('retro');
            if (key === 'L') document.getElementById('btn-lofi')?.click();
            if (key === 'F') this.toggleFullscreen();
            if (key === 'M') document.getElementById('btn-sound')?.click();
            if (key === 'C') window.physicsEngine.launchConfetti(180);
            if (key === 'B') window.physicsEngine.spawnBalloons(12);
            if (key === 'G') window.cuckooClock.trigger(3);
            if (key === 'H') window.fireworksEngine.startShow(6000);
            if (key === 'P') window.characterParade.startParade();
        });
    }

    getCurrentDate() {
        return new Date(Date.now() + this.simulatedOffset);
    }

    tick() {
        const now = this.getCurrentDate();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const ms = now.getMilliseconds();

        // Saniye değişimi
        if (s !== this.lastSecond) {
            this.lastSecond = s;
            this.updateClockDisplay(now);

            // 59. Saniye Sonar Şok Dalgası
            if (s === 59 && window.ecosystemEngine) {
                window.ecosystemEngine.triggerSonarWave();
            }

            // Bitmeyen Şehir İnşaat Bloğu
            if (window.universeEngine) {
                window.universeEngine.onSecondTick(h, m, s);
            }

            // Dakika değişimi kontrolü
            if (m !== this.lastMinute) {
                this.lastMinute = m;
                // 11:11 / 22:22 simetrik dakika kontrolü
                window.wishMode.checkSymmetricalTime(h, m);
                // Periyodik sakin ara olay kontrolü
                if (window.eventManager) {
                    window.eventManager.checkPeriodicEvents(h, m);
                }
            }

            // Saat başı devretme kontrolü (XX:00:00)
            if (m === 0 && s === 0) {
                this.onHourTurnover(h);
            }
        }

        // Saniye ilerleme çubuğu güncellemesi
        const secProgress = ((s * 1000 + ms) / 60000) * 100;
        const secondsBar = document.getElementById('seconds-bar');
        if (secondsBar) {
            secondsBar.style.width = `${secProgress}%`;
        }

        requestAnimationFrame(this.tick);
    }

    updateClockDisplay(dateObj) {
        const h = String(dateObj.getHours()).padStart(2, '0');
        const m = String(dateObj.getMinutes()).padStart(2, '0');
        const s = String(dateObj.getSeconds()).padStart(2, '0');
        const timeStr = `${h}:${m}:${s}`;

        // Normal tik veya seçili tipografi modu
        window.typographyEngine.updateDirect(timeStr);

        // Tarih formatı (Türkçe)
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = dateObj.toLocaleDateString('tr-TR', options);
        }

        // Gün/Gece İkonu
        const periodEl = document.getElementById('clock-period-badge');
        if (periodEl) {
            const isNight = dateObj.getHours() >= 20 || dateObj.getHours() < 6;
            periodEl.innerHTML = isNight ? '🌙 Gece Modu' : '☀️ Gündüz Modu';
        }
    }

    // SAAT BAŞI KUTLAMALARI (XX:00:00)
    async onHourTurnover(hour) {
        if (window.soundEngine) window.soundEngine.playHourGong();
        if (window.radarHUD) window.radarHUD.addLogEntry(`🔔 Saat Başı Devri (${hour || 12}:00)`);

        // 0. Kozmik Enerji Portalı
        if (window.eventManager) {
            window.eventManager.triggerCosmicPortal();
        }

        // 1. Tipografi Animasyonu
        const now = this.getCurrentDate();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const mode = window.typographyEngine.currentMode;
        if (mode === 'slot') {
            window.typographyEngine.playSlotMachine(timeStr);
        } else if (mode === 'liquid') {
            window.typographyEngine.playLiquidTransition(timeStr);
        } else if (mode === 'blocks') {
            window.typographyEngine.playBlocksTransition(timeStr);
        }

        // 2. Fiziksel Konfetiler
        window.physicsEngine.launchConfetti(220);

        // 3. Süzülen Renkli Balonlar
        window.physicsEngine.spawnBalloons(16);

        // 4. Gece Saatlerindeyse Havai Fişekler
        const isNight = hour >= 20 || hour < 6;
        if (isNight) {
            setTimeout(() => window.fireworksEngine.startShow(9000), 500);
        }

        // 5. Guguk Kuşu Fırlaması
        setTimeout(() => {
            window.cuckooClock.trigger(hour || 12);
        }, 800);

        // 6. Mini Karakterler Geçit Töreni
        setTimeout(() => {
            window.characterParade.startParade();
        }, 2000);
    }

    // RENK PATLAMASI (COLOR SPLASH)
    triggerColorSplash() {
        if (window.soundEngine) window.soundEngine.playColorSplash();

        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const theme = this.themes[this.currentThemeIndex];

        // Dairesel boya yayılma animasyonu (Splash Wave)
        const splashEl = document.createElement('div');
        splashEl.className = 'color-splash-wave';
        splashEl.style.background = `radial-gradient(circle, ${theme.primary} 0%, ${theme.secondary} 70%, transparent 100%)`;
        document.body.appendChild(splashEl);

        setTimeout(() => {
            this.applyTheme(this.currentThemeIndex, true);
            setTimeout(() => splashEl.remove(), 800);
        }, 300);
    }

    applyTheme(index, animate = false) {
        const theme = this.themes[index];
        const root = document.documentElement;
        root.style.setProperty('--theme-bg', theme.bg);
        root.style.setProperty('--theme-primary', theme.primary);
        root.style.setProperty('--theme-secondary', theme.secondary);
        root.style.setProperty('--theme-accent', theme.accent);
        root.style.setProperty('--theme-glow', theme.glow);

        const themeNameEl = document.getElementById('current-theme-name');
        if (themeNameEl) themeNameEl.textContent = theme.name;
    }

    // SAAT BAŞINA 5 SANİYE KALAYA SAR (XX:59:55 TESTİ)
    simulateHourTurnover() {
        const now = new Date();
        const target = new Date(now);
        target.setMinutes(59);
        target.setSeconds(55);
        target.setMilliseconds(0);

        this.simulatedOffset = target.getTime() - now.getTime();

        const toast = document.getElementById('toast-msg');
        if (toast) {
            toast.textContent = '⏱️ Saat 59:55 konumuna sarıldı! 5 saniye sonra saat başı patlaması başlayacak...';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4000);
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }
}

// Uygulamayı Başlat (DOMContentLoaded kaçırma korumalı)
function startApp() {
    if (!window.app) {
        window.app = new LiveClockApp();
        window.app.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
