const balloon = document.getElementById('balloon');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
let score = 0;

// Hide game elements initially
balloon.style.display = 'none';
scoreElement.style.display = 'none';

// Create start screen
const startScreen = document.createElement('div');
startScreen.style.position = 'fixed';
startScreen.style.top = '0';
startScreen.style.left = '0';
startScreen.style.width = '100%';
startScreen.style.height = '100%';
startScreen.style.backgroundColor = '#222';  // Dark grey background
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

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.3; transform: scale(1); }
    }
`;
document.head.appendChild(style);

startScreen.appendChild(title);
startScreen.appendChild(clickToStart);
document.body.appendChild(startScreen);

// Physics variables
let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;
let velocityX = 2;
let velocityY = 0;
let mouseX = 0;
let mouseY = 0;

// Adjusted physics constants
const gravity = 0.05;        // Reduced gravity
const bounceDecay = 0.8;
const airResistance = 0.998; // Even more floaty
const buoyancy = 0.04;       // Gentle upward drift
const pushForce = 0.4;       // Gentle push force
const pushRadius = 50;      // How close the mouse needs to be

// Game constants
const SPAWN_DELAY = 800;          // Constant time between spawns (milliseconds)
const BASE_GROUP_SIZE = 1;        // Start with 1 nail
const MULTIPLIER_INCREASE = 0.01; // How much multiplier increases per nail dodged
let currentMultiplier = 1.0;     // Track the current multiplier

// Remove multiplier tracking
let nailCount = 0;  // Track total nails that have fallen

// Add background music
const bgMusic = new Audio('KIUC.mp3');
bgMusic.loop = true;
bgMusic.volume = 0;  // Start silent

// Ensure seamless looping
bgMusic.addEventListener('timeupdate', function() {
    const buffer = 0.44; // Buffer time before end to trigger loop
    if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play().catch(console.error);
    }
});

// Preload the music
bgMusic.preload = 'auto';
bgMusic.load();

// Create trippy background but hide it initially
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.opacity = '0';
document.body.prepend(canvas);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const ctx = canvas.getContext('2d');
let time = 0;
let hue = 0;

// Add milestone tracking
let lastMilestone = 0;
let shockwaveTime = 0;
let isShockwaveActive = false;

// Function to update music and background intensity
function updateIntensity() {
    // Calculate intensity (0 to 1) based on score for music only
    const musicIntensity = Math.min(1, nailCount / 200);
    
    // Update music volume
    bgMusic.volume = 0.7 * musicIntensity;
    
    // Check for new milestone (every 100 points)
    const currentMilestone = Math.floor(nailCount / 100);
    if (currentMilestone > lastMilestone) {
        lastMilestone = currentMilestone;
        isShockwaveActive = true;
        shockwaveTime = 0;
    }
}

function updateBackground() {
    time += 0.02;
    hue = (hue + 1) % 360;
    
    // Update intensities first
    updateIntensity();
    
    // Start with dark grey background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get current milestone level (0-4)
    const effectLevel = Math.floor(nailCount / 50);
    
    // Effect 1 (at 50+ points): Basic color waves
    if (effectLevel >= 1) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
        for (let x = 0; x < canvas.width; x += 5) {
            const y = canvas.height / 2 + Math.sin(x / 50 + time) * 100;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // Effect 2 (at 100+ points): Multiple plasma waves
    if (effectLevel >= 2) {
        for (let i = 1; i < 3; i++) {
            const offset = i * Math.PI * 2 / 3;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${(hue + i * 120) % 360}, 100%, 50%, 0.3)`;
            for (let x = 0; x < canvas.width; x += 5) {
                const y = canvas.height / 2 
                    + Math.cos(x / 30 - time * 2 + offset) * 50;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
    }
    
    // Effect 3 (at 150+ points): Floating particles
    if (effectLevel >= 3) {
        for (let i = 0; i < 30; i++) {
            const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(time * 0.7 + i) * 0.5 + 0.5) * canvas.height;
            const size = Math.sin(time + i) * 3 + 4;
            
            ctx.fillStyle = `hsla(${(hue + i * 7) % 360}, 100%, 50%, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Effect 4 (at 200+ points): Full particle system and more intense waves
    if (effectLevel >= 4) {
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time * 0.8 + i * 2) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(time * 0.5 + i * 2) * 0.5 + 0.5) * canvas.height;
            const size = Math.sin(time * 2 + i) * 5 + 6;
            
            ctx.fillStyle = `hsla(${(hue * 2 + i * 20) % 360}, 100%, 50%, 0.4)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Add milestone shockwave effect
    if (isShockwaveActive) {
        shockwaveTime += 0.05;
        const shockwaveProgress = Math.min(1, shockwaveTime);
        const shockwaveSize = shockwaveProgress * Math.max(canvas.width, canvas.height) * 1.5;
        const opacity = Math.max(0, 0.5 - shockwaveProgress * 0.5);
        
        // Draw shockwave
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, shockwaveSize, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
        ctx.lineWidth = 20 * (1 - shockwaveProgress);
        ctx.stroke();
        
        // Add flash effect
        ctx.fillStyle = `hsla(${hue}, 100%, 100%, ${opacity * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (shockwaveProgress >= 1) {
            isShockwaveActive = false;
        }
    }
    
    requestAnimationFrame(updateBackground);
}

// Start background animation
updateBackground();

// Track mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Nail management
class Nail {
    constructor(speed = null, x = null) {
        this.element = document.createElement('div');
        this.element.className = 'nail';
        document.body.appendChild(this.element);
        this.active = true;
        
        // Start above the screen
        this.x = x ?? Math.random() * window.innerWidth;
        this.y = -50;  // Start higher above the screen
        this.rotation = Math.random() * 360;
        this.speed = speed ?? (3 + Math.random() * 7);  // Speed range from 2 to 6
        this.rotationSpeed = (Math.random() - 0.5) * 8;
        
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }

    update() {
        if (!this.active) return false;
        
        // Remove multiplier from speed calculation
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        
        // Check collision with balloon
        const dx = this.x - posX;
        const dy = this.y - posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
            this.destroy();
            gameOver();
            return false;
        }
        
        // Remove if off screen and increment score
        if (this.y > window.innerHeight + 20) {
            nailCount++;
            // Increase multiplier for each nail dodged
            currentMultiplier = 1.0 + (nailCount * MULTIPLIER_INCREASE);
            scoreElement.textContent = `Score: ${nailCount} (${currentMultiplier.toFixed(2)}x)`;
            this.destroy();
            return false;
        }
        
        return true;
    }

    destroy() {
        if (this.active) {  // Only destroy if still active
            this.active = false;
            try {
                document.body.removeChild(this.element);
            } catch (e) {
                console.warn('Nail already removed');
            }
        }
    }
}

let nails = [];
let gameActive = false;

function gameOver() {
    if (!gameActive) return;
    
    gameActive = false;
    
    // Clean up all nails safely
    nails.forEach(nail => {
        if (nail && nail.active) {
            nail.destroy();
        }
    });
    nails = [];
    
    // Show game over screen with nail count
    if (finalScoreElement) {
        finalScoreElement.textContent = nailCount;
    }
    if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
    }
}

// Add restart handler
if (restartButton) {
    restartButton.addEventListener('click', () => {
        // Hide game over screen
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        
        // Try to start/adjust music
        if (bgMusic.paused) {
            startGame();
        }
        
        // Reset game state
        nailCount = 0;
        currentMultiplier = 1.0;
        scoreElement.textContent = `Score: 0 (1.00x)`;
        posX = window.innerWidth / 2;
        posY = window.innerHeight / 2;
        velocityX = (Math.random() - 0.5) * 2;
        velocityY = 0;
        
        // Clear any existing spawn timeouts
        if (window.spawnTimeout) {
            clearTimeout(window.spawnTimeout);
        }
        
        // Re-enable game after a short delay
        setTimeout(() => {
            gameActive = true;
            spawnNail();
        }, 100);
    });
}

// Spawn new nails periodically
function spawnNail() {
    if (gameActive) {
        // Calculate how many nails to spawn based on multiplier
        const groupSize = Math.floor(1 + (currentMultiplier - 1) * 2);  // 1 nail at 1x, 3 at 2x, 5 at 3x, etc.
        
        // Create an array of evenly spaced x positions across the screen
        const screenDivisions = window.innerWidth / groupSize;
        
        // Spawn the group of nails
        for(let i = 0; i < groupSize; i++) {
            // Calculate base position in this division
            const baseX = screenDivisions * i;
            // Add some randomness within the division
            const randomOffset = (Math.random() - 0.5) * screenDivisions * 0.8;
            const x = baseX + screenDivisions/2 + randomOffset;
            
            nails.push(new Nail(null, x));  // Let the constructor handle random speed
        }
    }

    // Use constant spawn delay
    window.spawnTimeout = setTimeout(spawnNail, SPAWN_DELAY);
}

function updateBalloonPosition() {
    if (!gameActive) return;
    
    // Calculate distance between mouse and balloon
    const dx = mouseX - posX;
    const dy = mouseY - posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Apply push force if mouse is close enough
    if (distance < pushRadius) {
        const pushX = (posX - mouseX) / distance;
        const pushY = (posY - mouseY) / distance;
        const intensity = (1 - distance / pushRadius) * pushForce;
        velocityX += pushX * intensity;
        velocityY += pushY * intensity;
    }

    // Apply physics
    velocityY += gravity;    // Gravity pulls down
    velocityY -= buoyancy;   // Buoyancy pushes up
    
    // Apply air resistance
    velocityY *= airResistance;
    velocityX *= airResistance;
    
    // Update position
    posX += velocityX;
    posY += velocityY;

    // Bounce off walls with adjusted boundaries
    if (posX > window.innerWidth - 25) {
        posX = window.innerWidth - 25;
        velocityX *= -bounceDecay;
    }
    if (posX < 25) {
        posX = 25;
        velocityX *= -bounceDecay;
    }

    // Game over if balloon touches bottom
    if (posY > window.innerHeight - 25) {
        gameOver();
    }

    // Ceiling bounce
    if (posY < 25) {
        posY = 25;
        velocityY = Math.abs(velocityY) * 0.5;
    }

    // Update balloon position
    balloon.style.left = posX + 'px';
    balloon.style.top = posY + 'px';
    
    // Update balloon name position to follow slightly above the balloon
    const balloonName = document.getElementById('balloonName');
    if (balloonName) {
        balloonName.style.left = (posX - balloonName.offsetWidth/2) + 'px';
        balloonName.style.top = (posY - 30) + 'px';  // 30px above the balloon
    }

    // Update all nails
    nails = nails.filter(nail => nail.update());
}

// Function to start the game with explosion effect
function startGame() {
    // Start music with preload check
    if (bgMusic.readyState >= 2) {  // Have enough data to play
        bgMusic.currentTime = 0;
        bgMusic.play().catch(console.error);
    } else {
        bgMusic.addEventListener('canplay', () => {
            bgMusic.currentTime = 0;
            bgMusic.play().catch(console.error);
        }, { once: true });
    }
    
    // Create explosion effect
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
    
    // Trigger explosion animation
    setTimeout(() => {
        explosion.style.width = '300vw';
        explosion.style.height = '300vh';
        explosion.style.opacity = '0';
    }, 50);
    
    // Remove start screen
    startScreen.style.transform = 'scale(1.5)';
    startScreen.style.opacity = '0';
    setTimeout(() => startScreen.remove(), 500);
    
    // Show game elements
    setTimeout(() => {
        balloon.style.display = '';
        scoreElement.style.display = '';
        canvas.style.opacity = '1';
        explosion.remove();
        scoreElement.textContent = 'Score: 0 (1.00x)';
        
        // Start the game
        gameActive = true;
        setTimeout(spawnNail, 1000);
    }, 500);
}

// Start game on click
startScreen.addEventListener('click', startGame, { once: true });

// Game loop
setInterval(updateBalloonPosition, 16); 