window.balloon = document.getElementById('balloon');
window.scoreElement = document.getElementById('score');
window.gameOverScreen = document.getElementById('gameOver');
window.finalScoreElement = document.getElementById('finalScore');
window.restartButton = document.getElementById('restartButton');

window.balloon.style.display = 'none';
window.scoreElement.style.display = 'none';

// Physics variables
window.posX = window.innerWidth / 2;
window.posY = window.innerHeight / 2;
window.velocityX = 2;
window.velocityY = 0;
window.mouseX = 0;
window.mouseY = 0;

// Physics constants
window.gravity = 0.05;
window.bounceDecay = 0.8;
window.airResistance = 0.998;
window.buoyancy = 0.04;
window.pushForce = 0.4;
window.pushRadius = 50;

// Game constants
window.SPAWN_DELAY = 800;
window.MULTIPLIER_INCREASE = 0.01;
window.currentMultiplier = 1.0;
window.bonusMultiplier = 0.0;  // Track bonus multipliers separately
window.nailCount = 0;

// Helper function to calculate total multiplier
window.getTotalMultiplier = function() {
    return 1.0 + (window.nailCount * window.MULTIPLIER_INCREASE) + window.bonusMultiplier;
};
