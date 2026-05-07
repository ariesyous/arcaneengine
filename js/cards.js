// Suits and their base definitions
const SUITS = {
    Swords: {
        name: 'Swords',
        description: 'Deal flat damage to the Boss.',
        type: 'damage'
    },
    Wands: {
        name: 'Wands',
        description: 'Apply Poison (damage over time) to the Boss.',
        type: 'status'
    },
    Cups: {
        name: 'Cups',
        description: 'Generate temporary Shields to absorb Boss attacks.',
        type: 'shield'
    },
    Pentacles: {
        name: 'Pentacles',
        description: 'Generate Gold to buy better cards.',
        type: 'gold'
    }
};

const COURT_CARDS = {
    Page: {
        name: 'Page',
        description: 'Echoes (duplicates) the effect of the card to its immediate left.',
        type: 'modifier'
    },
    Knight: {
        name: 'Knight',
        description: 'Cleaves: Doubles the damage of the next combat card in the sequence.',
        type: 'modifier'
    },
    Queen: {
        name: 'Queen',
        description: 'Converts all generated Shields from this turn into a massive damage burst (2x shields).',
        type: 'modifier'
    },
    King: {
        name: 'King',
        description: 'Loops the engine, sending the sequence back to slot 1 for a second pass (once per turn).',
        type: 'modifier'
    }
};

let cardIdCounter = 0;

class Card {
    constructor(suit, value, isCourt = false, courtType = null) {
        this.id = `card_${cardIdCounter++}`;
        this.suit = suit; // e.g. "Swords"
        this.isCourt = isCourt;
        this.courtType = courtType; // "Page", "Knight", "Queen", "King"
        this.value = value; // 1-10
        this.cost = isCourt ? 15 : value * 2;
    }

    getDisplayName() {
        if (this.isCourt) {
            return `${this.courtType} of ${this.suit}`;
        }
        return `${this.value} of ${this.suit}`;
    }

    getImageUrl() {
        const suitPrefix = { 'Swords': 's', 'Wands': 'w', 'Cups': 'c', 'Pentacles': 'p' }[this.suit];
        let valStr = this.value.toString().padStart(2, '0');
        if (this.isCourt) {
            const courtVal = { 'Page': 11, 'Knight': 12, 'Queen': 13, 'King': 14 }[this.courtType];
            valStr = courtVal.toString();
        }
        return `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/${suitPrefix}${valStr}.jpg`;
    }

    getDescription() {
        if (this.isCourt) {
            return COURT_CARDS[this.courtType].description;
        }
        if (this.suit === 'Swords') return `Deal ${this.value * 2} Damage`;
        if (this.suit === 'Wands') return `Apply ${this.value} Poison`;
        if (this.suit === 'Cups') return `Gain ${this.value * 2} Shields`;
        if (this.suit === 'Pentacles') return `Gain ${this.value} Gold`;
        return '';
    }

    getHTML() {
        const suitClass = `suit-${this.suit}`;
        const courtClass = this.isCourt ? 'court-card' : '';
        const displayVal = this.isCourt ? this.courtType.charAt(0) : this.value;
        const suitSymbols = { Swords: '⚔️', Wands: '🪄', Cups: '🍷', Pentacles: '🪙' };
        const sym = suitSymbols[this.suit];
        const bgImg = this.getImageUrl();

        return `
            <div class="card ${suitClass} ${courtClass}" id="${this.id}" draggable="true" data-card-id="${this.id}">
                <div class="card-bg" style="background-image: url('${bgImg}')"></div>
                <div class="card-overlay">
                    <div class="card-header">
                        <span class="card-value">${displayVal}</span>
                        <span class="card-suit">${sym}</span>
                    </div>
                    <div class="card-body">
                        ${this.getDescription()}
                    </div>
                </div>
                <div class="card-cost">${this.cost}g</div>
            </div>
        `;
    }
}

function generateRandomCard(pool = 'basic') {
    const suitsArr = Object.keys(SUITS);
    const suit = suitsArr[Math.floor(Math.random() * suitsArr.length)];
    
    // 20% chance for a court card if pool is advanced, 0% for basic
    const isCourt = pool === 'advanced' && Math.random() < 0.2;
    
    if (isCourt) {
        const courtArr = Object.keys(COURT_CARDS);
        const court = courtArr[Math.floor(Math.random() * courtArr.length)];
        return new Card(suit, 10, true, court);
    } else {
        const val = Math.floor(Math.random() * 5) + 1 + (pool === 'advanced' ? 3 : 0); // 1-5 basic, 4-8 advanced
        return new Card(suit, val);
    }
}
