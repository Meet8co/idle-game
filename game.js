// Game State
const game = {
    points: 0,
    totalPoints: 0,
    pointsPerSecond: 0,
    clickPower: 1,
    prestige: 0,
    prestigePoints: 0,
    multiplier: 1,
    lastUpdate: Date.now(),
    upgrades: {
        click: [
            { id: 1, name: "Better Cursor", description: "Double your clicking power", cost: 10, power: 1, owned: 0, max: 10 },
            { id: 2, name: "Power Glove", description: "Triple your clicking power", cost: 100, power: 3, owned: 0, max: 5 },
            { id: 3, name: "Platinum Mouse", description: "5x clicking power", cost: 1000, power: 5, owned: 0, max: 3 }
        ],
        auto: [
            { id: 1, name: "Auto-Clicker", description: "Generates 1 point per second", cost: 15, power: 1, owned: 0 },
            { id: 2, name: "Mining Bot", description: "Generates 5 points per second", cost: 100, power: 5, owned: 0 },
            { id: 3, name: "Factory", description: "Generates 20 points per second", cost: 500, power: 20, owned: 0 },
            { id: 4, name: "Quantum Computer", description: "Generates 100 points per second", cost: 3000, power: 100, owned: 0 },
            { id: 5, name: "AI Overlord", description: "Generates 1000 points per second", cost: 10000, power: 1000, owned: 0 }
        ]
    },
    achievements: [
        { id: 1, name: "First Click", description: "Click the button once", goal: 1, unlocked: false, type: "click" },
        { id: 2, name: "Hundredaire", description: "Reach 100 points", goal: 100, unlocked: false, type: "points" },
        { id: 3, name: "Auto Tycoon", description: "Have 10 automated producers", goal: 10, unlocked: false, type: "auto" },
        { id: 4, name: "Prestigious", description: "Prestige for the first time", goal: 1, unlocked: false, type: "prestige" },
        { id: 5, name: "Click Master", description: "Reach 1,000 clicks", goal: 1000, unlocked: false, type: "click" }
    ],
    stats: {
        clicks: 0,
        autoProducers: 0,
        upgradesBought: 0,
        timePlayed: 0
    },
    settings: {
        autoSave: true,
        notifications: true
    }
};

// DOM Elements
const elements = {
    points: document.getElementById('points'),
    pps: document.getElementById('pps'),
    prestige: document.getElementById('prestige'),
    multiplier: document.getElementById('multiplier'),
    clicker: document.getElementById('clicker'),
    clickPower: document.getElementById('click-power'),
    clickUpgrades: document.getElementById('click-upgrades'),
    autoUpgrades: document.getElementById('auto-upgrades'),
    achievementsList: document.getElementById('achievements-list'),
    prestigePoints: document.getElementById('prestige-points'),
    nextPrestige: document.getElementById('next-prestige'),
    prestigeButton: document.getElementById('prestige-button'),
    notifications: document.getElementById('notifications'),
    saveToggle: document.getElementById('save-toggle'),
    notificationsToggle: document.getElementById('notifications-toggle')
};

// Initialize the game
function initGame() {
    loadGame();
    setupEventListeners();
    renderUpgrades();
    renderAchievements();
    updatePrestigeButton();
    updateDisplay();
    gameLoop();
    
    // Update time played every minute
    setInterval(() => {
        game.stats.timePlayed += 1;
        if (game.settings.autoSave) saveGame();
    }, 60000);
}

// Game loop
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - game.lastUpdate) / 1000; // Convert to seconds
    game.lastUpdate = now;
    
    // Generate points from auto producers
    const pointsGenerated = game.pointsPerSecond * deltaTime * game.multiplier;
    game.points += pointsGenerated;
    game.totalPoints += pointsGenerated;
    
    checkAchievements();
    updateDisplay();
    requestAnimationFrame(gameLoop);
}

// Update all display elements
function updateDisplay() {
    elements.points.textContent = formatNumber(game.points);
    elements.pps.textContent = formatNumber(game.pointsPerSecond * game.multiplier);
    elements.prestige.textContent = game.prestige;
    elements.multiplier.textContent = game.multiplier;
    elements.clickPower.textContent = game.clickPower * game.multiplier;
    
    // Update upgrade buttons
    updateUpgradeButtons();
    updatePrestigeButton();
}

