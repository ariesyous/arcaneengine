// UI Logic and Rendering

function updateStatsUI() {
    document.getElementById('boss-name').textContent = STATE.boss.name;
    document.getElementById('boss-hp-val').textContent = STATE.boss.hp;
    document.getElementById('boss-hp-max').textContent = STATE.boss.maxHp;
    document.getElementById('boss-attack-val').textContent = STATE.boss.attack;
    document.getElementById('doom-clock-val').textContent = STATE.boss.doomClock;
    
    document.getElementById('player-hp-val').textContent = STATE.player.hp;
    document.getElementById('player-shields-val').textContent = STATE.player.shields;
    document.getElementById('player-gold-val').textContent = STATE.player.gold;
    
    // Update Boss HP visual color if low
    const hpPercent = STATE.boss.hp / STATE.boss.maxHp;
    const hpEl = document.getElementById('boss-hp-val');
    hpEl.style.color = hpPercent < 0.3 ? '#ff0000' : 'var(--sword-color)';
}

function updateUIControls() {
    const btnRun = document.getElementById('btn-run-engine');
    const btnReroll = document.getElementById('btn-reroll-shop');
    
    if (STATE.phase === 'SETUP') {
        btnRun.disabled = false;
        btnRun.textContent = "Run Engine";
        btnReroll.disabled = STATE.player.gold < 5;
    } else {
        btnRun.disabled = true;
        btnRun.textContent = "Executing...";
        btnReroll.disabled = true;
    }
}

function highlightSlot(index) {
    const slot = document.querySelector(`.leyline-slot[data-index="${index}"]`);
    if (slot) slot.classList.add('executing-slot');
}

function removeHighlight(index) {
    const slot = document.querySelector(`.leyline-slot[data-index="${index}"]`);
    if (slot) slot.classList.remove('executing-slot');
}

function showPopup(containerId, text, className) {
    const container = document.getElementById(containerId);
    showPopupElement(container, text, className);
}

function showPopupElement(targetEl, text, className) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = `popup-text ${className}`;
    popup.textContent = text;
    
    // Position relatively near the target element
    popup.style.left = `${rect.left + (rect.width/2) + (Math.random() * 40 - 20)}px`;
    popup.style.top = `${rect.top + (rect.height/2) + (Math.random() * 40 - 20)}px`;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// Drag and Drop Logic
let draggedCardId = null;
let draggedFrom = null; // 'backpack', 'leyline', 'shop'
let draggedSlotIndex = null;

function handleDragStart(e) {
    if (STATE.phase !== 'SETUP') {
        e.preventDefault();
        return;
    }
    
    draggedCardId = e.target.dataset.cardId;
    const parent = e.target.parentElement;
    
    if (parent.id === 'backpack-container') draggedFrom = 'backpack';
    else if (parent.id === 'shop-container') draggedFrom = 'shop';
    else if (parent.classList.contains('leyline-slot')) {
        draggedFrom = 'leyline';
        draggedSlotIndex = parseInt(parent.dataset.index);
    }
    
    e.dataTransfer.setData('text/plain', draggedCardId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => e.target.style.opacity = '0.5', 0);
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    draggedCardId = null;
    draggedFrom = null;
    draggedSlotIndex = null;
    document.querySelectorAll('.leyline-slot').forEach(s => s.classList.remove('drag-over'));
}

