/**
 * Canlı Saat - Akıllı Olay Yöneticisi (Event Manager)
 * Olayların asla üst üste çakışmamasını (Mutex Lock) ve sakin aralıklarla devreye girmesini sağlar.
 * Yerçekimi Anomalisi, Altın Yağmuru, UFO Ziyareti, Kar Fırtınası & Buz Kazıma, Boss Geçişi.
 */

class EventManager {
    constructor() {
        this.currentEvent = null;
        this.isBusy = false;
        this.lastEventTime = 0;
        this.eventCooldownMs = 240000; // Normal akışta eventler arası min 4 dakika sakinlik
        this.coins = [];
        this.frostCanvas = null;
        this.frostCtx = null;
        this.collectedGoldCount = 0;
    }

    init() {
        this.frostCanvas = document.getElementById('frost-canvas');
        if (this.frostCanvas) {
            this.frostCtx = this.frostCanvas.getContext('2d');
            this.resizeFrost();
            window.addEventListener('resize', () => this.resizeFrost());

            // Buz kazıma fare dinleyicisi
            this.frostCanvas.addEventListener('pointermove', (e) => {
                if (this.currentEvent === 'blizzard') {
                    this.scratchFrost(e.clientX, e.clientY);
                }
            });
        }

        // Açılışta ilk 10 saniye saat tertemiz ve sakin başlar, ardından rastgele ambient olaylar devreye girer
        this.frequencyMode = 'balanced'; // 'frequent' (25-40s), 'balanced' (45-75s), 'calm' (120-180s)
        setTimeout(() => {
            this.startRandomAmbientLoop();
        }, 10000);
    }

    setFrequency(mode) {
        this.frequencyMode = mode;
        if (window.radarHUD) {
            window.radarHUD.addLogEntry(`Olay Sıklığı Güncellendi: ${mode}`);
        }
    }

    getDelayRange() {
        if (this.frequencyMode === 'frequent') return 25000 + Math.random() * 15000; // ~30 sn
        if (this.frequencyMode === 'calm') return 120000 + Math.random() * 60000;    // ~3 dk
        return 45000 + Math.random() * 30000; // ~60 sn (Dengeli)
    }

    startRandomAmbientLoop() {
        const scheduleNext = () => {
            const nextDelay = this.getDelayRange();
            setTimeout(() => {
                this.triggerRandomAmbientEvent();
                scheduleNext();
            }, nextDelay);
        };
        scheduleNext();
    }

    triggerRandomAmbientEvent() {
        if (this.isBusy) return;

        const ambientPool = [
            'bird_flock',      // Göç eden kuş sürüsü
            'sakura_wind',     // Savrulan kiraz çiçeği yaprakları
            'jellyfish',       // Süzülen kozmik denizanaları
            'matrix_glitch',   // Matrix kod yağmuru
            'theme_shift',     // Yumuşak renk teması değişimi
            'shooting_star',   // Kayan parlak yıldızlar
            'balloons',        // Süzülen renkli balonlar
            'confetti_burst',  // Mini konfeti parıltısı
            'ufo_pass',        // Arka planda geçen UFO
            'gravity_wave',    // 10 sn hafif yerçekimi salınımı
            'gentle_snow',     // Hafif kar serpintisi
            'golden_rush',     // Altın yağmuru
            'mini_parade'      // Alt bando geçişi
        ];

        const pick = ambientPool[Math.floor(Math.random() * ambientPool.length)];

        switch (pick) {
            case 'bird_flock':
                if (window.ecosystemEngine) window.ecosystemEngine.spawnBirdFlock();
                if (window.radarHUD) window.radarHUD.addLogEntry('🕊️ Göç Eden Kuş Sürüsü');
                break;
            case 'sakura_wind':
                if (window.ecosystemEngine) window.ecosystemEngine.spawnWindGust('sakura');
                if (window.radarHUD) window.radarHUD.addLogEntry('🌸 Sakura Rüzgarı');
                break;
            case 'jellyfish':
                if (window.ecosystemEngine) window.ecosystemEngine.spawnJellyfishSwarm();
                if (window.radarHUD) window.radarHUD.addLogEntry('🪼 Süzülen Deniz Anaları');
                break;
            case 'matrix_glitch':
                if (window.ecosystemEngine) window.ecosystemEngine.triggerMatrixGlitch(5000);
                if (window.radarHUD) window.radarHUD.addLogEntry('💻 Matrix Kod Yağmuru');
                break;
            case 'theme_shift':
                if (window.app) window.app.triggerColorSplash();
                break;
            case 'shooting_star':
                if (window.wishMode) {
                    for (let i = 0; i < 4; i++) {
                        setTimeout(() => window.wishMode.spawnShootingStar(), i * 400);
                    }
                    if (window.soundEngine) window.soundEngine.playWishChime();
                    if (window.radarHUD) window.radarHUD.addLogEntry('💫 Kayan Yıldızlar');
                }
                break;
            case 'balloons':
                if (window.physicsEngine) window.physicsEngine.spawnBalloons(8);
                break;
            case 'confetti_burst':
                if (window.physicsEngine) window.physicsEngine.launchConfetti(80);
                break;
            case 'ufo_pass':
                this.triggerCosmicVisitor();
                break;
            case 'gravity_wave':
                this.triggerGravityGlitch();
                break;
            case 'gentle_snow':
                this.triggerBlizzard();
                break;
            case 'golden_rush':
                this.triggerGoldenRush();
                break;
            case 'mini_parade':
                if (window.characterParade) window.characterParade.startParade();
                break;
        }
    }