// Format numbers for display
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return Math.floor(num);
}

// Setup event listeners
function setupEventListeners() {
    // Clicker button
    elements.clicker.addEventListener('click', () => {
        game.points += game.clickPower * game.multiplier;
        game.totalPoints += game.clickPower * game.multiplier;
        game.stats.clicks++;
        createClickEffect(event);
        
        // Random chance for bonus click
        if (Math.random() < 0.05) {
            const bonus = Math.floor(game.clickPower * game.multiplier * (1 + Math.random()));
            game.points += bonus;
            game.totalPoints += bonus;
            showNotification(`Critical click! +${bonus} points`, 'success');
        }
        
        updateDisplay();
    });
    
    // Prestige button
    elements.prestigeButton.addEventListener('click', prestige);
    
    // Settings toggles
    elements.saveToggle.addEventListener('change', (e) => {
        game.settings.autoSave = e.target.checked;
        if (game.settings.autoSave) saveGame();
    });
    
    elements.notificationsToggle.addEventListener('change', (e) => {
        game.settings.notifications = e.target.checked;
    });
}

// Render upgrades
function renderUpgrades() {
    // Click upgrades
    elements.clickUpgrades.innerHTML = '';
    game.upgrades.click.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade';
        upgradeElement.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <p>+${upgrade.power * game.multiplier} points per click</p>
            <p>Cost: <span class="cost">${formatNumber(getUpgradeCost(upgrade))}</span> points</p>
            <p>Owned: ${upgrade.owned}/${upgrade.max}</p>
            <button onclick="buyUpgrade('click', ${upgrade.id})" 
                ${upgrade.owned >= upgrade.max ? 'disabled' : ''}>
                ${upgrade.owned >= upgrade.max ? 'MAXED' : 'Buy'}
            </button>
        `;
        elements.clickUpgrades.appendChild(upgradeElement);
    });
    
    // Auto upgrades
    elements.autoUpgrades.innerHTML = '';
    game.upgrades.auto.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade';
        upgradeElement.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <p>+${upgrade.power * game.multiplier} points per second</p>
            <p>Cost: <span class="cost">${formatNumber(getUpgradeCost(upgrade))}</span> points</p>
            <p>Owned: ${upgrade.owned}</p>
            <button onclick="buyUpgrade('auto', ${upgrade.id})">Buy</button>
        `;
        elements.autoUpgrades.appendChild(upgradeElement);
    });
}

// Calculate upgrade cost
function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.cost * Math.pow(1.15, upgrade.owned));
}

// Buy upgrade
function buyUpgrade(type, id) {
    const upgrades = game.upgrades[type];
    const upgrade = upgrades.find(u => u.id === id);
    const cost = getUpgradeCost(upgrade);
    
    if (game.points >= cost && (type !== 'click' || upgrade.owned < upgrade.max)) {
        game.points -= cost;
        upgrade.owned++;
        game.stats.upgradesBought++;
        
        if (type === 'click') {
            game.clickPower += upgrade.power;
        } else {
            game.pointsPerSecond += upgrade.power;
            game.stats.autoProducers++;
        }
        
        if (game.settings.notifications) {
            showNotification(`${upgrade.name} purchased!`, 'success');
        }
        
        updateDisplay();
        renderUpgrades();
        if (game.settings.autoSave) saveGame();
    }
}

// Update upgrade buttons state
function updateUpgradeButtons() {
    game.upgrades.click.forEach(upgrade => {
        const canAfford = game.points >= getUpgradeCost(upgrade);
        const button = document.querySelector(`button[onclick="buyUpgrade('click', ${upgrade.id})"]`);
        if (button) {
            button.disabled = !canAfford || upgrade.owned >= upgrade.max;
        }
    });
    
    game.upgrades.auto.forEach(upgrade => {
        const canAfford = game.points >= getUpgradeCost(upgrade);
        const button = document.querySelector(`button[onclick="buyUpgrade('auto', ${upgrade.id})"]`);
        if (button) {
            button.disabled = !canAfford;
        }
    });
}

