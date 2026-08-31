/**
 * Canlı Saat - Event Radar & Timeline HUD
 * "Sonraki potansiyel anomali: ~X dk sonra" radar tarayıcısı ve
 * Gerçekleşen olayların zaman damgalı log günlüğü.
 */

class RadarHUD {
    constructor() {
        this.container = null;
        this.radarText = null;
        this.logList = null;
        this.nextAnomalyTimer = null;
        this.nextAnomalyMinutes = 4;
        this.logs = [];
        this.isExpanded = false;
    }

    init() {
        this.container = document.getElementById('radar-hud');
        this.radarText = document.getElementById('radar-anomaly-time');
        this.logList = document.getElementById('radar-log-list');

        const toggleBtn = document.getElementById('btn-toggle-radar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleExpand());
        }

        this.startAnomalyScanner();
    }

    startAnomalyScanner() {
        this.nextAnomalyMinutes = 3 + Math.floor(Math.random() * 4);
        this.updateRadarText();

        setInterval(() => {
            if (this.nextAnomalyMinutes > 1) {
                this.nextAnomalyMinutes--;
                this.updateRadarText();
            } else {
                this.nextAnomalyMinutes = '< 1';
                this.updateRadarText();
            }
        }, 60000);
    }

    updateRadarText() {
        if (this.radarText) {
            this.radarText.textContent = `~${this.nextAnomalyMinutes} dk`;
        }
    }

    resetNextAnomalyTimer() {
        this.nextAnomalyMinutes = 3 + Math.floor(Math.random() * 5);
        this.updateRadarText();
    }

    addLogEntry(title, isRare = false) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const entry = {
            time: timeStr,
            title: title,
            isRare: isRare
        };

        this.logs.unshift(entry);
        if (this.logs.length > 25) this.logs.pop();

        this.renderLogs();
        this.resetNextAnomalyTimer();

        // Bildirim parıltısı
        if (this.container) {
            this.container.classList.add('radar-pulse');
            setTimeout(() => this.container.classList.remove('radar-pulse'), 1500);
        }
    }

    renderLogs() {
        if (!this.logList) return;
        this.logList.innerHTML = '';

        if (this.logs.length === 0) {
            this.logList.innerHTML = '<div class="radar-empty">Henüz kaydedilmiş anomali yok.</div>';
            return;
        }

        this.logs.forEach((log) => {
            const item = document.createElement('div');
            item.className = `radar-log-item ${log.isRare ? 'rare-item' : ''}`;
            item.innerHTML = `
                <span class="log-time">${log.time}</span>
                <span class="log-title">${log.title}</span>
                ${log.isRare ? '<span class="rare-badge">NADİR</span>' : ''}
            `;
            this.logList.appendChild(item);
        });

        const countBadge = document.getElementById('radar-log-count');
        if (countBadge) countBadge.textContent = this.logs.length;
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        if (this.container) {
            this.container.classList.toggle('expanded', this.isExpanded);
        }
    }
}

window.radarHUD = new RadarHUD();
