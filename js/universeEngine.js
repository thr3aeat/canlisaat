/**
 * Canlı Saat - The Infinite Metropolis (Bitmeyen Şehir İnşa Motoru)
 * Her saniye 1 blok koyulur, dakikada 1 bina biter, 24 saatte devasa bir siberpunk uygarlığı inşa edilir.
 * Kamera dinamik zoom-out ile büyüyen dünyayı gösterir; yerçekimi anomalilerinde bloklar havaya süzülür.
 */

class UniverseEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.buildings = [];
        this.flyingCars = [];
        this.energyParticles = [];
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.totalSeconds = 0;
        this.zeroGravity = false;
        this.gravityTimer = 0;
        this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
        this.activeTheme = 'cyber'; // 'cyber', 'aurora', 'golden'
        this.goldCoverRatio = 0; // Altın çağında zeminin altına kaplanma oranı

        this.palette = {
            cyber: ['#00F0FF', '#FF007F', '#7928CA', '#05D9E8', '#FFE600'],
            aurora: ['#00FF9D', '#60EFFF', '#7928CA', '#B000FF'],
            golden: ['#FFD700', '#FFA500', '#FF8C00', '#FFE4B5']
        };
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Fare etkileşimi
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const newX = e.clientX - rect.left;
            const newY = e.clientY - rect.top;
            this.mouse.vx = newX - this.mouse.x;
            this.mouse.vy = newY - this.mouse.y;
            this.mouse.x = newX;
            this.mouse.y = newY;
        });

        this.initCityGrid();
        this.spawnFlyingCars(6);

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
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

    initCityGrid() {
        this.buildings = [];
        const cols = Math.floor(window.innerWidth / 48) + 4;
        const baseGround = this.height * 0.88;

        for (let i = 0; i < cols; i++) {
            this.buildings.push({
                x: i * 46 - 20,
                width: 38 + (i % 3) * 6,
                maxHeight: 120 + ((i * 37) % 220),
                currentHeight: 8,
                targetHeight: 8,
                floors: 1,
                maxFloors: 4 + (i % 6),
                windows: [],
                color: this.palette.cyber[i % this.palette.cyber.length],
                neonColor: this.palette.cyber[(i + 2) % this.palette.cyber.length],
                antenna: i % 4 === 0,
                beacon: i % 5 === 0,
                floatOffset: { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0 }
            });
        }
    }

    // Her saniye çağrılır (App.js tick)
    onSecondTick(hours, minutes, seconds) {
        this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // 1. Yeni Düşen İnşa Bloğu Kıvılcımı
        const targetBldgIndex = (minutes + Math.floor(seconds / 15)) % this.buildings.length;
        const bldg = this.buildings[targetBldgIndex];

        if (bldg) {
            // Blok düşüşü
            this.spawnDropBlock(bldg.x + bldg.width / 2, bldg.currentHeight, bldg.neonColor);
            
            // Binanın büyümesi
            bldg.currentHeight = Math.min(bldg.maxHeight, bldg.currentHeight + 1.2);
            bldg.floors = Math.floor(bldg.currentHeight / 18);

            // Pencere ekle
            if (bldg.windows.length < bldg.floors * 3) {
                bldg.windows.push({
                    floor: bldg.floors,
                    slot: Math.floor(Math.random() * 3),
                    lit: Math.random() > 0.15,
                    color: Math.random() > 0.4 ? '#FFE600' : '#00F0FF'
                });
            }
        }

        // Gün içindeki ilerlemeye göre dinamik kamera mikro-zoom
        const progressOfDay = (hours * 60 + minutes) / 1440;
        this.targetZoom = 1.0 - progressOfDay * 0.22; // Gün sonunda %22 daha geniş açı
    }

    spawnDropBlock(x, currentH, color) {
        const groundY = this.height * 0.88;
        const startY = groundY - currentH - 70;
        const targetY = groundY - currentH;

        this.energyParticles.push({
            x: x + (Math.random() - 0.5) * 12,
            y: startY,
            targetY: targetY,
            vy: 4 + Math.random() * 3,
            color: color,
            alpha: 1,
            size: 4 + Math.random() * 3
        });
    }

    spawnFlyingCars(count = 5) {
        this.flyingCars = [];
        for (let i = 0; i < count; i++) {
            this.flyingCars.push({
                x: Math.random() * this.width,
                y: this.height * (0.35 + Math.random() * 0.4),
                speed: 1.5 + Math.random() * 2.5,
                direction: Math.random() > 0.5 ? 1 : -1,
                color: Math.random() > 0.5 ? '#00F0FF' : '#FF007F',
                trail: []
            });
        }
    }

    // Yerçekimsiz Dalgalanmayı Başlat / Durdur
    setZeroGravity(enabled) {
        this.zeroGravity = enabled;
        if (enabled) {
            this.buildings.forEach(b => {
                b.floatOffset.vy = -(1.5 + Math.random() * 2.5);
                b.floatOffset.vx = (Math.random() - 0.5) * 2;
                b.floatOffset.vrot = (Math.random() - 0.5) * 0.04;
            });
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Kamera Zoom İnterpolasyonu
        this.zoom += (this.targetZoom - this.zoom) * 0.02;

        this.ctx.save();
        // Merkezden zoom-out
        this.ctx.translate(this.width / 2, this.height * 0.88);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.width / 2, -this.height * 0.88);

        const groundY = this.height * 0.88;

        // 1. ZEMİN VE IZGARA (Cyber Grid / Golden Floor)
        this.drawGround(groundY);

        // 2. BİNALAR VE GÖKDELENLER
        this.drawBuildings(groundY);

        // 3. UÇAN SİBER ARAÇLAR (Flying Cars)
        this.drawFlyingCars();

        // 4. İNŞAAT ENERJİ PARÇACIKLARI
        this.drawEnergyParticles();

        this.ctx.restore();

        // Fare hızını söndür
        this.mouse.vx *= 0.8;
        this.mouse.vy *= 0.8;

        requestAnimationFrame(this.loop);
    }

    drawGround(groundY) {
        // Zemin Arka Planı
        this.ctx.fillStyle = '#050711';
        this.ctx.fillRect(0, groundY, this.width, this.height - groundY);

        // Zemin Çizgisi (Neon Glow)
        this.ctx.save();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.goldCoverRatio > 0.3 ? '#FFD700' : '#00F0FF';
        this.ctx.strokeStyle = this.goldCoverRatio > 0.3 ? '#FFD700' : '#00F0FF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.width, groundY);
        this.ctx.stroke();

        // Perspektif Siber Izgara Çizgileri
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, groundY);
            this.ctx.lineTo(x + (x - this.width / 2) * 0.6, this.height);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawBuildings(groundY) {
        this.buildings.forEach((b) => {
            this.ctx.save();

            // Yerçekimsiz Dalgalanma Fiziği
            if (this.zeroGravity) {
                b.floatOffset.y += b.floatOffset.vy;
                b.floatOffset.x += b.floatOffset.vx;
                b.floatOffset.rot += b.floatOffset.vrot;

                // Havada salınım sınırı
                if (b.floatOffset.y < -160 || b.floatOffset.y > 20) {
                    b.floatOffset.vy *= -0.8;
                }

                // Fareyle binalara çarpıp itebilme
                const centerBx = b.x + b.width / 2 + b.floatOffset.x;
                const centerBy = groundY - b.currentHeight / 2 + b.floatOffset.y;
                const dx = centerBx - this.mouse.x;
                const dy = centerBy - this.mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 100) {
                    const force = (1 - dist / 100) * 8;
                    b.floatOffset.vx += (dx / dist) * force;
                    b.floatOffset.vy += (dy / dist) * force;
                }

                b.floatOffset.vx *= 0.96;
                b.floatOffset.vy *= 0.96;
            } else {
                // Yerçekimi normale dönünce yumuşakça oturma
                b.floatOffset.y += (0 - b.floatOffset.y) * 0.08;
                b.floatOffset.x += (0 - b.floatOffset.x) * 0.08;
                b.floatOffset.rot += (0 - b.floatOffset.rot) * 0.08;
            }

            const renderX = b.x + b.floatOffset.x;
            const renderY = groundY - b.currentHeight + b.floatOffset.y;

            this.ctx.translate(renderX + b.width / 2, renderY + b.currentHeight / 2);
            this.ctx.rotate(b.floatOffset.rot);
            this.ctx.translate(-(renderX + b.width / 2), -(renderY + b.currentHeight / 2));

            // Bina Gövdesi
            const grad = this.ctx.createLinearGradient(renderX, renderY, renderX + b.width, renderY);
            grad.addColorStop(0, '#0a0f24');
            grad.addColorStop(0.5, '#131c38');
            grad.addColorStop(1, '#080c1e');

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(renderX, renderY, b.width, b.currentHeight);

            // Bina Kenar Neonu
            this.ctx.strokeStyle = b.neonColor;
            this.ctx.lineWidth = 1.2;
            this.ctx.strokeRect(renderX, renderY, b.width, b.currentHeight);

            // Çatı Anteni / Fener
            if (b.antenna && b.currentHeight > 30) {
                this.ctx.strokeStyle = b.neonColor;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(renderX + b.width / 2, renderY);
                this.ctx.lineTo(renderX + b.width / 2, renderY - 14);
                this.ctx.stroke();

                // Yanıp sönen kırmızı/neon uç ışığı
                if (Math.sin(Date.now() * 0.005 + b.x) > 0) {
                    this.ctx.fillStyle = '#FF0055';
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = '#FF0055';
                    this.ctx.beginPath();
                    this.ctx.arc(renderX + b.width / 2, renderY - 14, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            // Pencereler
            b.windows.forEach((w) => {
                if (!w.lit) return;
                const winY = renderY + b.currentHeight - w.floor * 18 + 4;
                const winX = renderX + 6 + w.slot * 9;
                if (winY >= renderY && winY < renderY + b.currentHeight - 4) {
                    this.ctx.fillStyle = w.color;
                    this.ctx.shadowBlur = 4;
                    this.ctx.shadowColor = w.color;
                    this.ctx.fillRect(winX, winY, 5, 8);
                }
            });

            this.ctx.restore();
        });
    }

    drawFlyingCars() {
        this.flyingCars.forEach((car) => {
            car.x += car.speed * car.direction;
            if (car.direction === 1 && car.x > this.width + 40) car.x = -40;
            if (car.direction === -1 && car.x < -40) car.x = this.width + 40;

            // Işık İzi (Headlight/Taillight Trail)
            car.trail.push({ x: car.x, y: car.y });
            if (car.trail.length > 8) car.trail.shift();

            this.ctx.save();
            this.ctx.strokeStyle = car.color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = car.color;
            this.ctx.beginPath();
            for (let i = 0; i < car.trail.length; i++) {
                const pt = car.trail[i];
                if (i === 0) this.ctx.moveTo(pt.x, pt.y);
                else this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.stroke();

            // Araç Gövdesi
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(car.x - 3, car.y - 1.5, 6, 3);
            this.ctx.restore();
        });
    }

    drawEnergyParticles() {
        for (let i = this.energyParticles.length - 1; i >= 0; i--) {
            const p = this.energyParticles[i];
            p.y += p.vy;

            if (p.y >= p.targetY) {
                // Yere/Binaya çarpıp yerleşti
                this.energyParticles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

window.universeEngine = new UniverseEngine();
