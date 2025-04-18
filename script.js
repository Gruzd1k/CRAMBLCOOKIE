let cookies = 0;
let cookiesPerSecond = 0;
let totalClicks = 0;
let clickMultiplier = 1;
let clickPower = 1;
let clickSpeed = 1;
let // В начале script.js, после объявления переменных
upgradeMultipliers = {
    grandma: 1,
    factory: 1,
    farm: 1,
    mine: 1,
    shipment: 1,
    alchemy: 1,
    portal: 1,
    timeMachine: 1
};

let upgrades = {
    grandma: {
        cost: 10,
        cps: 1,
        owned: 0
    },
    factory: {
        cost: 100,
        cps: 10,
        owned: 0
    },
    farm: {
        cost: 500,
        cps: 50,
        owned: 0
    },
    mine: {
        cost: 2000,
        cps: 200,
        owned: 0
    },
    shipment: {
        cost: 10000,
        cps: 1000,
        owned: 0
    },
    alchemy: {
        cost: 50000,
        cps: 5000,
        owned: 0
    },
    portal: {
        cost: 200000,
        cps: 20000,
        owned: 0
    },
    timeMachine: {
        cost: 1000000,
        cps: 100000,
        owned: 0
    }
};

let achievements = {
    firstClick: {
        unlocked: false,
        progress: 0,
        target: 1,
        bonus: 0.01, // +1% к кликам
        type: 'click'
    },
    cookieMaster: {
        unlocked: false,
        progress: 0,
        target: 1000,
        bonus: 0.05, // +5% к кликам
        type: 'click'
    },
    grandmaLover: {
        unlocked: false,
        progress: 0,
        target: 10,
        bonus: 0.1, // +10% к бабушкам
        type: 'upgrade',
        upgradeType: 'grandma'
    },
    factoryOwner: {
        unlocked: false,
        progress: 0,
        target: 5,
        bonus: 0.15, // +15% к фабрикам
        type: 'upgrade',
        upgradeType: 'factory'
    }
};

let clickUpgrades = {
    clickPower: {
        cost: 50,
        owned: 0,
        effect: 1
    },
    clickSpeed: {
        cost: 100,
        owned: 0,
        effect: 0.02
    }
};

// Сохранение игры
function saveGame() {
    const gameState = {
        cookies: cookies,
        cookiesPerSecond: cookiesPerSecond,
        upgrades: upgrades,
        achievements: achievements,
        totalClicks: totalClicks,
        clickMultiplier: clickMultiplier,
        upgradeMultipliers: upgradeMultipliers,
        clickUpgrades: clickUpgrades,
        clickPower: clickPower,
        clickSpeed: clickSpeed
    };
    localStorage.setItem('cookieClickerSave', JSON.stringify(gameState));
}

// Загрузка игры
function loadGame() {
    const savedGame = localStorage.getItem('cookieClickerSave');
    if (savedGame) {
        try {
            const gameState = JSON.parse(savedGame);
            // Добавьте проверки на существование всех полей
            cookies = Number(gameState.cookies) || 0;
            cookiesPerSecond = Number(gameState.cookiesPerSecond) || 0;
            // ... остальная логика загрузки
        } catch (e) {
            console.error('Ошибка загрузки игры:', e);
            resetGame();
        }
    }
}

// Автосохранение каждые 30 секунд
setInterval(saveGame, 30000);

// Обновление статистики
function updateStats() {
    document.getElementById('cookies').textContent = Math.floor(cookies);
    document.getElementById('cps').textContent = cookiesPerSecond;
}

// Обновление достижений
function updateAchievements() {
    for (const [id, achievement] of Object.entries(achievements)) {
        const achievementElement = document.getElementById(id);
        const progressElement = achievementElement.querySelector('.progress span');
        
        if (!achievement.unlocked) {
            if (achievement.type === 'click') {
                achievement.progress = totalClicks;
            } else if (achievement.type === 'upgrade') {
                achievement.progress = upgrades[achievement.upgradeType].owned;
            }
            
            progressElement.textContent = achievement.progress;
            
            if (achievement.progress >= achievement.target) {
                achievement.unlocked = true;
                achievementElement.classList.add('unlocked');
                showAchievementNotification(achievementElement.querySelector('p:first-child').textContent);
                
                if (achievement.type === 'click') {
                    clickMultiplier += achievement.bonus;
                } else if (achievement.type === 'upgrade') {
                    upgradeMultipliers[achievement.upgradeType] += achievement.bonus;
                }
                
                updateStats();
            }
        }
    }
}

// Покупка улучшения клика
function buyClickUpgrade(upgradeId) {
    const upgrade = clickUpgrades[upgradeId];
    if (cookies >= upgrade.cost) {
        cookies -= upgrade.cost;
        upgrade.owned += 1;
        upgrade.cost = Math.floor(upgrade.cost * 1.15);
        
        if (upgradeId === 'clickPower') {
            clickPower += upgrade.effect;
        } else if (upgradeId === 'clickSpeed') {
            clickSpeed += upgrade.effect;
        }
        
        updateStats();
        updateClickUpgradeButtons();
        saveGame();
        
        const upgradeSound = document.getElementById('upgradeSound');
        upgradeSound.currentTime = 0;
        upgradeSound.play();
    }
}

// Обновление кнопок улучшений клика
function updateClickUpgradeButtons() {
    for (const [id, upgrade] of Object.entries(clickUpgrades)) {
        const upgradeElement = document.getElementById(id);
        const costElement = upgradeElement.querySelector('.cost span');
        costElement.textContent = Math.floor(upgrade.cost);
        
        if (cookies >= upgrade.cost) {
            upgradeElement.classList.add('can-afford');
        } else {
            upgradeElement.classList.remove('can-afford');
        }
    }
}

