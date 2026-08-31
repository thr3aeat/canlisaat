/**
 * Canlı Saat - Mini Karakterler Geçit Töreni (Bando & Temizlik Ekibi)
 * Saat başlarında ekranın altından yürüyen pikselli bando takımı ve konfeti süpüren minik işçiler.
 */

class CharacterParade {
    constructor() {
        this.trackElement = null;
        this.isParading = false;
    }

    init() {
        this.trackElement = document.getElementById('character-track');
    }

    startParade() {
        if (this.isParading) return;
        this.isParading = true;

        if (!this.trackElement) this.init();
        if (!this.trackElement) {
            this.isParading = false;
            return;
        }

        this.trackElement.innerHTML = '';
        this.trackElement.classList.remove('hidden');

        // Bando ritmi sesi
        if (window.soundEngine) {
            window.soundEngine.playDrumRoll();
            setTimeout(() => {
                if (this.isParading && window.soundEngine) window.soundEngine.playDrumRoll();
            }, 3000);
        }

        // Karakterleri Oluştur
        const characters = [
            { type: 'leader', emoji: '💂‍♂️', name: 'Bando Şefi', title: '🎵 Hey!' },
            { type: 'drummer', emoji: '🥁', name: 'Davulcu', title: 'Güm!' },
            { type: 'trumpeter', emoji: '🎺', name: 'Borazan', title: 'Taa!' },
            { type: 'dancer', emoji: '🎉', name: 'Dansçı', title: 'Hoppa!' },
            { type: 'sweeper', emoji: '🧹', name: 'Temizlikçi Robot', title: 'Süpür süpür!' },
            { type: 'bot', emoji: '🤖', name: 'Mini Bot', title: '010101' },
            { type: 'cat', emoji: '🐱', name: 'Saat Kedisi', title: 'Miyav!' }
        ];

        const group = document.createElement('div');
        group.className = 'parade-group';

        // Ön pankart
        const banner = document.createElement('div');
        banner.className = 'parade-banner';
        banner.innerHTML = '<span>✨ YENİ SAAT BAŞLADI ✨</span>';
        group.appendChild(banner);

        characters.forEach((char, index) => {
            const charEl = document.createElement('div');
            charEl.className = `parade-char char-${char.type}`;
            charEl.style.animationDelay = `${index * 0.15}s`;
            charEl.innerHTML = `
                <div class="char-bubble">${char.title}</div>
                <div class="char-sprite">${char.emoji}</div>
                <div class="char-shadow"></div>
            `;
            group.appendChild(charEl);
        });

        this.trackElement.appendChild(group);

        // Ekranı baştan sona geçme animasyonu (yaklaşık 10 saniye)
        group.classList.add('marching');

        setTimeout(() => {
            this.trackElement.innerHTML = '';
            this.isParading = false;
        }, 11000);
    }
}

window.characterParade = new CharacterParade();
