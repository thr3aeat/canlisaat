/**
 * Canlı Saat - Dijital Guguk Kuşu Modülü
 * Saat başlarında kapakları açılıp fırlayan, kanat çırparak saat sayısı kadar öten sevimli kuş mekanizması.
 */

class CuckooClock {
    constructor() {
        this.container = null;
        this.birdElement = null;
        this.leftDoor = null;
        this.rightDoor = null;
        this.speechBubble = null;
        this.isBusy = false;
    }

    init() {
        this.container = document.getElementById('cuckoo-house');
        this.birdElement = document.getElementById('cuckoo-bird');
        this.leftDoor = document.getElementById('cuckoo-door-left');
        this.rightDoor = document.getElementById('cuckoo-door-right');
        this.speechBubble = document.getElementById('cuckoo-bubble');
    }

    /**
     * Guguk kuşunu fırlat ve saat sayısı kadar öttür
     * @param {number} count - Kaç kez öteceği (örn: saat 3 ise 3, saat 0/12 ise 12)
     */
    async trigger(count = 1) {
        if (this.isBusy) return;
        this.isBusy = true;

        if (!this.container) this.init();
        if (!this.container || !this.birdElement) {
            this.isBusy = false;
            return;
        }

        // 12'lik saat sistemine dönüştür (0 ise 12)
        const times = count % 12 === 0 ? 12 : count % 12;
        // Test amaçlı çok uzun sürmemesi için max 12 ile sınırla
        const chirpCount = Math.min(times, 12);

        // Kapıları Aç
        this.container.classList.add('open');
        await this._delay(400);

        // Kuşu İleri Sür
        this.birdElement.classList.add('out');
        await this._delay(400);

        // Her saat için ötüş döngüsü
        for (let i = 0; i < chirpCount; i++) {
            if (this.speechBubble) {
                this.speechBubble.textContent = `GUGUK! ⏰ (${i + 1}/${chirpCount})`;
                this.speechBubble.classList.add('show');
            }

            // Kanat çırp ve baş salla
            this.birdElement.classList.add('singing');
            if (window.soundEngine) {
                window.soundEngine.playCuckoo();
            }

            await this._delay(750);
            this.birdElement.classList.remove('singing');
            if (this.speechBubble) this.speechBubble.classList.remove('show');
            await this._delay(250);
        }

        // Kuşu Geri Çek
        this.birdElement.classList.remove('out');
        await this._delay(400);

        // Kapıları Kapat
        this.container.classList.remove('open');
        await this._delay(300);

        this.isBusy = false;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.cuckooClock = new CuckooClock();
