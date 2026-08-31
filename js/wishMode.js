/**
 * Canlı Saat - 11:11 / 22:22 Dilek Modu
 * Kayan yıldızlar, parıldayan gökyüzü ve interaktif dilek gönderme modülü.
 */

class WishMode {
    constructor() {
        this.modal = null;
        this.wishInput = null;
        this.skyCanvas = null;
        this.skyCtx = null;
        this.shootingStars = [];
        this.stars = [];
        this.isActive = false;
        this.animationId = null;
    }

    init() {
        this.modal = document.getElementById('wish-modal');
        this.wishInput = document.getElementById('wish-text');
        this.skyCanvas = document.getElementById('wish-canvas');

        if (this.skyCanvas) {
            this.skyCtx = this.skyCanvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.initStars();
            this.loop = this.loop.bind(this);
            this.animationId = requestAnimationFrame(this.loop);
        }

        // Form Gönderme
        const sendBtn = document.getElementById('send-wish-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendWish());
        }

        const closeBtn = document.getElementById('close-wish-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
    }

    resize() {
        if (!this.skyCanvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.skyCanvas.width = this.width * dpr;
        this.skyCanvas.height = this.height * dpr;
        this.skyCtx.scale(dpr, dpr);
    }

    initStars() {
        this.stars = [];
        const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 0.8 + Math.random() * 1.8,
                alpha: 0.2 + Math.random() * 0.7,
                twinkleSpeed: 0.02 + Math.random() * 0.03
            });
        }
    }

    checkSymmetricalTime(h, m) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const wishTimes = ['11:11', '22:22', '00:00', '12:34', '01:01', '02:02', '03:03', '04:04', '05:05', '10:10', '12:12', '13:13', '14:14', '15:15', '16:16', '17:17', '18:18', '19:19', '20:20', '21:21', '23:23'];

        if (wishTimes.includes(timeStr)) {
            this.triggerWishMode(timeStr);
        }
    }

    triggerWishMode(customTitle = '11:11') {
        if (window.soundEngine) window.soundEngine.playWishChime();

        // Kayan yıldızlar başlat
        for (let i = 0; i < 6; i++) {
            setTimeout(() => this.spawnShootingStar(), i * 700);
        }

        const titleEl = document.getElementById('wish-modal-title');
        if (titleEl) {
            titleEl.textContent = `🌟 ${customTitle} - Bir Dilek Tut! 🌟`;
        }

        if (this.modal) {
            this.modal.classList.add('active');
            if (this.wishInput) {
                this.wishInput.value = '';
                this.wishInput.focus();
            }
        }
    }

    hideModal() {
        if (this.modal) this.modal.classList.remove('active');
    }

    sendWish() {
        const wish = this.wishInput ? this.wishInput.value.trim() : '';
        if (!wish) return;

        if (window.soundEngine) window.soundEngine.playWishChime();

        // Gökyüzüne yükselen parlayan yıldız dilek animasyonu
        this.spawnFloatingWish(wish);
        this.hideModal();

        // Bildirim göster
        const toast = document.getElementById('toast-msg');
        if (toast) {
            toast.textContent = '✨ Dileğin evrene gönderildi! Gerçekleşsin... ✨';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4000);
        }
    }

    spawnShootingStar() {
        const startX = Math.random() * (this.width * 0.8);
        const startY = Math.random() * (this.height * 0.4);
        const length = 120 + Math.random() * 160;
        const speed = 16 + Math.random() * 10;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;

        this.shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: length,
            life: 1.0,
            decay: 0.02
        });
    }

    spawnFloatingWish(text) {
        const floatingEl = document.createElement('div');
        floatingEl.className = 'floating-wish-text';
        floatingEl.textContent = `✨ "${text}" ✨`;
        floatingEl.style.left = `${window.innerWidth / 2}px`;
        floatingEl.style.top = `${window.innerHeight * 0.75}px`;

        document.body.appendChild(floatingEl);

        setTimeout(() => {
            floatingEl.remove();
        }, 4000);
    }

    loop() {
        this.skyCtx.clearRect(0, 0, this.width, this.height);

        // Arka plan yıldızları (Twinkle)
        this.skyCtx.fillStyle = '#FFFFFF';
        for (let s of this.stars) {
            s.alpha += Math.sin(Date.now() * 0.002 * s.twinkleSpeed) * 0.02;
            const a = Math.max(0.1, Math.min(0.9, s.alpha));
            this.skyCtx.globalAlpha = a;
            this.skyCtx.beginPath();
            this.skyCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.skyCtx.fill();
        }

        // Kayan Yıldızlar
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life -= ss.decay;

            if (ss.life <= 0 || ss.x > this.width || ss.y > this.height) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            const tailX = ss.x - (ss.vx / 10) * ss.length * 0.15;
            const tailY = ss.y - (ss.vy / 10) * ss.length * 0.15;

            const grad = this.skyCtx.createLinearGradient(ss.x, ss.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
            grad.addColorStop(0.3, `rgba(255, 215, 0, ${ss.life * 0.8})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.skyCtx.save();
            this.skyCtx.strokeStyle = grad;
            this.skyCtx.lineWidth = 2.5;
            this.skyCtx.shadowBlur = 12;
            this.skyCtx.shadowColor = '#FFD700';
            this.skyCtx.beginPath();
            this.skyCtx.moveTo(ss.x, ss.y);
            this.skyCtx.lineTo(tailX, tailY);
            this.skyCtx.stroke();
            this.skyCtx.restore();
        }

        this.animationId = requestAnimationFrame(this.loop);
    }
}

window.wishMode = new WishMode();
