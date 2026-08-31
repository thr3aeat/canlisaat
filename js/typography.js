/**
 * Canlı Saat - Sayı & Tipografi Animasyon Motoru
 * Slot makinesi dönüşü, cıva/sıvı metaball erimesi, domino/blok parçalanması ve tıklanabilir jöle rakamlar.
 */

class TypographyEngine {
    constructor() {
        this.currentMode = 'slot'; // 'slot', 'liquid', 'blocks', 'classic'
        this.digitsElements = [];
        this.isAnimating = false;
    }

    init() {
        this.digitContainers = {
            h1: document.getElementById('digit-h1'),
            h2: document.getElementById('digit-h2'),
            m1: document.getElementById('digit-m1'),
            m2: document.getElementById('digit-m2'),
            s1: document.getElementById('digit-s1'),
            s2: document.getElementById('digit-s2')
        };

        // Tıklanabilir Jöle Rakamlar & Melodik Tınılar
        Object.entries(this.digitContainers).forEach(([key, el], idx) => {
            if (!el) return;
            el.addEventListener('click', (e) => {
                this.jellyBounce(el, idx, e);
            });
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        const clockCard = document.getElementById('clock-card');
        if (clockCard) {
            clockCard.dataset.mode = mode;
        }
    }

    // 1. TIKLANABİLİR JÖLE RAKAM EFEKTİ
    jellyBounce(element, index, event) {
        element.classList.remove('jelly-active');
        void element.offsetWidth; // Reflow
        element.classList.add('jelly-active');

        if (window.soundEngine) {
            window.soundEngine.playDigitChime(index);
        }

        // Tıklama noktasında minik ışıma halkası
        this._createRipple(element, event);

        setTimeout(() => {
            element.classList.remove('jelly-active');
        }, 800);
    }

    _createRipple(element, event) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'digit-ripple';
        const size = Math.max(rect.width, rect.height) * 1.6;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${(event ? event.clientX - rect.left : rect.width / 2) - size / 2}px`;
        ripple.style.top = `${(event ? event.clientY - rect.top : rect.height / 2) - size / 2}px`;

        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    }

    // 2. SLOT MAKİNESİ ANİMASYONU
    async playSlotMachine(targetTimeStr) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const digits = targetTimeStr.replace(/:/g, '').split(''); // ['1','4','0','0','0','0']
        const keys = ['h1', 'h2', 'm1', 'm2', 's1', 's2'];

        // Her bir haneyi sırayla durdurarak casino kilitleme efekti
        const promises = keys.map((key, i) => {
            return new Promise((resolve) => {
                const el = this.digitContainers[key];
                if (!el) return resolve();

                const inner = el.querySelector('.digit-value');
                const targetDigit = digits[i] || '0';

                el.classList.add('slot-spinning');

                let spins = 0;
                const maxSpins = 12 + i * 4; // Haneler sırayla kilitlenir
                const spinInterval = setInterval(() => {
                    inner.textContent = Math.floor(Math.random() * 10);
                    if (window.soundEngine && i === 0 && spins % 2 === 0) {
                        window.soundEngine.playSlotTick();
                    }
                    spins++;

                    if (spins >= maxSpins) {
                        clearInterval(spinInterval);
                        inner.textContent = targetDigit;
                        el.classList.remove('slot-spinning');
                        el.classList.add('slot-locked');

                        if (window.soundEngine) window.soundEngine.playSlotLock();

                        setTimeout(() => {
                            el.classList.remove('slot-locked');
                            resolve();
                        }, 300);
                    }
                }, 50);
            });
        });

        await Promise.all(promises);
        this.isAnimating = false;
    }

    // 3. SIVI / CIVA GEÇİŞİ (Melt & Reshape)
    async playLiquidTransition(targetTimeStr) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const clockMain = document.getElementById('clock-digits-wrapper');
        if (clockMain) clockMain.classList.add('liquid-melting');

        if (window.soundEngine) window.soundEngine.playColorSplash();

        // 1. Aşama: Sayılar erir ve damlar
        await this._delay(700);

        // Sayıları güncelle
        this.updateDirect(targetTimeStr);

        if (clockMain) {
            clockMain.classList.remove('liquid-melting');
            clockMain.classList.add('liquid-forming');
        }

        // 2. Aşama: Damlalardan sayılar tekrar oluşur
        await this._delay(800);
        if (clockMain) clockMain.classList.remove('liquid-forming');

        this.isAnimating = false;
    }

    // 4. DOMİNO / BLOK YIKIMI (Pixel Collapse & Rebuild)
    async playBlocksTransition(targetTimeStr) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const keys = ['h1', 'h2', 'm1', 'm2', 's1', 's2'];
        const digits = targetTimeStr.replace(/:/g, '').split('');

        // Yıkım animasyonu
        keys.forEach((k) => {
            const el = this.digitContainers[k];
            if (el) el.classList.add('block-collapse');
        });

        if (window.soundEngine) window.soundEngine.playConfettiCannon();

        await this._delay(600);

        // Yeni sayıları ayarla
        this.updateDirect(targetTimeStr);

        keys.forEach((k) => {
            const el = this.digitContainers[k];
            if (el) {
                el.classList.remove('block-collapse');
                el.classList.add('block-rebuild');
            }
        });

        await this._delay(600);

        keys.forEach((k) => {
            const el = this.digitContainers[k];
            if (el) el.classList.remove('block-rebuild');
        });

        this.isAnimating = false;
    }

    // Normal güncelleme (animasyonsuz saniyelik tik)
    updateDirect(timeStr) {
        if (!this.digitContainers || !this.digitContainers.h1) {
            this.init();
        }

        const digits = timeStr.replace(/:/g, '').split('');
        const keys = ['h1', 'h2', 'm1', 'm2', 's1', 's2'];

        keys.forEach((key, i) => {
            let el = this.digitContainers ? this.digitContainers[key] : null;
            if (!el) el = document.getElementById(`digit-${key}`);
            if (!el) return;

            let inner = el.querySelector('.digit-value');
            if (!inner) {
                inner = el;
            }

            if (inner.textContent !== digits[i]) {
                inner.textContent = digits[i];
                // Hafif mikrotitreşim
                el.classList.add('digit-tick');
                setTimeout(() => el.classList.remove('digit-tick'), 180);
            }
        });
    }

    _delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

window.typographyEngine = new TypographyEngine();
