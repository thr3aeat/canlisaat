/**
 * Canlı Saat - Screensaver, TV Modu & OLED Yanma Koruması
 * 5 saniye hareketsizlikte butonları gizleyen sinematik mod,
 * OLED paneller için piksel mikro-kaydırma ve arka plan sekmesinde GPU tasarrufu.
 */

class ScreensaverEngine {
    constructor() {
        this.inactivityTimeout = null;
        this.inactivityDelayMs = 5000; // 5 saniye
        this.isScreensaverActive = false;
        this.burnInTimer = null;
        this.isTabVisible = true;
    }

    init() {
        // Fare ve klavye hareket dinleyicileri
        const resetActivity = () => this.handleUserActivity();

        window.addEventListener('mousemove', resetActivity, { passive: true });
        window.addEventListener('mousedown', resetActivity, { passive: true });
        window.addEventListener('keydown', resetActivity, { passive: true });
        window.addEventListener('touchstart', resetActivity, { passive: true });

        this.startInactivityTimer();
        this.startOledProtection();
        this.initVisibilityHandler();
    }

    startInactivityTimer() {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = setTimeout(() => {
            this.enterScreensaverMode();
        }, this.inactivityDelayMs);
    }

    handleUserActivity() {
        if (this.isScreensaverActive) {
            this.exitScreensaverMode();
        }
        this.startInactivityTimer();
    }

    enterScreensaverMode() {
        this.isScreensaverActive = true;
        document.body.classList.add('screensaver-active');
    }

    exitScreensaverMode() {
        this.isScreensaverActive = false;
        document.body.classList.remove('screensaver-active');
    }

    // OLED Yanma Önleyici (Piksel Mikro-Kaydırma)
    startOledProtection() {
        // Her 7 dakikada bir saat kartını 3-5 piksel rastgele kaydır
        this.burnInTimer = setInterval(() => {
            const clockCard = document.getElementById('clock-card');
            if (clockCard) {
                const shiftX = (Math.random() - 0.5) * 8; // -4px ile +4px arası
                const shiftY = (Math.random() - 0.5) * 6; // -3px ile +3px arası
                clockCard.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            }
        }, 420000);
    }

    // Sekme Görünürlük & GPU Optimizasyonu
    initVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            this.isTabVisible = !document.hidden;
            if (document.hidden) {
                // Arka plana atıldığında gereksiz sesleri duraklat
                if (window.soundEngine && window.soundEngine.ambientGain) {
                    window.soundEngine.ambientGain.gain.setValueAtTime(0, window.soundEngine.ctx?.currentTime || 0);
                }
            } else {
                if (window.soundEngine && window.soundEngine.ambientActive && window.soundEngine.ambientGain) {
                    window.soundEngine.ambientGain.gain.setValueAtTime(0.2, window.soundEngine.ctx?.currentTime || 0);
                }
            }
        });
    }
}

window.screensaverEngine = new ScreensaverEngine();
