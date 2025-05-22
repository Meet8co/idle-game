// Game state
let points = 0;
let pointsPerSecond = 0;
let upgrades = {
    1: { cost: 10, owned: 0, pps: 1 },
    2: { cost: 50, owned: 0, pps: 5 }
};

// DOM elements
const pointsDisplay = document.getElementById('points');
const ppsDisplay = document.getElementById('pps');
const clickerButton = document.getElementById('clicker');

// Game loop
function gameLoop() {
    points += pointsPerSecond / 10; // Update 10 times per second for smoother display
    updateDisplay();
    setTimeout(gameLoop, 100);
}

// Update display
function updateDisplay() {
    pointsDisplay.textContent = Math.floor(points);
    ppsDisplay.textContent = pointsPerSecond;
    
    // Update upgrade displays
    for (let id in upgrades) {
        document.getElementById(`upgrade${id}-cost`).textContent = getUpgradeCost(id);
        document.getElementById(`upgrade${id}-owned`).textContent = upgrades[id].owned;
    }
}

// Click handler
clickerButton.addEventListener('click', () => {
    points += 1;
    updateDisplay();
});

// Buy upgrade
function buyUpgrade(id) {
    const cost = getUpgradeCost(id);
    if (points >= cost) {
        points -= cost;
        upgrades[id].owned += 1;
        pointsPerSecond += upgrades[id].pps;
        updateDisplay();
    }
}

// Calculate upgrade cost (increases with each purchase)
function getUpgradeCost(id) {
    return Math.floor(upgrades[id].cost * Math.pow(1.15, upgrades[id].owned));
}

// Start the game
gameLoop();