    triggerEvent(eventName) {
        if (this.isBusy) return;

        switch (eventName) {
            case 'gravity':
                this.triggerGravityGlitch();
                break;
            case 'golden':
                this.triggerGoldenRush();
                break;
            case 'ufo':
                this.triggerCosmicVisitor();
                break;
            case 'blizzard':
                this.triggerBlizzard();
                break;
            case 'boss':
                this.triggerBossParade();
                break;
            case 'portal':
                this.triggerCosmicPortal();
                break;
        }
    }

    // 1. YERÇEKİMİ ANOMALİSİ (GRAVITY GLITCH)
    async triggerGravityGlitch() {
        this.isBusy = true;
        this.currentEvent = 'gravity';
        this.lastEventTime = Date.now();

        this.showEventBanner('⚠️ DİKKAT: YERÇEKİMİ ANOMALİSİ ⚠️', 'Binalar ve parçacıklar ağırlıksız süzülüyor! Fareyle savurun.');
        if (window.soundEngine) window.soundEngine.playGravityShift();
        if (window.universeEngine) window.universeEngine.setZeroGravity(true);
        if (window.radarHUD) window.radarHUD.addLogEntry('⚠️ Yerçekimi Anomalisi');

        // 16 saniye sonra yerçekimi geri gelir
        await this._delay(16000);

        if (window.universeEngine) window.universeEngine.setZeroGravity(false);
        this.hideEventBanner();
        this.currentEvent = null;
        this.isBusy = false;
    }

    // 2. ALTIN YAĞMURU (GOLDEN RUSH)
    async triggerGoldenRush() {
        this.isBusy = true;
        this.currentEvent = 'golden';
        this.lastEventTime = Date.now();
        this.collectedGoldCount = 0;

        this.showEventBanner('💰 ALTIN YAĞMURU BAŞLADI! 💰', 'Düşen altın paralara tıklayarak toplayın!');
        if (window.soundEngine) window.soundEngine.playWishChime();
        if (window.radarHUD) window.radarHUD.addLogEntry('🪙 Altın Yağmuru');

        const goldContainer = document.getElementById('golden-rush-layer');
        if (goldContainer) {
            goldContainer.innerHTML = '<div id="gold-hud" class="gold-hud">⭐ Toplanan Altın: <span id="gold-count">0</span></div>';
            goldContainer.classList.add('active');

            // 18 saniye boyunca altın paralar yağdır
            const interval = setInterval(() => {
                if (this.currentEvent !== 'golden') {
                    clearInterval(interval);
                    return;
                }
                this.spawnGoldCoin(goldContainer);
            }, 350);

            await this._delay(18000);
            clearInterval(interval);
            goldContainer.classList.remove('active');
            goldContainer.innerHTML = '';
        }

        this.hideEventBanner();
        this.currentEvent = null;
        this.isBusy = false;
    }

