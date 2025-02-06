class Nail {
    constructor(speed = null, x = null) {
        this.element = document.createElement('div');
        this.element.className = 'nail';
        document.body.appendChild(this.element);
        this.active = true;
        
        this.x = x ?? Math.random() * window.innerWidth;
        this.y = -50;
        this.rotation = Math.random() * 360;
        this.speed = speed ?? (3 + Math.random() * 7);
        this.rotationSpeed = (Math.random() - 0.5) * 8;
        
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }

    update() {
        if (!this.active) return false;
        
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        
        const dx = this.x - window.posX;
        const dy = this.y - window.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
            this.destroy();
            gameOver();
            return false;
        }
        
        if (this.y > window.innerHeight + 20) {
            window.nailCount++;
            window.currentMultiplier = window.getTotalMultiplier();
            window.scoreElement.textContent = `Score: ${window.nailCount} (${window.currentMultiplier.toFixed(2)}x)`;
            this.destroy();
            return false;
        }
        
        return true;
    }

    destroy() {
        if (this.active) {
            this.active = false;
            try {
                document.body.removeChild(this.element);
            } catch (e) {
                console.warn('Nail already removed');
            }
        }
    }
}

window.nails = [];
window.gameActive = false;

function gameOver() {
    if (!window.gameActive) return;
    window.gameActive = false;
    
    window.nails.forEach(nail => {
        if (nail && nail.active) {
            nail.destroy();
        }
    });
    window.nails = [];
    
    if (window.finalScoreElement) {
        window.finalScoreElement.textContent = window.nailCount;
    }
    if (window.gameOverScreen) {
        window.gameOverScreen.classList.remove('hidden');
    }
    
    document.dispatchEvent(new Event('gameOver'));
}

function spawnNail() {
    if (window.gameActive) {
        const groupSize = Math.floor(1 + (window.currentMultiplier - 1) * 2);
        const screenDivisions = window.innerWidth / groupSize;
        
        for (let i = 0; i < groupSize; i++) {
            const baseX = screenDivisions * i;
            const randomOffset = (Math.random() - 0.5) * screenDivisions * 0.8;
            const x = baseX + screenDivisions / 2 + randomOffset;
            window.nails.push(new Nail(null, x));
        }
    }
    window.spawnTimeout = setTimeout(spawnNail, window.SPAWN_DELAY);
} 