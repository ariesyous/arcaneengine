# Arcane Engine

A web-based deck-building auto-battler where you slot Tarot cards into a "Leyline" to execute sequences of arcane effects against powerful bosses.

## Project Overview

*   **Genre:** Roguelike Deck-builder / Auto-battler.
*   **Theme:** Tarot cards (Major and Minor Arcana).
*   **Core Loop:** 
    1.  **Setup Phase:** Buy cards from the Shop, manage your Backpack, and arrange 5 cards in the Leyline.
    2.  **Execution Phase:** Run the "Engine" which processes the Leyline from left to right, triggering card effects.
    3.  **Resolution:** The Boss attacks, and if you survive, you enter the next Setup phase or move to the next Boss upon victory.
*   **Tech Stack:** 
    *   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+).
    *   **Assets:** Remote Tarot card images hosted on GitHub.
    *   **Data:** JSON for image maps and card data.

## Game Mechanics

### Card Suits (Minor Arcana)
*   **Swords (⚔️):** Deal damage.
*   **Wands (🪄):** Apply Poison (damage over time).
*   **Cups (🍷):** Gain Shields (absorb damage).
*   **Pentacles (🪙):** Gain Gold (buy more cards).

### Court Cards (Modifiers)
*   **Page:** Echoes (duplicates) the effect of the previous card.
*   **Knight:** Cleaves (doubles) the damage of the next combat card.
*   **Queen:** Converts all current Shields into a massive damage burst.
*   **King:** Loops the engine (one extra pass through the Leyline).

### Key Systems
*   **The Leyline:** A 5-slot sequence that defines the order of execution.
*   **Doom Clock:** A turn limit for each boss fight. If it reaches zero, the game is over.
*   **Cup Overflow:** Excess shields can heal the player (5 shields = 1 HP).

## Project Structure

```text
/arcaneengine/
├── index.html          # Main game entry point and UI layout
├── styles.css          # Visual styling and animations
├── js/
│   ├── cards.js        # Card definitions, suits, and court card logic
│   ├── engine.js       # Core game state and execution loop
│   ├── ui.js           # UI rendering, drag-and-drop, and animations
│   └── main.js         # Initialization and event listeners
├── python_tools/       # Utility scripts (download_images.py, etc.)
└── tarot_imgs.json     # Metadata for card assets
```

## Development Conventions

*   **State Management:** Centered in the `STATE` object in `js/engine.js`.
*   **Modular JS:** Logic is split into functional modules (cards, engine, ui) and loaded sequentially in `index.html`.
*   **Naming:** 
    *   `camelCase` for variables and functions.
    *   `PascalCase` for Classes (`Card`) and constant objects (`BOSSES`, `STATE`).
*   **UI Updates:** Triggered by `renderAll()` or specific update functions (`updateStatsUI`) after state changes.

## Commands & Tasks

*   **Running the Project:** Open `index.html` in any modern web browser.
*   **Testing:** No automated testing framework is currently integrated. Manual testing via browser console and gameplay.
*   **Asset Management:** Use `download_images.py` to localise remote assets if needed (requires Python).

## TODOs & Future Improvements
- [ ] Implement a proper "Major Arcana" mechanic (relics or special powers).
- [ ] Add sound effects and music.
- [ ] Save/Load system using LocalStorage.
- [ ] Mobile-responsive layout optimizations.
