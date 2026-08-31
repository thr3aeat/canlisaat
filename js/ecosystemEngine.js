/**
 * Canlı Saat - Canlı Ekosistem & Sinematik Olaylar Motoru (Ecosystem & Cosmic Events)
 * 1. Göç Eden Sürüler (Kuş sürüsü, deniz anaları, neon kelebekler)
 * 2. Mevsimsel Rüzgarlar (Sakura yaprakları, sonbahar yaprakları)
 * 3. Gece Ateş Böceği Kümesi (Saati aydınlatan sürü)
 * 4. Matrix / Glitch Dalgası (Arka plan kod yağmuru)
 * 5. 59. Saniye Sonar Şok Dalgası
 * 6. Gerçek Zamanlı Günışığı Gradyanı (Şafak, Gün, Alacakaranlık, Gece)
 */

class EcosystemEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.birds = [];
        this.jellyfish = [];
        this.butterflies = [];
        this.leaves = [];
        this.sonarWaves = [];
        this.matrixRain = [];
        this.matrixActive = false;
        this.animationId = null;
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initMatrixRain();
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
        this.initMatrixRain();
    }

    initMatrixRain() {
        const columns = Math.floor(this.width / 18);
        this.matrixRain = [];
        const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
        for (let i = 0; i < columns; i++) {
            this.matrixRain.push({
                x: i * 18,
                y: Math.random() * -500,
                speed: 6 + Math.random() * 8,
                chars: chars,
                length: 12 + Math.floor(Math.random() * 16)
            });
        }
    }

    // 1. GÖÇ EDEN KUŞ SÜRÜSÜ
    spawnBirdFlock() {
        const count = 12 + Math.floor(Math.random() * 8);
        const startX = -100;
        const startY = this.height * (0.15 + Math.random() * 0.35);
        const leaderSpeed = 4.5 + Math.random() * 2;

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / 2);
            const side = i % 2 === 0 ? 1 : -1;
            this.birds.push({
                x: startX - row * 30 + (Math.random() - 0.5) * 10,
                y: startY + row * 20 * side + (Math.random() - 0.5) * 10,
                vx: leaderSpeed,
                vy: (Math.random() - 0.5) * 0.6,
                wingWing: Math.random() * Math.PI,
                wingSpeed: 0.18 + Math.random() * 0.05,
                size: 8 + Math.random() * 4,
                alpha: 0.8
            });
        }
    }

    // 2. SÜZÜLEN ŞEFFAF DENİZ ANALARI (COSMIC JELLYFISH)
    spawnJellyfishSwarm() {
        for (let i = 0; i < 6; i++) {
            this.jellyfish.push({
                x: Math.random() * this.width,
                y: this.height + 60 + i * 40,
                radius: 20 + Math.random() * 15,
                vy: -(1.2 + Math.random() * 1.0),
                pulse: Math.random() * Math.PI,
                color: Math.random() > 0.5 ? '#00F0FF' : '#E0AAFF',
                tentacles: 5 + Math.floor(Math.random() * 3)
            });
        }
    }

    // 3. MEVSİMSEL RÜZGARLAR (SAKURA & SONBAHAR YAPRAKLARI)
    spawnWindGust(type = 'sakura') {
        const count = 25 + Math.floor(Math.random() * 15);
        for (let i = 0; i < count; i++) {
            this.leaves.push({
                x: -20 - Math.random() * 100,
                y: Math.random() * (this.height * 0.7),
                vx: 5 + Math.random() * 6,
                vy: 1.5 + Math.random() * 2.5,
                rot: Math.random() * Math.PI * 2,
                vrot: 0.05 + Math.random() * 0.05,
                size: 8 + Math.random() * 6,
                color: type === 'sakura' ? '#FFB7B2' : '#E07A5F',
                wobble: Math.random() * 10
            });
        }
    }

    // 4. 59. SANİYE SONAR ŞOK DALGASI
    triggerSonarWave() {
        const clockCard = document.getElementById('clock-card');
        const rect = clockCard ? clockCard.getBoundingClientRect() : { left: this.width / 2, top: this.height / 2, width: 0, height: 0 };
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        this.sonarWaves.push({
            cx: cx,
            cy: cy,
            radius: 20,
            maxRadius: Math.max(this.width, this.height) * 0.8,
            speed: 16,
            alpha: 0.9,
            color: '#00F0FF'
        });
    }

    // 5. MATRIX GLITCH DALGASI (5 Saniye)
    triggerMatrixGlitch(durationMs = 5000) {
        this.matrixActive = true;
        this.initMatrixRain();
        setTimeout(() => {
            this.matrixActive = false;
        }, durationMs);
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // A. Matrix Glitch Dalgası
        if (this.matrixActive) {
            this.drawMatrixRain();
        }

        // B. Sonar Şok Dalgaları
        this.drawSonarWaves();

        // C. Kuş Sürüsü
        this.drawBirds();

        // D. Deniz Anaları
        this.drawJellyfish();

        // E. Savrulan Yapraklar
        this.drawLeaves();

        this.animationId = requestAnimationFrame(this.loop);
    }

    drawBirds() {
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const b = this.birds[i];
            b.x += b.vx;
            b.y += b.vy;
            b.wingWing += b.wingSpeed;

            if (b.x > this.width + 120) {
                this.birds.splice(i, 1);
                continue;
            }

            const wingY = Math.sin(b.wingWing) * (b.size * 0.6);

            this.ctx.save();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = b.alpha;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = '#00F0FF';
            this.ctx.beginPath();
            // Kanat V çizimi
            this.ctx.moveTo(b.x - b.size, b.y + wingY);
            this.ctx.quadraticCurveTo(b.x - b.size * 0.5, b.y - wingY, b.x, b.y);
            this.ctx.quadraticCurveTo(b.x + b.size * 0.5, b.y - wingY, b.x + b.size, b.y + wingY);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawJellyfish() {
        for (let i = this.jellyfish.length - 1; i >= 0; i--) {
            const j = this.jellyfish[i];
            j.y += j.vy;
            j.pulse += 0.04;
            j.x += Math.sin(j.pulse) * 0.8;

            if (j.y < -j.radius * 3) {
                this.jellyfish.splice(i, 1);
                continue;
            }

            const squash = Math.sin(j.pulse) * 0.2;

            this.ctx.save();
            this.ctx.translate(j.x, j.y);
            this.ctx.globalAlpha = 0.55;
            this.ctx.fillStyle = j.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = j.color;

            // Şapka
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, j.radius * (1 - squash), j.radius * (0.7 + squash), 0, Math.PI, 0);
            this.ctx.fill();

            // Dokunaçlar (Tentacles)
            this.ctx.strokeStyle = j.color;
            this.ctx.lineWidth = 1.2;
            for (let t = 0; t < j.tentacles; t++) {
                const offX = ((t - (j.tentacles - 1) / 2) * (j.radius * 1.5)) / j.tentacles;
                this.ctx.beginPath();
                this.ctx.moveTo(offX, 0);
                this.ctx.quadraticCurveTo(offX + Math.sin(j.pulse * 2 + t) * 6, j.radius * 0.8, offX, j.radius * 1.6);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }
    }

    drawLeaves() {
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            const l = this.leaves[i];
            l.x += l.vx;
            l.y += l.vy;
            l.rot += l.vrot;
            l.wobble += 0.04;
            l.y += Math.sin(l.wobble) * 0.6;

            if (l.x > this.width + 30 || l.y > this.height + 30) {
                this.leaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(l.x, l.y);
            this.ctx.rotate(l.rot);
            this.ctx.fillStyle = l.color;
            this.ctx.globalAlpha = 0.75;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, l.size, l.size * 0.4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawSonarWaves() {
        for (let i = this.sonarWaves.length - 1; i >= 0; i--) {
            const w = this.sonarWaves[i];
            w.radius += w.speed;
            w.alpha *= 0.95;

            if (w.radius >= w.maxRadius || w.alpha <= 0.01) {
                this.sonarWaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.strokeStyle = w.color;
            this.ctx.lineWidth = 2.5;
            this.ctx.globalAlpha = w.alpha;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = w.color;
            this.ctx.beginPath();
            this.ctx.arc(w.cx, w.cy, w.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawMatrixRain() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 255, 100, 0.9)';
        this.ctx.font = '14px monospace';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#00FF66';

        this.matrixRain.forEach((col) => {
            col.y += col.speed;
            if (col.y > this.height + 200) {
                col.y = -100;
            }

            for (let j = 0; j < col.length; j++) {
                const char = col.chars[Math.floor(Math.random() * col.chars.length)];
                const charY = col.y - j * 16;
                const alpha = Math.max(0, 1 - j / col.length);
                this.ctx.globalAlpha = alpha * 0.7;
                this.ctx.fillText(char, col.x, charY);
            }
        });
        this.ctx.restore();
    }
}

window.ecosystemEngine = new EcosystemEngine();
