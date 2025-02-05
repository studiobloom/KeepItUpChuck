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

// Create trippy background but make it visible from start
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.opacity = '1';  // Make canvas visible from start
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

// Function to update background intensity
function updateIntensity() {
    // Check for new milestone (every 50 points)
    const currentMilestone = Math.floor(nailCount / 50);
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
    
    // Always start with dark grey background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Layer effects based on score milestones
    
    // 50+ points: Gradient background and energy rings
    if (nailCount >= 50) {
        // Multiple gradients across screen
        for(let x = 0; x < 2; x++) {
            for(let y = 0; y < 2; y++) {
                const gradient = ctx.createRadialGradient(
                    canvas.width * (x + 0.5) / 2, canvas.height * (y + 0.5) / 2, 0,
                    canvas.width * (x + 0.5) / 2, canvas.height * (y + 0.5) / 2, canvas.width/2
                );
                gradient.addColorStop(0, `hsla(${(hue + x * 120 + y * 60) % 360}, 70%, 20%, 0.5)`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        // Energy rings spread across screen
        for (let i = 0; i < 8; i++) {
            const centerX = (i % 3) * canvas.width/2;
            const centerY = Math.floor(i / 3) * canvas.height/2;
            const radius = ((time * 40 + i * 100) % (Math.max(canvas.width, canvas.height)/2)) * 1.2;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${(hue + i * 45) % 360}, 100%, 50%, 0.2)`;
            ctx.lineWidth = 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 100+ points: Add spiral waves
    if (nailCount >= 100) {
        // Multiple spiral sets across screen
        for(let sx = 0; sx < 3; sx++) {
            for(let sy = 0; sy < 2; sy++) {
                ctx.save();
                ctx.translate(canvas.width * (sx + 1) / 4, canvas.height * (sy + 1) / 3);
                ctx.rotate(time * 0.5);
                
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${(hue + i * 60 + sx * 30 + sy * 45) % 360}, 100%, 50%, 0.15)`;
                    ctx.lineWidth = 2;
                    
                    for (let r = 0; r < 120; r += 10) {
                        const x = Math.cos(angle + r * 0.05 + time) * r;
                        const y = Math.sin(angle + r * 0.05 + time) * r;
                        if (r === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    }
    
    // 150+ points: Add particle field
    if (nailCount >= 150) {
        // Particles spread across entire screen
        for (let i = 0; i < 40; i++) {
            const baseX = (i % 4) * canvas.width/4;
            const baseY = Math.floor(i / 4) * canvas.height/4;
            const angle = (i / 40) * Math.PI * 2 + time;
            const radius = 100 + Math.sin(time * 2 + i) * 50;
            const x = baseX + Math.cos(angle) * radius;
            const y = baseY + Math.sin(angle) * radius;
            const size = Math.sin(time * 2 + i) * 3 + 4;
            
            ctx.fillStyle = `hsla(${(hue + i * 9) % 360}, 100%, 60%, 0.25)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 200+ points: Add vortex patterns
    if (nailCount >= 200) {
        // Multiple vortexes across screen
        for(let vx = 0; vx < 3; vx++) {
            for(let vy = 0; vy < 2; vy++) {
                ctx.save();
                ctx.translate(canvas.width * (vx + 1) / 4, canvas.height * (vy + 1) / 3);
                ctx.rotate(time + vx * Math.PI/3);
                
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * 80;
                    const y = Math.sin(angle) * 80;
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${(hue + i * 45 + vx * 30 + vy * 60) % 360}, 100%, 50%, 0.25)`;
                    ctx.lineWidth = 2;
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(
                        x * 1.5, y * 1.5,
                        x * (2 + Math.sin(time * 2)), y * (2 + Math.cos(time * 2))
                    );
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    }
    
    // Add milestone shockwave effect
    if (isShockwaveActive) {
        shockwaveTime += 0.05;
        const shockwaveProgress = Math.min(1, shockwaveTime);
        const shockwaveSize = shockwaveProgress * Math.max(canvas.width, canvas.height) * 1.5;
        const opacity = Math.max(0, 0.5 - shockwaveProgress * 0.5);
        
        // Draw multiple shockwave rings from different points
        for(let sx = 0; sx < 2; sx++) {
            for(let sy = 0; sy < 2; sy++) {
                const centerX = canvas.width * (sx + 1) / 3;
                const centerY = canvas.height * (sy + 1) / 3;
                
                for (let i = 0; i < 3; i++) {
                    const ringSize = shockwaveSize * (0.8 + i * 0.2);
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, ringSize * 0.7, 0, Math.PI * 2);
                    ctx.strokeStyle = `hsla(${(hue + i * 120 + sx * 60 + sy * 30) % 360}, 100%, 50%, ${opacity * (1 - i * 0.2)})`;
                    ctx.lineWidth = 15 * (1 - shockwaveProgress) * (1 - i * 0.2);
                    ctx.stroke();
                }
            }
        }
        
        // Add flash effect
        ctx.fillStyle = `hsla(${hue}, 100%, 100%, ${opacity * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (shockwaveProgress >= 1) {
            isShockwaveActive = false;
        }
    }
    
    requestAnimationFrame(updateBackground);
}

// Start the background animation immediately
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