/**
 * Canlı Saat - Nadir Event & Rozet Koleksiyon Sistemi
 * LocalStorage tabanlı anomali albümü, keşif rozetleri ve nadir olay tetikleyicisi.
 */

class CollectionEngine {
    constructor() {
        this.storageKey = 'canlisaat_discovered_anomalies';
        this.anomalies = [
            {
                id: 'eclipse',
                name: 'Güneş Tutulması',
                icon: '🌑',
                rarity: 'Efsanevi',
                desc: 'Ay güneşi örter, gökyüzü altın rengi bir karanlığa gömülür.',
                color: '#FFB800'
            },
            {
                id: 'blackhole',
                name: 'Gizemli Karadelik',
                icon: '🕳️',
                rarity: 'Mistik',
                desc: 'Uzay-zaman eğilir, ışık bükülerek bir tekillik halkası oluşturur.',
                color: '#9D4EDD'
            },
            {
                id: 'skywhale',
                name: 'Gökyüzü Balinası',
                icon: '🐋',
                rarity: 'Epik',
                desc: 'Bulutların ve yıldızların arasından devasa ışıltılı bir leviathan süzülür.',
                color: '#00F0FF'
            },
            {
                id: 'aurora_miracle',
                name: 'Kuzey Işıkları Mucizesi',
                icon: '🌈',
                rarity: 'Epik',
                desc: 'Tüm gökyüzünü kaplayan dalgalı yeşil ve mor aurora perdeleri.',
                color: '#52B788'
            },
            {
                id: 'retro_invasion',
                name: '8-Bit Piksel İstilası',
                icon: '👾',
                rarity: 'Nadir',
                desc: 'Retro arcade uzay gemileri gökyüzünden piksel tozu saçar.',
                color: '#FF3366'
            },
            {
                id: 'time_warp',
                name: 'Zaman Bükülmesi',
                icon: '⏳',
                rarity: 'Mistik',
                desc: 'Zaman çizgisi titreşir ve saatin etrafında saat kadranları süzülür.',
                color: '#FFE600'
            }
        ];
        this.discovered = {};
    }

    init() {
        this.loadDiscovered();

        const btnAlbum = document.getElementById('btn-open-album');
        if (btnAlbum) {
            btnAlbum.addEventListener('click', () => this.openAlbumModal());
        }

        const closeBtn = document.getElementById('close-album-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAlbumModal());
        }
    }

