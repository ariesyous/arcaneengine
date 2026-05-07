// Main Initialization

function initGame() {
    // Generate initial backpack cards
    // 2 of Swords, 2 of Swords, 3 of Wands, 2 of Cups, Ace of Pentacles, 1 of Swords
    STATE.ownedCards = [
        new Card('Swords', 2),
        new Card('Swords', 2),
        new Card('Wands', 3),
        new Card('Cups', 2),
        new Card('Pentacles', 1),
        new Card('Swords', 1)
    ];

    // Initialize first boss
    STATE.boss.name = BOSSES[0].name;
    STATE.boss.hp = BOSSES[0].hp;
    STATE.boss.maxHp = BOSSES[0].hp;
    STATE.boss.shields = 0;
    STATE.boss.intents = BOSSES[0].intents;
    STATE.boss.intentIndex = 0;
    STATE.boss.doomClock = BOSSES[0].doomClock;
    STATE.boss.img = BOSSES[0].img;
    
    // Set boss image URL in UI
    const bossImgEl = document.querySelector('.boss-image-placeholder');
    if (bossImgEl) {
        bossImgEl.style.backgroundImage = `url('${STATE.boss.img}')`;
    }

    // Refresh shop for the first time
    refreshShop();
    
    // Initial Render
    renderAll();
}

// Main Menu & Modal Setup
function setupMenu() {
    const btnNewGame = document.getElementById('btn-new-game');
    const btnHowToPlay = document.getElementById('btn-how-to-play');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnHelp = document.getElementById('btn-help');
    
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const modal = document.getElementById('how-to-play-modal');
    
    if (btnNewGame) {
        btnNewGame.addEventListener('click', () => {
            mainMenu.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            if (window.initAudio) window.initAudio();
            initGame();
        });
    }
    
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');
    
    if (btnHowToPlay) btnHowToPlay.addEventListener('click', openModal);
    if (btnHelp) btnHelp.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
}

// Start menu when DOM is loaded
document.addEventListener('DOMContentLoaded', setupMenu);
