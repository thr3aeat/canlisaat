/**
 * Canlı Saat - Canlı Mood & Atmosfer Motoru
 * 4 Farklı Büyüleyici Dünya:
 * 1. Cyberpunk Void (Neon yağmur, fütüristik dronlar, glitch)
 * 2. Deep Cosmos (Gezegenler, nebula girdapları, kayan yıldızlar)
 * 3. Ghibli Doğa (Savrulan yapraklar/çiçekler, ateş böcekleri, gökyüzü balinası)
 * 4. Retro 8-Bit (Piksel bulutlar, arcade ışıkları, minik uzay gemileri)
 */

class MoodEngine {
    constructor() {
        this.currentMood = 'cyberpunk'; // 'cyberpunk', 'cosmos', 'ghibli', 'retro'
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.ambientObjects = [];
        this.animationId = null;

        this.moodConfigs = {
            cyberpunk: {
                name: 'Cyberpunk Void',
                icon: '🏙️',
                bg: 'radial-gradient(ellipse at bottom, #111726 0%, #060810 100%)',
                primary: '#00F0FF',
                secondary: '#FF007F',
                accent: '#FFE600',
                glow: 'rgba(0, 240, 255, 0.45)'
            },
            cosmos: {
                name: 'Deep Cosmos',
                icon: '🌌',
                bg: 'radial-gradient(ellipse at bottom, #1a0b2e 0%, #04020a 100%)',
                primary: '#9D4EDD',
                secondary: '#00F0FF',
                accent: '#FFD700',
                glow: 'rgba(157, 78, 221, 0.5)'
            },
            ghibli: {
                name: 'Ghibli Doğa',
                icon: '🍃',
                bg: 'radial-gradient(ellipse at bottom, #102e1c 0%, #030d07 100%)',
                primary: '#52B788',
                secondary: '#F4A261',
                accent: '#FFE8D6',
                glow: 'rgba(82, 183, 136, 0.45)'
            },
            retro: {
                name: 'Retro 8-Bit',
                icon: '👾',
                bg: 'radial-gradient(ellipse at bottom, #2b1055 0%, #08020f 100%)',
                primary: '#FF3366',
                secondary: '#33FFCC',
                accent: '#FFFF33',
                glow: 'rgba(51, 255, 204, 0.5)'
            }
        };
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setMood(this.currentMood, false);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    resize() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    setMood(moodKey, notify = true) {
        if (!this.moodConfigs[moodKey]) return;
        this.currentMood = moodKey;
        const config = this.moodConfigs[moodKey];

        // CSS Değişkenlerini Güncelle
        const root = document.documentElement;
        root.style.setProperty('--theme-bg', config.bg);
        root.style.setProperty('--theme-primary', config.primary);
        root.style.setProperty('--theme-secondary', config.secondary);
        root.style.setProperty('--theme-accent', config.accent);
        root.style.setProperty('--theme-glow', config.glow);
        document.body.dataset.mood = moodKey;

        // UI Butonunu Güncelle
        const moodNameEl = document.getElementById('current-mood-name');
        if (moodNameEl) moodNameEl.textContent = config.name;

        // Parçacıkları ve Atmosfer Nesnelerini Yeniden Üret
        this.initMoodAtmosphere();

        // Ses Manzarasını Güncelle
        if (window.soundEngine && window.soundEngine.ambientActive) {
            window.soundEngine.setSoundscapeMood(moodKey);
        }

        if (notify && window.radarHUD) {
            window.radarHUD.addLogEntry(`Atmosfer Değişti: ${config.icon} ${config.name}`);
        }
    }

    initMoodAtmosphere() {
        this.particles = [];
        this.ambientObjects = [];

        if (this.currentMood === 'cyberpunk') {
            // Neon Yağmur Çizgileri & Fütüristik Dronlar
            for (let i = 0; i < 45; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    length: 15 + Math.random() * 25,
                    speed: 12 + Math.random() * 8,
                    color: Math.random() > 0.4 ? '#00F0FF' : '#FF007F',
                    alpha: 0.3 + Math.random() * 0.5
                });
            }
        } else if (this.currentMood === 'cosmos') {
            // Gezegenler & Nebula Tozları
            this.ambientObjects.push({
                type: 'planet',
                x: this.width * 0.85,
                y: this.height * 0.22,
                radius: 40,
                color1: '#6A0572',
                color2: '#AB83A1',
                ring: true,
                rot: 0
            });
            for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: 1 + Math.random() * 2.5,
                    alpha: 0.2 + Math.random() * 0.8,
                    twinkle: 0.02 + Math.random() * 0.04,
                    color: Math.random() > 0.5 ? '#9D4EDD' : '#00F0FF'
                });
            }
        } else if (this.currentMood === 'ghibli') {
            // Savrulan Kiraz Çiçeği Yaprakları & Ateş Böcekleri
            for (let i = 0; i < 35; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: 5 + Math.random() * 6,
                    speedY: 0.8 + Math.random() * 1.2,
                    speedX: 1.2 + Math.random() * 1.5,
                    rot: Math.random() * Math.PI * 2,
                    vrot: 0.02 + Math.random() * 0.03,
                    wobble: Math.random() * 10,
                    color: Math.random() > 0.3 ? '#FFB7B2' : '#52B788'
                });
            }
            // Ateş Böcekleri
            for (let i = 0; i < 20; i++) {
                this.ambientObjects.push({
                    type: 'firefly',
                    x: Math.random() * this.width,
                    y: this.height * 0.5 + Math.random() * (this.height * 0.4),
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    pulse: Math.random() * Math.PI,
                    color: '#E9D8A6'
                });
            }
        } else if (this.currentMood === 'retro') {
            // 8-Bit Piksel Bulutlar & Yıldızlar
            for (let i = 0; i < 40; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: 3,
                    speedX: 0.5 + Math.random() * 1.5,
                    color: ['#FF3366', '#33FFCC', '#FFFF33'][Math.floor(Math.random() * 3)]
                });
            }
        }
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.currentMood === 'cyberpunk') {
            this.renderCyberpunk();
        } else if (this.currentMood === 'cosmos') {
            this.renderCosmos();
        } else if (this.currentMood === 'ghibli') {
            this.renderGhibli();
        } else if (this.currentMood === 'retro') {
            this.renderRetro();
        }

        this.animationId = requestAnimationFrame(this.loop);
    }

    renderCyberpunk() {
        this.particles.forEach((p) => {
            p.y += p.speed;
            if (p.y > this.height) {
                p.y = -p.length;
                p.x = Math.random() * this.width;
            }

            this.ctx.save();
            this.ctx.strokeStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x - 2, p.y + p.length);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    renderCosmos() {
        // Gezegen Çizimi
        this.ambientObjects.forEach((obj) => {
            if (obj.type === 'planet') {
                this.ctx.save();
                this.ctx.translate(obj.x, obj.y);

                // Gezegen Gövdesi
                const grad = this.ctx.createRadialGradient(-10, -10, 5, 0, 0, obj.radius);
                grad.addColorStop(0, '#E0AAFF');
                grad.addColorStop(0.6, obj.color1);
                grad.addColorStop(1, '#10002B');

                this.ctx.fillStyle = grad;
                this.ctx.shadowBlur = 25;
                this.ctx.shadowColor = '#9D4EDD';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Halka
                if (obj.ring) {
                    this.ctx.strokeStyle = 'rgba(224, 170, 255, 0.4)';
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, obj.radius * 1.8, obj.radius * 0.35, Math.PI / 6, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        });

        // Yıldızlar
        this.particles.forEach((p) => {
            p.alpha += Math.sin(Date.now() * 0.003 * p.twinkle) * 0.02;
            const a = Math.max(0.1, Math.min(0.9, p.alpha));

            this.ctx.save();
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = a;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    renderGhibli() {
        // Yapraklar
        this.particles.forEach((p) => {
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.wobble) * 0.5;
            p.wobble += 0.03;
            p.rot += p.vrot;

            if (p.y > this.height + 20 || p.x > this.width + 20) {
                p.y = -10;
                p.x = Math.random() * this.width * 0.7;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rot);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = 0.75;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Ateş Böcekleri
        this.ambientObjects.forEach((f) => {
            if (f.type === 'firefly') {
                f.x += f.vx;
                f.y += f.vy;
                f.pulse += 0.04;

                if (f.x < 0 || f.x > this.width) f.vx *= -1;
                if (f.y < this.height * 0.4 || f.y > this.height) f.vy *= -1;

                const glow = (Math.sin(f.pulse) + 1) / 2;

                this.ctx.save();
                this.ctx.fillStyle = f.color;
                this.ctx.globalAlpha = 0.3 + glow * 0.7;
                this.ctx.shadowBlur = 12 * glow;
                this.ctx.shadowColor = '#FFEAA7';
                this.ctx.beginPath();
                this.ctx.arc(f.x, f.y, 2.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
    }

    renderRetro() {
        this.particles.forEach((p) => {
            p.x -= p.speedX;
            if (p.x < -10) p.x = this.width + 10;

            this.ctx.save();
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = p.color;
            // 8-bit piksel kareler
            this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
            this.ctx.restore();
        });
    }
}

window.moodEngine = new MoodEngine();