    spawnGoldCoin(container) {
        const coin = document.createElement('div');
        coin.className = 'falling-gold-coin';
        const startX = Math.random() * (window.innerWidth - 60) + 30;
        coin.style.left = `${startX}px`;
        coin.style.animationDuration = `${3 + Math.random() * 2}s`;
        coin.innerHTML = '🪙';

        coin.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (window.soundEngine) window.soundEngine.playCoinCollect();
            this.collectedGoldCount++;
            const counter = document.getElementById('gold-count');
            if (counter) counter.textContent = this.collectedGoldCount;

            // Zemin altın kaplama oranını artır
            if (window.universeEngine) {
                window.universeEngine.goldCoverRatio = Math.min(1.0, window.universeEngine.goldCoverRatio + 0.05);
            }

            // Tıklanan parayı parıltıya dönüştür
            coin.classList.add('collected');
            setTimeout(() => coin.remove(), 400);
        });

        container.appendChild(coin);
        setTimeout(() => { if (coin.parentNode) coin.remove(); }, 6000);
    }

    // 3. UFO / UZAY BALINASI ZİYARETİ
    async triggerCosmicVisitor() {
        this.isBusy = true;
        this.currentEvent = 'ufo';
        this.lastEventTime = Date.now();

        this.showEventBanner('🛸 KOZMİK ZİYARETÇİ GEÇİYOR', 'Gökyüzünden bir UFO süzülüyor ve nebula tozu saçıyor.');
        if (window.soundEngine) window.soundEngine.playUfoBeam();

        const ufo = document.getElementById('cosmic-ufo');
        if (ufo) {
            ufo.classList.remove('hidden');
            ufo.classList.add('flying');
        }

        await this._delay(14000);

        if (ufo) {
            ufo.classList.remove('flying');
            ufo.classList.add('hidden');
        }

        this.hideEventBanner();
        this.currentEvent = null;
        this.isBusy = false;
    }

    // 4. KAR FIRTINASI VE BUZ KAZIMA (BLIZZARD)
    async triggerBlizzard() {
        this.isBusy = true;
        this.currentEvent = 'blizzard';
        this.lastEventTime = Date.now();

        this.showEventBanner('❄️ AŞIRI KAR VE TİPİ FIRTINASI ❄️', 'Ekran buz tuttu! Fareyi gezdirerek buzları kazıyın.');
        if (window.soundEngine) window.soundEngine.playWind();

        // Buz tabakasını çiz
        if (this.frostCtx) {
            this.frostCtx.fillStyle = 'rgba(210, 235, 255, 0.45)';
            this.frostCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            this.frostCanvas.style.pointerEvents = 'auto';
        }

        await this._delay(16000);

        // Buzu erit
        if (this.frostCtx) {
            this.frostCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            this.frostCanvas.style.pointerEvents = 'none';
        }

        this.hideEventBanner();
        this.currentEvent = null;
        this.isBusy = false;
    }

    scratchFrost(x, y) {
        if (!this.frostCtx) return;
        this.frostCtx.save();
        this.frostCtx.globalCompositeOperation = 'destination-out';
        this.frostCtx.beginPath();
        this.frostCtx.arc(x, y, 45, 0, Math.PI * 2);
        this.frostCtx.fill();
        this.frostCtx.restore();
    }

    // 5. DEV GODZILLA / BOSS GEÇİŞİ
    async triggerBossParade() {
        this.isBusy = true;
        this.currentEvent = 'boss';
        this.lastEventTime = Date.now();

        this.showEventBanner('🦖 ÖZEL MİSAFİR: ŞEHİR TURU', 'Devasa sevimli Godzilla şehri selamlıyor!');
        if (window.soundEngine) window.soundEngine.playDrumRoll();

        const boss = document.getElementById('boss-creature');
        if (boss) {
            boss.classList.remove('hidden');
            boss.classList.add('stomping');
        }

        await this._delay(12000);

        if (boss) {
            boss.classList.remove('stomping');
            boss.classList.add('hidden');
        }

        this.hideEventBanner();
        this.currentEvent = null;
        this.isBusy = false;
    }

    // 6. KOZMİK PORTAL (SAAT BAŞI)
    async triggerCosmicPortal() {
        this.isBusy = true;
        this.currentEvent = 'portal';
        this.lastEventTime = Date.now();

        this.showEventBanner('🌌 KOZMİK ENERJİ PORTALI AÇILDI 🌌', 'Yeni saat boyutuna geçiş yapılıyor!');
        if (window.soundEngine) window.soundEngine.playPortalSwirl();

        const portal = document.getElementById('cosmic-portal');
        if (portal) portal.classList.add('active');

        await this._delay(9000);

        if (portal) portal.classList.remove('active');
        this.hideEventBanner();
        this.currentEvent = null;
        this.isBusy = false;
    }

    showEventBanner(title, desc) {
        const banner = document.getElementById('event-banner');
        if (banner) {
            banner.innerHTML = `<strong>${title}</strong> <span>${desc}</span>`;
            banner.classList.add('show');
        }
    }

    hideEventBanner() {
        const banner = document.getElementById('event-banner');
        if (banner) banner.classList.remove('show');
    }

    _delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

window.eventManager = new EventManager();
