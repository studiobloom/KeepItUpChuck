const balloon = document.getElementById('balloon');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
let score = 0;

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
const pushRadius = 100;      // How close the mouse needs to be

// Add these constants at the top with other constants
const BASE_SPAWN_DELAY = 3000;    // Start slower (3 seconds)
const MIN_SPAWN_DELAY = 200;      // Don't get quite as fast
const DIFFICULTY_SCALE = 200;     // Much more gradual scaling

// Add this with other variables at the top
let nailCount = 0;  // Track total nails that have fallen

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
        this.active = true;  // Track if nail is still active
        
        // Random starting position at top of screen
        this.x = x ?? Math.random() * window.innerWidth;
        this.y = -20;
        this.rotation = Math.random() * 360;
        this.speed = speed ?? (2 + Math.random() * 3);  // Varied speeds
        this.rotationSpeed = (Math.random() - 0.5) * 8;  // Some nails spin faster!
        
        // Update nail appearance
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }

    update() {
        if (!this.active) return false;
        
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        
        // Check collision with balloon
        const dx = this.x - posX;
        const dy = this.y - posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {  // Reduced from 30 to 15 for tighter hitbox
            this.destroy();
            gameOver();
            return false;
        }
        
        // Remove if off screen and increment score
        if (this.y > window.innerHeight + 20) {
            nailCount++;  // Increment nail count when a nail falls off screen
            scoreElement.textContent = 'Nails Dodged: ' + nailCount;
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
let gameActive = true;

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
        
        // Reset game state
        nailCount = 0;  // Reset nail count instead of score
        scoreElement.textContent = 'Nails Dodged: 0';
        posX = window.innerWidth / 2;
        posY = window.innerHeight / 2;
        velocityX = (Math.random() - 0.5) * 2;
        velocityY = 0;
        
        // Re-enable game after a short delay
        setTimeout(() => {
            gameActive = true;
            setTimeout(spawnNail, 1000);
        }, 100);
    });
}

// Spawn multiple nails in patterns
function spawnNailPattern() {
    if (!gameActive) return;

    // Calculate pattern intensity based on nail count
    const intensity = Math.min(3, Math.log(nailCount / 200 + 1));
    
    // Random pattern selection
    const pattern = Math.floor(Math.random() * 4);
    
    switch(pattern) {
        case 0: // Line of nails
            const x = Math.random() * window.innerWidth;
            const lineCount = Math.floor(4 + intensity * 2);
            for (let i = 0; i < lineCount; i++) {
                nails.push(new Nail(4, x + (Math.random() - 0.5) * 30));
            }
            break;
            
        case 1: // Spread pattern
            const spreadCount = Math.floor(2 + intensity * 1.5);
            for (let i = 0; i < spreadCount; i++) {
                nails.push(new Nail(3 + Math.random() * 2));
            }
            break;
            
        case 2: // Rain shower
            const rainCount = Math.floor(6 + intensity * 3);
            for (let i = 0; i < rainCount; i++) {
                setTimeout(() => {
                    if (gameActive) {
                        nails.push(new Nail());
                    }
                }, i * 50);
            }
            break;
            
        case 3: // Fast nail burst
            const burstCount = Math.floor(3 + intensity * 2);
            for (let i = 0; i < burstCount; i++) {
                nails.push(new Nail(5 + Math.random() * 2));
            }
            break;
    }
}

// Spawn new nails periodically with increasing intensity
function spawnNail() {
    if (gameActive) {
        spawnNailPattern();
        
        // Calculate extra nails chance based on nail count
        const extraNailsChance = Math.min(0.8, Math.log(nailCount / 400 + 1) / 2);
        
        // Potentially spawn multiple individual nails
        for (let i = 0; i < 3; i++) {
            if (Math.random() < extraNailsChance) {
                nails.push(new Nail());
            }
        }
    }

    // Calculate next spawn delay using nail count
    const spawnDelay = BASE_SPAWN_DELAY * Math.exp(-nailCount / DIFFICULTY_SCALE) + MIN_SPAWN_DELAY;
    setTimeout(spawnNail, spawnDelay);
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

// Start spawning nails
spawnNail();

// Game loop
setInterval(updateBalloonPosition, 16); 