/**
 * Canlı Saat - Fizik ve Partikül Motoru (Konfeti & Balonlar)
 * 3D dönüşlü, yerçekimli, hava dirençli ve fare itme kuvvetli konfetiler;
 * Tıklanabilir, süzülen ve patlayan fiziksel balonlar.
 */

class PhysicsEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.confetti = [];
        this.balloons = [];
        this.particles = [];
        this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };
        this.isActive = true;
        this.animationFrameId = null;

        this.colors = [
            '#FF2A6D', '#05D9E8', '#005670', '#01012B', '#D1F7FF',
            '#FFB800', '#FF3864', '#2DE2E6', '#F6019D', '#7928CA',
            '#00FF87', '#60EFFF', '#FF71CE', '#01CDFE', '#05FFA1'
        ];
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        
        // Fare hareketi ve itme kuvveti
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const newX = e.clientX - rect.left;
            const newY = e.clientY - rect.top;
            this.mouse.vx = newX - this.mouse.x;
            this.mouse.vy = newY - this.mouse.y;
            this.mouse.x = newX;
            this.mouse.y = newY;
        });

        // Balonlara tıklama kontrolü
        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            this.checkBalloonClick(clickX, clickY);
        });

        this.loop = this.loop.bind(this);
        this.animationFrameId = requestAnimationFrame(this.loop);
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

    // --- 1. KONFETİ SİSTEMİ ---
    launchConfetti(count = 160) {
        if (window.soundEngine) window.soundEngine.playConfettiCannon();

        for (let i = 0; i < count; i++) {
            // Sol ve sağ köşelerden veya merkezden patlama
            const fromLeft = Math.random() < 0.5;
            const originX = fromLeft ? Math.random() * (this.width * 0.3) : this.width * 0.7 + Math.random() * (this.width * 0.3);
            const originY = this.height * (0.4 + Math.random() * 0.4);

            const angle = fromLeft 
                ? -Math.PI / 4 + (Math.random() - 0.5) * 0.8
                : -3 * Math.PI / 4 + (Math.random() - 0.5) * 0.8;

            const speed = 12 + Math.random() * 18;

            this.confetti.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 6,
                size: 8 + Math.random() * 8,
                length: 12 + Math.random() * 12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.25,
                wobble: Math.random() * 10,
                wobbleSpeed: 0.08 + Math.random() * 0.08,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                opacity: 1,
                drag: 0.95 + Math.random() * 0.03,
                gravity: 0.28 + Math.random() * 0.15,
                shape: Math.random() > 0.3 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'ribbon'),
                life: 1.0,
                decay: 0.003 + Math.random() * 0.003
            });
        }
    }

    // --- 2. BALON SİSTEMİ ---
    spawnBalloons(count = 12) {
        for (let i = 0; i < count; i++) {
            const radius = 28 + Math.random() * 20;
            const x = Math.random() * (this.width - radius * 2) + radius;
            const y = this.height + radius + (i * 60) + Math.random() * 100;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];

            this.balloons.push({
                id: Math.random(),
                x: x,
                y: y,
                targetY: -radius * 2,
                radius: radius,
                color: color,
                speedY: 1.8 + Math.random() * 1.5,
                wobble: Math.random() * 10,
                wobbleSpeed: 0.03 + Math.random() * 0.02,
                wobbleAmp: 1.5 + Math.random() * 2,
                stringLength: 35 + Math.random() * 15,
                popped: false,
                scale: 1,
                pulse: Math.random() * Math.PI
            });
        }
    }

    checkBalloonClick(clickX, clickY) {
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            const dist = Math.hypot(clickX - b.x, clickY - b.y);
            // Balon oval olduğundan toleranslı yarıçap
            if (dist <= b.radius * 1.3) {
                this.popBalloon(b, i);
                break;
            }
        }
    }

    popBalloon(balloon, index) {
        if (window.soundEngine) window.soundEngine.playBalloonPop();

        // Patlama kıvılcımları
        const sparkCount = 28;
        for (let j = 0; j < sparkCount; j++) {
            const angle = (Math.PI * 2 * j) / sparkCount + (Math.random() - 0.5);
            const speed = 4 + Math.random() * 8;
            this.particles.push({
                x: balloon.x,
                y: balloon.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: balloon.color,
                alpha: 1,
                decay: 0.025 + Math.random() * 0.02,
                gravity: 0.2
            });
        }

        // Tıklanan balonu listeden çıkar
        this.balloons.splice(index, 1);
    }

    // --- 3. GÜNCELLEME VE ÇİZİM DÖNGÜSÜ ---
    loop() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // A. Konfeti Güncelle & Çiz
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];

            // Fare itme kuvveti
            const dx = c.x - this.mouse.x;
            const dy = c.y - this.mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 140) {
                const force = (1 - dist / 140) * 12;
                c.vx += (dx / dist) * force + this.mouse.vx * 0.1;
                c.vy += (dy / dist) * force + this.mouse.vy * 0.1;
            }

            // Fizik hareketleri
            c.vx *= c.drag;
            c.vy = c.vy * c.drag + c.gravity;
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.rotationSpeed;
            c.wobble += c.wobbleSpeed;
            c.life -= c.decay;

            if (c.y > this.height + 40 || c.life <= 0) {
                this.confetti.splice(i, 1);
                continue;
            }

            // Çizim (3D efekt için Math.cos(c.wobble) ile genişlik büzme)
            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate(c.rotation);
            this.ctx.globalAlpha = Math.max(0, c.life);
            this.ctx.fillStyle = c.color;

            const scaleX = Math.cos(c.wobble);

            if (c.shape === 'rect') {
                this.ctx.fillRect(-c.size / 2 * scaleX, -c.length / 2, c.size * scaleX, c.length);
            } else if (c.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, c.size * Math.abs(scaleX), c.size, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Şerit (Ribbon)
                this.ctx.beginPath();
                this.ctx.moveTo(-c.size * scaleX, -c.length / 2);
                this.ctx.quadraticCurveTo(c.size * scaleX, 0, -c.size * scaleX, c.length / 2);
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = c.color;
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        // B. Balonlar Güncelle & Çiz
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            b.y -= b.speedY;
            b.wobble += b.wobbleSpeed;
            b.x += Math.sin(b.wobble) * b.wobbleAmp;

            if (b.y < -b.radius * 3) {
                this.balloons.splice(i, 1);
                continue;
            }

            this.drawBalloon(b);
        }

        // C. Parçacıklar (Patlama Kıvılcımları)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Fare hızını söndür
        this.mouse.vx *= 0.8;
        this.mouse.vy *= 0.8;

        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    drawBalloon(b) {
        this.ctx.save();
        this.ctx.translate(b.x, b.y);

        // Balon İpi (Sallantılı ip eğrisi)
        this.ctx.beginPath();
        this.ctx.moveTo(0, b.radius * 1.25);
        const cp1x = Math.sin(b.wobble * 2) * 8;
        const cp1y = b.radius * 1.25 + b.stringLength * 0.5;
        const endX = Math.sin(b.wobble * 2) * 4;
        const endY = b.radius * 1.25 + b.stringLength;
        this.ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Balon Gövdesi (Oval)
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, b.radius * 0.88, b.radius * 1.15, 0, 0, Math.PI * 2);

        // Radyal degrade (3D parlaklık)
        const grad = this.ctx.createRadialGradient(
            -b.radius * 0.3, -b.radius * 0.35, b.radius * 0.1,
            0, 0, b.radius * 1.2
        );
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, b.color);
        grad.addColorStop(1, '#00000088');

        this.ctx.fillStyle = grad;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = b.color;
        this.ctx.fill();

        // Balon Düğümü (Alt kısım)
        this.ctx.beginPath();
        this.ctx.moveTo(-4, b.radius * 1.15);
        this.ctx.lineTo(4, b.radius * 1.15);
        this.ctx.lineTo(0, b.radius * 1.25);
        this.ctx.closePath();
        this.ctx.fillStyle = b.color;
        this.ctx.fill();

        // Parlak yansıma çizgisi
        this.ctx.beginPath();
        this.ctx.ellipse(-b.radius * 0.4, -b.radius * 0.4, b.radius * 0.25, b.radius * 0.12, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();

        this.ctx.restore();
    }
}

window.physicsEngine = new PhysicsEngine();
