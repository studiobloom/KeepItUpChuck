const startScreen = document.createElement('div');
startScreen.style.position = 'fixed';
startScreen.style.top = '0';
startScreen.style.left = '0';
startScreen.style.width = '100%';
startScreen.style.height = '100%';
startScreen.style.backgroundColor = '#222';
startScreen.style.color = '#fff';
startScreen.style.display = 'flex';
startScreen.style.flexDirection = 'column';
startScreen.style.justifyContent = 'center';
startScreen.style.alignItems = 'center';
startScreen.style.cursor = 'pointer';
startScreen.style.zIndex = '1000';
startScreen.style.transition = 'transform 0.5s, opacity 0.5s';

const title = document.createElement('div');
title.textContent = 'Keep It Up, Chuck!';
title.style.fontSize = '48px';
title.style.marginBottom = '20px';
title.style.fontFamily = 'Arial, sans-serif';
title.style.textAlign = 'center';

const clickToStart = document.createElement('div');
clickToStart.textContent = 'Click to Start';
clickToStart.style.fontSize = '24px';
clickToStart.style.fontFamily = 'Arial, sans-serif';
clickToStart.style.opacity = '0';
clickToStart.style.animation = 'pulse 1.5s infinite';

const styleTag = document.createElement('style');
styleTag.textContent = `
    @keyframes pulse {
        0% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.3; transform: scale(1); }
    }
`;
document.head.appendChild(styleTag);

startScreen.appendChild(title);
startScreen.appendChild(clickToStart);
document.body.appendChild(startScreen);

function startGame() {
    const explosion = document.createElement('div');
    explosion.style.position = 'fixed';
    explosion.style.top = '50%';
    explosion.style.left = '50%';
    explosion.style.width = '10px';
    explosion.style.height = '10px';
    explosion.style.backgroundColor = '#fff';
    explosion.style.borderRadius = '50%';
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
    document.body.appendChild(explosion);
    
    setTimeout(() => {
        explosion.style.width = '300vw';
        explosion.style.height = '300vh';
        explosion.style.opacity = '0';
    }, 50);
    
    startScreen.style.transform = 'scale(1.5)';
    startScreen.style.opacity = '0';
    setTimeout(() => startScreen.remove(), 500);
    
    setTimeout(() => {
        window.balloon.style.display = '';
        window.scoreElement.style.display = '';
        explosion.remove();
        window.scoreElement.textContent = 'Score: 0 (1.00x)';
        window.gameActive = true;
        setTimeout(spawnNail, 1000);
    }, 500);
}

startScreen.addEventListener('click', startGame, { once: true });

if (window.restartButton) {
    window.restartButton.addEventListener('click', () => {
        if (window.gameOverScreen) {
            window.gameOverScreen.classList.add('hidden');
        }
        window.nailCount = 0;
        window.currentMultiplier = 1.0;
        window.scoreElement.textContent = 'Score: 0 (1.00x)';
        window.posX = window.innerWidth / 2;
        window.posY = window.innerHeight / 2;
        window.velocityX = (Math.random() - 0.5) * 2;
        window.velocityY = 0;
        if (window.spawnTimeout) {
            clearTimeout(window.spawnTimeout);
        }
        setTimeout(() => {
            window.gameActive = true;
            spawnNail();
        }, 100);
    });
} 