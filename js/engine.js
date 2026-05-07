const STATE = {
    player: {
        hp: 50,
        maxHp: 50,
        shields: 0,
        gold: 25,
    },
    boss: {
        hp: 100,
        maxHp: 100,
        attack: 15,
        doomClock: 10,
        poison: 0
    },
    phase: 'SETUP', // 'SETUP' or 'EXECUTION'
    leyline: [null, null, null, null, null], // Array of Card objects
    ownedCards: [],
    shopCards: [],
    level: 1,
    hasLooped: false
};

const BOSSES = [
    { name: "The Fool", hp: 30, attack: 5, doomClock: 12, img: "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m00.jpg" },
    { name: "The Hierophant", hp: 100, attack: 15, doomClock: 10, img: "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m05.jpg" },
    { name: "The Chariot", hp: 200, attack: 25, doomClock: 8, img: "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m07.jpg" },
    { name: "Death", hp: 400, attack: 50, doomClock: 6, img: "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m13.jpg" },
    { name: "The Tower", hp: 600, attack: 66, doomClock: 5, img: "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m16.jpg" }
];

async function runEngine() {
    if (STATE.phase !== 'SETUP') return;
    STATE.phase = 'EXECUTION';
    updateUIControls();

    STATE.hasLooped = false;
    let cleaveMultiplier = 1;

    let slotIndex = 0;

    // Apply poison tick at the start of engine run
    if (STATE.boss.poison > 0) {
        showPopup('target-area', `${STATE.boss.poison} Poison`, 'status-text');
        damageBoss(STATE.boss.poison);
        await sleep(500);
    }

    while (slotIndex < 5) {
        const card = STATE.leyline[slotIndex];
        
        // Highlight slot
        highlightSlot(slotIndex);
        
        if (card) {
            let effectResult = await executeCard(card, slotIndex, cleaveMultiplier);
            if (effectResult.cleaveMultiplier) {
                cleaveMultiplier = effectResult.cleaveMultiplier;
            } else {
                // If it was a combat card that used the cleave, reset it
                if (card.suit === 'Swords' && cleaveMultiplier > 1) {
                    cleaveMultiplier = 1;
                }
            }
            if (effectResult.loopTriggered) {
                slotIndex = -1; // Next iteration will be slot 0
                STATE.hasLooped = true;
            }
        }

        await sleep(800); // Delay between slots
        removeHighlight(slotIndex);
        
        if (STATE.boss.hp <= 0) break;
        slotIndex++;
    }

    await resolveTurn();
}

async function executeCard(card, index, cleaveMultiplier, isEcho = false) {
    let result = { cleaveMultiplier: cleaveMultiplier, loopTriggered: false };
    
    if (!card) return result;

    const targetEl = document.querySelector(`.leyline-slot[data-index="${index}"]`);

    if (card.isCourt) {
        switch (card.courtType) {
            case 'Page':
                // Echo previous card
                if (index > 0 && STATE.leyline[index - 1] && !isEcho) {
                    showPopupElement(targetEl, 'Echo!', 'status-text');
                    await sleep(400);
                    const prevCard = STATE.leyline[index - 1];
                    let echoResult = await executeCard(prevCard, index, cleaveMultiplier, true);
                    result.cleaveMultiplier = echoResult.cleaveMultiplier;
                    result.loopTriggered = echoResult.loopTriggered;
                }
                break;
            case 'Knight':
                // Cleave
                showPopupElement(targetEl, 'Cleave!', 'status-text');
                result.cleaveMultiplier = 2;
                break;
            case 'Queen':
                // Shields to damage
                if (STATE.player.shields > 0) {
                    const dmg = STATE.player.shields * 2;
                    showPopupElement(targetEl, `Burst!`, 'status-text');
                    await sleep(400);
                    showPopup('target-area', `-${dmg}`, 'dmg-text');
                    damageBoss(dmg * cleaveMultiplier);
                    STATE.player.shields = 0;
                    result.cleaveMultiplier = 1;
                }
                break;
            case 'King':
                // Loop
                if (!STATE.hasLooped && !isEcho) {
                    showPopupElement(targetEl, 'Loop Engine!', 'status-text');
                    result.loopTriggered = true;
                }
                break;
        }
    } else {
        switch (card.suit) {
            case 'Swords':
                const dmg = (card.value * 2) * cleaveMultiplier;
                showPopup('target-area', `-${dmg}`, 'dmg-text');
                damageBoss(dmg);
                break;
            case 'Wands':
                STATE.boss.poison += card.value;
                showPopup('target-area', `+${card.value} Poison`, 'status-text');
                break;
            case 'Cups':
                const shields = card.value * 2;
                STATE.player.shields += shields;
                showPopupElement(document.querySelector('.player-stats .shields'), `+${shields}`, 'shield-text');
                break;
            case 'Pentacles':
                const gold = card.value;
                STATE.player.gold += gold;
                showPopupElement(document.querySelector('.player-stats .gold'), `+${gold}g`, 'gold-text');
                break;
        }
    }

    updateStatsUI();
    return result;
}

