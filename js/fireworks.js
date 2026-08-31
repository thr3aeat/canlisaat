/**
 * Canlı Saat - Gece Havai Fişek Simülasyonu
 * Çok kademeli patlamalar, duman/kıvılcım izleri ve ekran karartma ambiyansı.
 */

class FireworksEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.rockets = [];
        this.particles = [];
        this.active = false;
        this.dimOpacity = 0;
        this.targetDim = 0;
        this.timer = null;
        this.animationId = null;

        this.palette = [
            ['#FF007F', '#FF7597', '#FFD1DC'], // Pembe / Fuşya
            ['#00F0FF', '#70FFFF', '#E0FFFF'], // Neon Cyan
            ['#FFE600', '#FFF070', '#FFFFE0'], // Altın Sarısı
            ['#B000FF', '#D870FF', '#F5E0FF'], // Elektrik Moru
            ['#00FF66', '#80FFB2', '#E0FFE8'], // Zümrüt Yeşili
            ['#FF4D00', '#FF8533', '#FFD699']  // Ateş Turuncusu
        ];
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

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

    startShow(durationMs = 9000) {
        this.active = true;
        this.targetDim = 0.55;

        // Düzenli aralıklarla roket fırlat
        let elapsed = 0;
        const interval = setInterval(() => {
            if (!this.active) {
                clearInterval(interval);
                return;
            }
            this.launchRocket();
            if (Math.random() > 0.4) {
                setTimeout(() => this.launchRocket(), 300);
            }
            elapsed += 700;
            if (elapsed >= durationMs) {
                clearInterval(interval);
                this.stopShow();
            }
        }, 700);
    }

    stopShow() {
        this.targetDim = 0;
        setTimeout(() => {
            this.active = false;
        }, 3000);
    }

    launchRocket() {
        const startX = this.width * (0.15 + Math.random() * 0.7);
        const targetX = startX + (Math.random() - 0.5) * (this.width * 0.25);
        const targetY = this.height * (0.12 + Math.random() * 0.35);
        const speed = 13 + Math.random() * 5;
        const angle = Math.atan2(targetY - this.height, targetX - startX);
        const colorSet = this.palette[Math.floor(Math.random() * this.palette.length)];

        if (window.soundEngine) window.soundEngine.playFireworkRocket();

        this.rockets.push({
            x: startX,
            y: this.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            targetY: targetY,
            colorSet: colorSet,
            trail: []
        });
    }

    explode(x, y, colorSet) {
        if (window.soundEngine) window.soundEngine.playFireworkBoom();

        const particleCount = 85 + Math.floor(Math.random() * 45);
        const type = Math.random() > 0.4 ? 'sphere' : (Math.random() > 0.5 ? 'ring' : 'willow');

        for (let i = 0; i < particleCount; i++) {
            let vx, vy, speed;
            const angle = (Math.PI * 2 * i) / particleCount;

            if (type === 'sphere') {
                speed = 2 + Math.random() * 7;
                vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5;
                vy = Math.sin(angle) * speed + (Math.random() - 0.5) * 1.5;
            } else if (type === 'ring') {
                speed = 5.5 + Math.random() * 1.2;
                vx = Math.cos(angle) * speed;
                vy = Math.sin(angle) * speed;
            } else {
                // Willow (Salkım söğüt)
                speed = 1.5 + Math.random() * 5;
                vx = Math.cos(angle) * speed;
                vy = Math.sin(angle) * speed;
            }

            const color = colorSet[Math.floor(Math.random() * colorSet.length)];

            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                color: color,
                alpha: 1,
                decay: (type === 'willow' ? 0.012 : 0.018) + Math.random() * 0.01,
                gravity: type === 'willow' ? 0.09 : 0.06,
                drag: 0.965,
                size: 2.2 + Math.random() * 2,
                flicker: Math.random() > 0.5
            });
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Ekran Karartma Geçişi
        this.dimOpacity += (this.targetDim - this.dimOpacity) * 0.05;
        if (this.dimOpacity > 0.01) {
            this.ctx.fillStyle = `rgba(5, 5, 15, ${this.dimOpacity})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Roketleri Güncelle
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.trail.push({ x: r.x, y: r.y });
            if (r.trail.length > 7) r.trail.shift();

            r.x += r.vx;
            r.y += r.vy;
            r.vy += 0.05; // hafif yerçekimi

            // Roket İzi Çiz
            this.ctx.save();
            this.ctx.strokeStyle = r.colorSet[1];
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            for (let j = 0; j < r.trail.length; j++) {
                const pt = r.trail[j];
                if (j === 0) this.ctx.moveTo(pt.x, pt.y);
                else this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.stroke();

            // Roket Başı
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // Hedef Yüksekliğe Ulaşınca Patla
            if (r.y <= r.targetY || r.vy >= -0.5) {
                this.explode(r.x, r.y, r.colorSet);
                this.rockets.splice(i, 1);
            }
        }

        // Patlama Parçacıklarını Güncelle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= p.drag;
            p.vy = p.vy * p.drag + p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            const currentAlpha = p.flicker && Math.random() > 0.3 ? p.alpha * 0.4 : p.alpha;

            this.ctx.save();
            this.ctx.globalAlpha = currentAlpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        this.animationId = requestAnimationFrame(this.loop);
    }
}

window.fireworksEngine = new FireworksEngine();