// Render achievements
function renderAchievements() {
    elements.achievementsList.innerHTML = '';
    game.achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
        achievementElement.innerHTML = `
            <div class="icon"><i class="fas fa-trophy"></i></div>
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            <p>${achievement.unlocked ? 'Unlocked!' : `Progress: ${getAchievementProgress(achievement)}/${achievement.goal}`}</p>
        `;
        elements.achievementsList.appendChild(achievementElement);
    });
}

// Get achievement progress
function getAchievementProgress(achievement) {
    switch (achievement.type) {
        case 'click': return game.stats.clicks;
        case 'points': return game.totalPoints;
        case 'auto': return game.stats.autoProducers;
        case 'prestige': return game.prestige;
        default: return 0;
    }
}

// Check achievements
function checkAchievements() {
    let newAchievements = false;
    
    game.achievements.forEach(achievement => {
        if (!achievement.unlocked && getAchievementProgress(achievement) >= achievement.goal) {
            achievement.unlocked = true;
            newAchievements = true;
            
            if (game.settings.notifications) {
                showNotification(`Achievement Unlocked: ${achievement.name}`, 'achievement');
            }
        }
    });
    
    if (newAchievements) {
        renderAchievements();
        if (game.settings.autoSave) saveGame();
    }
}

// Prestige system
function updatePrestigeButton() {
    const canPrestige = game.totalPoints >= 1000;
    elements.prestigeButton.disabled = !canPrestige;
    elements.prestigePoints.textContent = game.prestigePoints;
    elements.nextPrestige.textContent = (game.prestigePoints + 1) * 0.1 + 1;
}

function prestige() {
    if (game.totalPoints >= 1000) {
        game.prestige++;
        game.prestigePoints++;
        game.multiplier = 1 + (game.prestigePoints * 0.1);
        
        // Reset game state but keep prestige benefits
        game.points = 0;
        game.totalPoints = 0;
        game.pointsPerSecond = 0;
        game.clickPower = 1;
        game.stats.clicks = 0;
        game.stats.autoProducers = 0;
        game.stats.upgradesBought = 0;
        
        // Reset upgrades
        game.upgrades.click.forEach(upgrade => upgrade.owned = 0);
        game.upgrades.auto.forEach(upgrade => upgrade.owned = 0);
        
        showNotification(`Prestiged! Multiplier: ${game.multiplier}x`, 'prestige');
        updateDisplay();
        renderUpgrades();
        if (game.settings.autoSave) saveGame();
    }
}

// Tab system
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }
    
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
    }
    
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    event.currentTarget.className += ' active';
}

// Visual effects
function createClickEffect(event) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${game.clickPower * game.multiplier}`;
    effect.style.position = 'absolute';
    effect.style.left = `${event.clientX + 10}px`;
    effect.style.top = `${event.clientY - 10}px`;
    effect.style.color = '#4CAF50';
    effect.style.fontWeight = 'bold';
    effect.style.pointerEvents = 'none';
    effect.style.animation = 'floatUp 1s forwards';
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

// Notifications
function showNotification(message, type = 'info') {
    if (!game.settings.notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    elements.notifications.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save system
function saveGame() {
    localStorage.setItem('idleGameSave', JSON.stringify(game));
    showNotification('Game saved!', 'info');
}

function loadGame() {
    const save = localStorage.getItem('idleGameSave');
    if (save) {
        const parsed = JSON.parse(save);
        Object.assign(game, parsed);
        showNotification('Game loaded!', 'info');
    }
}

function exportSave() {
    const saveData = JSON.stringify(game);
    const blob = new Blob([saveData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idle-game-save.txt';
    a.click();
    showNotification('Save exported!', 'info');
}

function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const saveData = JSON.parse(event.target.result);
                Object.assign(game, saveData);
                showNotification('Save imported!', 'info');
                updateDisplay();
                renderUpgrades();
                renderAchievements();
                if (game.settings.autoSave) saveGame();
            } catch (err) {
                showNotification('Invalid save file', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetGame() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        localStorage.removeItem('idleGameSave');
        location.reload();
    }
}

// Start the game
window.onload = initGame;