async function resolveTurn() {
    if (STATE.boss.hp <= 0) {
        // Win
        await handleWin();
    } else {
        // Boss attacks
        await sleep(500);
        showPopup('target-area', 'Boss Attacks!', 'status-text');
        await sleep(500);
        
        let dmgToTake = STATE.boss.attack;
        if (STATE.player.shields >= dmgToTake) {
            STATE.player.shields -= dmgToTake;
            showPopupElement(document.querySelector('.player-stats .shields'), `Blocked ${dmgToTake}`, 'shield-text');
            
            // Cup Overflow Mechanic: 5 shields = 1 HP healing
            if (STATE.player.shields > 0) {
                const healing = Math.floor(STATE.player.shields / 5);
                if (healing > 0) {
                    await sleep(500);
                    STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + healing);
                    showPopupElement(document.querySelector('.player-stats .hp'), `+${healing} HP (Overflow)`, 'shield-text');
                }
            }
        } else {
            dmgToTake -= STATE.player.shields;
            STATE.player.shields = 0;
            STATE.player.hp -= dmgToTake;
            showPopupElement(document.querySelector('.player-stats .hp'), `-${dmgToTake}`, 'dmg-text');
        }

        STATE.player.shields = 0; // Shields always reset at end of turn after overflow processing
        updateStatsUI();
        
        STATE.boss.doomClock--;
        
        if (STATE.player.hp <= 0 || STATE.boss.doomClock <= 0) {
            await sleep(500);
            alert("Game Over! The Arcane Engine has shattered.");
            location.reload();
            return;
        }
        
        // Reset for next turn
        STATE.phase = 'SETUP';
        updateUIControls();
    }
}

async function handleWin() {
    STATE.player.gold += 50;
    STATE.level++;
    if (STATE.level > BOSSES.length) {
        alert("You have defeated all the Arcana. You win!");
        location.reload();
        return;
    }
    
    // Load next boss
    const nextBoss = BOSSES[STATE.level - 1];
    STATE.boss.name = nextBoss.name;
    STATE.boss.hp = nextBoss.hp;
    STATE.boss.maxHp = nextBoss.hp;
    STATE.boss.attack = nextBoss.attack;
    STATE.boss.doomClock = nextBoss.doomClock;
    STATE.boss.img = nextBoss.img;
    STATE.boss.poison = 0;
    STATE.player.shields = 0;
    
    const bossImgEl = document.querySelector('.boss-image-placeholder');
    if (bossImgEl) {
        bossImgEl.style.backgroundImage = `url('${STATE.boss.img}')`;
    }
    
    showPopup('target-area', 'Victory! +50g', 'gold-text');
    await sleep(1500);
    
    refreshShop();
    updateStatsUI();
    
    STATE.phase = 'SETUP';
    updateUIControls();
}

function damageBoss(amount) {
    STATE.boss.hp = Math.max(0, STATE.boss.hp - amount);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
