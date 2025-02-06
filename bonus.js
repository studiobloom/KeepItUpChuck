class BonusOrb {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'bonus-orb';
        
        // Add the +0.10x text
        const bonusText = document.createElement('div');
        bonusText.className = 'bonus-text';
        bonusText.textContent = '+0.10x';
        this.element.appendChild(bonusText);
        
        document.body.appendChild(this.element);
        
        // Random starting position
        this.x = Math.random() * (window.innerWidth - 40);
        this.y = Math.random() * (window.innerHeight - 40);
        
        // Random velocity
        this.velocityX = (Math.random() - 0.5) * 6;
        if (Math.abs(this.velocityX) < 2) {
            this.velocityX = this.velocityX < 0 ? -2 : 2;
        }
        
        this.velocityY = (Math.random() - 0.5) * 6;
        if (Math.abs(this.velocityY) < 2) {
            this.velocityY = this.velocityY < 0 ? -2 : 2;
        }
        
        this.update = this.update.bind(this);
        this.checkCollision = this.checkCollision.bind(this);
        this.updatePosition();
        
        requestAnimationFrame(this.update);
    }
    
    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    checkCollision() {
        const dx = window.mouseX - (this.x + 20);
        const dy = window.mouseY - (this.y + 20);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
            window.bonusMultiplier += 0.1;  // Add to bonus multiplier
            window.currentMultiplier = window.getTotalMultiplier();
            window.scoreElement.textContent = `Score: ${window.nailCount} (${window.currentMultiplier.toFixed(2)}x)`;
            this.collect();
            return true;
        }
        return false;
    }
    
    collect() {
        this.element.classList.add('collected');
        setTimeout(() => {
            this.destroy();
            setTimeout(() => {
                if (window.gameActive) {
                    window.currentBonusOrb = new BonusOrb();
                }
            }, 3000);
        }, 300);
    }
    
    update() {
        if (!this.element) return;
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Bounce off walls
        if (this.x <= 0 || this.x >= window.innerWidth - 40) {
            this.velocityX *= -1;
            this.x = Math.max(0, Math.min(this.x, window.innerWidth - 40));
        }
        if (this.y <= 0 || this.y >= window.innerHeight - 40) {
            this.velocityY *= -1;
            this.y = Math.max(0, Math.min(this.y, window.innerHeight - 40));
        }
        
        this.updatePosition();
        
        if (!this.checkCollision()) {
            requestAnimationFrame(this.update);
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

document.addEventListener('gameStarted', () => {
    if (window.currentBonusOrb) {
        window.currentBonusOrb.destroy();
    }
    window.bonusMultiplier = 0.0;  // Reset bonus multiplier on game start
    window.currentBonusOrb = new BonusOrb();
});

document.addEventListener('gameOver', () => {
    if (window.currentBonusOrb) {
        window.currentBonusOrb.destroy();
        window.currentBonusOrb = null;
    }
}); 