function handleDragOver(e) {
    if (STATE.phase !== 'SETUP') return;
    e.preventDefault();
    if (e.currentTarget.classList.contains('leyline-slot') || e.currentTarget.id === 'backpack-container') {
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleDragEnter(e) {
    if (e.currentTarget.classList.contains('leyline-slot')) {
        e.currentTarget.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.currentTarget.classList.contains('leyline-slot')) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function getCardObjById(id) {
    // Search in owned, shop, and leyline
    let card = STATE.ownedCards.find(c => c.id === id);
    if (card) return { card, sourceList: STATE.ownedCards };
    
    card = STATE.shopCards.find(c => c.id === id);
    if (card) return { card, sourceList: STATE.shopCards };
    
    for (let i=0; i<5; i++) {
        if (STATE.leyline[i] && STATE.leyline[i].id === id) {
            return { card: STATE.leyline[i], sourceList: STATE.leyline };
        }
    }
    return { card: null, sourceList: null };
}

function handleDropSlot(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedCardId) return;
    
    const targetIndex = parseInt(e.currentTarget.dataset.index);
    const { card, sourceList } = getCardObjById(draggedCardId);
    
    if (!card) return;

    if (draggedFrom === 'shop') {
        // Handle buying
        if (STATE.player.gold >= card.cost) {
            STATE.player.gold -= card.cost;
            STATE.shopCards = STATE.shopCards.filter(c => c.id !== card.id);
            // Put it in the slot
            if (STATE.leyline[targetIndex]) {
                // Return existing to backpack
                STATE.ownedCards.push(STATE.leyline[targetIndex]);
            }
            STATE.leyline[targetIndex] = card;
            renderAll();
        } else {
            showPopupElement(e.currentTarget, 'Not enough gold!', 'dmg-text');
        }
        return;
    }

    // Move from backpack to slot
    if (draggedFrom === 'backpack') {
        if (STATE.leyline[targetIndex]) {
            // Swap: current slot card goes to backpack
            STATE.ownedCards.push(STATE.leyline[targetIndex]);
        }
        STATE.leyline[targetIndex] = card;
        STATE.ownedCards = STATE.ownedCards.filter(c => c.id !== card.id);
    }
    // Move from slot to slot
    else if (draggedFrom === 'leyline') {
        const temp = STATE.leyline[targetIndex];
        STATE.leyline[targetIndex] = card;
        STATE.leyline[draggedSlotIndex] = temp;
    }

    renderAll();
}

function handleDropBackpack(e) {
    e.preventDefault();
    if (!draggedCardId) return;

    const { card } = getCardObjById(draggedCardId);
    if (!card) return;

    if (draggedFrom === 'shop') {
        // Buy directly to backpack
        if (STATE.player.gold >= card.cost) {
            STATE.player.gold -= card.cost;
            STATE.shopCards = STATE.shopCards.filter(c => c.id !== card.id);
            STATE.ownedCards.push(card);
            renderAll();
        } else {
            showPopup('player-area', 'Not enough gold!', 'dmg-text');
        }
        return;
    }

    if (draggedFrom === 'leyline') {
        STATE.leyline[draggedSlotIndex] = null;
        STATE.ownedCards.push(card);
        renderAll();
    }
}

// Rendering Functions
function renderAll() {
    updateStatsUI();
    updateUIControls();
    
    // Render Leyline
    for (let i = 0; i < 5; i++) {
        const slotEl = document.querySelector(`.leyline-slot[data-index="${i}"]`);
        slotEl.innerHTML = '';
        if (STATE.leyline[i]) {
            slotEl.innerHTML = STATE.leyline[i].getHTML();
        }
    }
    
    // Render Backpack
    const bpContainer = document.getElementById('backpack-container');
    bpContainer.innerHTML = STATE.ownedCards.map(c => c.getHTML()).join('');
    
    // Render Shop
    const shopContainer = document.getElementById('shop-container');
    shopContainer.innerHTML = STATE.shopCards.map(c => c.getHTML()).join('');
    
    attachDragListeners();
}

function attachDragListeners() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    const slots = document.querySelectorAll('.leyline-slot');
    slots.forEach(slot => {
        // Remove existing to avoid duplicates if re-rendering
        slot.removeEventListener('dragover', handleDragOver);
        slot.removeEventListener('dragenter', handleDragEnter);
        slot.removeEventListener('dragleave', handleDragLeave);
        slot.removeEventListener('drop', handleDropSlot);

        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragenter', handleDragEnter);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDropSlot);
    });

    const backpack = document.getElementById('backpack-container');
    backpack.removeEventListener('dragover', handleDragOver);
    backpack.removeEventListener('drop', handleDropBackpack);
    backpack.addEventListener('dragover', handleDragOver);
    backpack.addEventListener('drop', handleDropBackpack);
}

function refreshShop() {
    STATE.shopCards = [];
    const pool = STATE.level > 1 ? 'advanced' : 'basic';
    for (let i = 0; i < 4; i++) {
        STATE.shopCards.push(generateRandomCard(pool));
    }
    renderAll();
}

// Button listeners
document.getElementById('btn-run-engine').addEventListener('click', runEngine);
document.getElementById('btn-reroll-shop').addEventListener('click', () => {
    if (STATE.phase === 'SETUP' && STATE.player.gold >= 5) {
        STATE.player.gold -= 5;
        refreshShop();
    }
});