// Показ уведомления о достижении
function showAchievementNotification(achievementName) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <p style="font-weight: bold; color: #8B4513; margin: 0;">Достижение разблокировано!</p>
        <p style="margin: 5px 0; color: #8B4513;">${achievementName}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Клик по печеньке
document.getElementById('cookie').addEventListener('click', function(event) {
    event.stopPropagation();
    totalClicks++;
    
    // Проверяем и инициализируем значения, если они undefined
    if (typeof clickPower === 'undefined') clickPower = 1;
    if (typeof clickMultiplier === 'undefined') clickMultiplier = 1;
    
    cookies += Math.floor(clickPower * clickMultiplier);
    updateStats();
    updateAchievements();
    updateClickUpgradeButtons();
    
    const clickSound = document.getElementById('clickSound');
    clickSound.currentTime = 0;
    clickSound.play();
    saveGame();
});

// Покупка улучшения
function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    if (!upgrade) return; // Защита от несуществующих улучшений
    
    if (cookies >= upgrade.cost) {
        cookies -= upgrade.cost;
        // Убедитесь, что cps и cost - числа
        const cpsBonus = Number(upgrade.cps) || 0;
        const multiplier = Number(upgradeMultipliers[upgradeId]) || 1;
        
        cookiesPerSecond += cpsBonus * multiplier;
        upgrade.owned += 1;
        upgrade.cost = Math.floor(Number(upgrade.cost) * 1.15);
        
        updateStats();
        updateUpgradeButtons();
        updateAchievements();
        saveGame();
        
        const upgradeSound = document.getElementById('upgradeSound');
        if (upgradeSound) {
            upgradeSound.currentTime = 0;
            upgradeSound.play();
        }
        
        const upgradeElement = document.getElementById(upgradeId);
        if (upgradeElement) {
            upgradeElement.classList.add('purchased');
            setTimeout(() => upgradeElement.classList.remove('purchased'), 500);
        }
    }
}

// Обновление кнопок улучшений
function updateUpgradeButtons() {
    for (const [id, upgrade] of Object.entries(upgrades)) {
        const upgradeElement = document.getElementById(id);
        const costElement = upgradeElement.querySelector('.cost span');
        costElement.textContent = Math.floor(upgrade.cost);
        
        if (cookies >= upgrade.cost) {
            upgradeElement.classList.add('can-afford');
            upgradeElement.style.pointerEvents = 'auto';
        } else {
            upgradeElement.classList.remove('can-afford');
            upgradeElement.style.pointerEvents = 'none';
        }
    }
}

// Управление громкостью
const volumeSlider = document.getElementById('volume');
const clickSound = document.getElementById('clickSound');
const upgradeSound = document.getElementById('upgradeSound');

volumeSlider.addEventListener('input', function() {
    const volume = this.value;
    clickSound.volume = volume;
    upgradeSound.volume = volume;
    localStorage.setItem('cookieClickerVolume', volume);
});

// Загрузка настроек громкости
const savedVolume = localStorage.getItem('cookieClickerVolume');
if (savedVolume) {
    volumeSlider.value = savedVolume;
    clickSound.volume = savedVolume;
    upgradeSound.volume = savedVolume;
} else {
    const defaultVolume = volumeSlider.value;
    clickSound.volume = defaultVolume;
    upgradeSound.volume = defaultVolume;
}

// Пассивный доход
setInterval(function() {
    cookies += cookiesPerSecond / 10;
    updateStats();
    updateUpgradeButtons();
}, 100);

// Загрузка игры при старте
loadGame();

// Инициализация
updateStats();
updateUpgradeButtons();

// Сброс игры
function resetGame() {
    if (confirm('Вы уверены, что хотите сбросить игру? Весь прогресс будет потерян.')) {
        cookies = 0;
        cookiesPerSecond = 0;
        upgrades = {
            grandma: {
                cost: 10,
                cps: 1,
                owned: 0
            },
            factory: {
                cost: 100,
                cps: 10,
                owned: 0
            },
            farm: {
                cost: 500,
                cps: 50,
                owned: 0
            },
            mine: {
                cost: 2000,
                cps: 200,
                owned: 0
            },
            shipment: {
                cost: 10000,
                cps: 1000,
                owned: 0
            },
            alchemy: {
                cost: 50000,
                cps: 5000,
                owned: 0
            },
            portal: {
                cost: 200000,
                cps: 20000,
                owned: 0
            },
            timeMachine: {
                cost: 1000000,
                cps: 100000,
                owned: 0
            }
        };
        localStorage.removeItem('cookieClickerSave');
        updateStats();
        updateUpgradeButtons();
    }
}

// Управление меню настроек
function toggleSettings() {
    const settingsMenu = document.getElementById('settingsMenu');
    settingsMenu.classList.toggle('active');
}

// Закрытие меню при клике вне его
document.addEventListener('click', function(event) {
    const settingsMenu = document.getElementById('settingsMenu');
    const settingsButton = document.querySelector('.settings-button');
    
    // Проверяем, был ли клик вне меню и кнопки
    if (!settingsMenu.contains(event.target) && !settingsButton.contains(event.target)) {
        settingsMenu.classList.remove('active');
    }
});

// Предотвращаем закрытие меню при клике внутри него
document.getElementById('settingsMenu').addEventListener('click', function(event) {
    event.stopPropagation();
}); 