    loadDiscovered() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.discovered = data ? JSON.parse(data) : {};
        } catch (e) {
            this.discovered = {};
        }
        this.updateBadgeCount();
    }

    saveDiscovered() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.discovered));
        } catch (e) {}
        this.updateBadgeCount();
    }

    unlockAnomaly(id) {
        const item = this.anomalies.find(a => a.id === id);
        if (!item) return;

        const isFirstTime = !this.discovered[id];
        this.discovered[id] = {
            unlockedAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
        };
        this.saveDiscovered();

        if (window.radarHUD) {
            window.radarHUD.addLogEntry(`✨ Nadir Anomali: ${item.icon} ${item.name}`, true);
        }

        if (isFirstTime) {
            this.showDiscoveryToast(item);
        }
    }

    showDiscoveryToast(item) {
        if (window.soundEngine) window.soundEngine.playWishChime();

        const toast = document.getElementById('toast-msg');
        if (toast) {
            toast.innerHTML = `🏆 <strong>YENİ ANOMALİ KEŞFEDİLDİ!</strong><br>${item.icon} ${item.name} (${item.rarity})`;
            toast.classList.add('show', 'toast-rare');
            setTimeout(() => toast.classList.remove('show', 'toast-rare'), 5000);
        }
    }

    updateBadgeCount() {
        const count = Object.keys(this.discovered).length;
        const total = this.anomalies.length;
        const badgeEl = document.getElementById('album-count-badge');
        if (badgeEl) {
            badgeEl.textContent = `${count}/${total}`;
        }
    }

    openAlbumModal() {
        const modal = document.getElementById('album-modal');
        if (!modal) return;

        const grid = document.getElementById('album-grid');
        if (grid) {
            grid.innerHTML = '';
            this.anomalies.forEach((a) => {
                const isUnlocked = !!this.discovered[a.id];
                const card = document.createElement('div');
                card.className = `album-card ${isUnlocked ? 'unlocked' : 'locked'}`;
                card.innerHTML = `
                    <div class="card-rarity" style="color: ${a.color}">${a.rarity}</div>
                    <div class="card-icon">${isUnlocked ? a.icon : '❓'}</div>
                    <div class="card-title">${isUnlocked ? a.name : 'Gizemli Anomali'}</div>
                    <div class="card-desc">${isUnlocked ? a.desc : 'Bu nadir olaya canlı şahit olarak kilidini açın.'}</div>
                    <div class="card-footer">
                        ${isUnlocked ? `<span class="unlocked-date">📅 ${this.discovered[a.id].unlockedAt}</span>` : '<span class="locked-text">🔒 Kilitli</span>'}
                        <button class="btn-card-preview" data-id="${a.id}">▶ İzle</button>
                    </div>
                `;

                // Kart içindeki test izleme butonu
                card.querySelector('.btn-card-preview').addEventListener('click', () => {
                    this.triggerRareAnomaly(a.id);
                    this.closeAlbumModal();
                });

                grid.appendChild(card);
            });
        }

        modal.classList.add('active');
    }

    closeAlbumModal() {
        const modal = document.getElementById('album-modal');
        if (modal) modal.classList.remove('active');
    }

    // Nadir Olay Tetikleyicisi
    triggerRareAnomaly(id) {
        this.unlockAnomaly(id);

        if (id === 'eclipse') {
            this.playSolarEclipse();
        } else if (id === 'blackhole') {
            this.playBlackHole();
        } else if (id === 'skywhale') {
            this.playSkyWhale();
        } else if (id === 'aurora_miracle') {
            this.playAuroraMiracle();
        } else if (id === 'retro_invasion') {
            this.playRetroInvasion();
        } else if (id === 'time_warp') {
            this.playTimeWarp();
        }
    }

    playSolarEclipse() {
        if (window.soundEngine) window.soundEngine.playGravityShift();
        const eclipseEl = document.getElementById('rare-eclipse');
        if (eclipseEl) {
            eclipseEl.classList.remove('hidden');
            eclipseEl.classList.add('active');
            setTimeout(() => {
                eclipseEl.classList.remove('active');
                eclipseEl.classList.add('hidden');
            }, 14000);
        }
    }

    playBlackHole() {
        if (window.soundEngine) window.soundEngine.playPortalSwirl();
        const bhEl = document.getElementById('rare-blackhole');
        if (bhEl) {
            bhEl.classList.remove('hidden');
            bhEl.classList.add('active');
            setTimeout(() => {
                bhEl.classList.remove('active');
                bhEl.classList.add('hidden');
            }, 14000);
        }
    }

    playSkyWhale() {
        if (window.soundEngine) window.soundEngine.playUfoBeam();
        const whale = document.getElementById('rare-skywhale');
        if (whale) {
            whale.classList.remove('hidden');
            whale.classList.add('flying');
            setTimeout(() => {
                whale.classList.remove('flying');
                whale.classList.add('hidden');
            }, 15000);
        }
    }

    playAuroraMiracle() {
        if (window.moodEngine) window.moodEngine.setMood('cosmos');
        if (window.soundEngine) window.soundEngine.playWishChime();
        if (window.wishMode) {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => window.wishMode.spawnShootingStar(), i * 400);
            }
        }
    }

    playRetroInvasion() {
        if (window.moodEngine) window.moodEngine.setMood('retro');
        if (window.characterParade) window.characterParade.startParade();
    }

    playTimeWarp() {
        if (window.typographyEngine) {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            window.typographyEngine.playSlotMachine(timeStr);
        }
    }
}

window.collectionEngine = new CollectionEngine();
