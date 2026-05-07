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
    STATE.boss.attack = BOSSES[0].attack;
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

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
