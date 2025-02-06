document.addEventListener('mousemove', (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
});

function updateBalloonPosition() {
    if (!window.gameActive) return;
    
    const dx = window.mouseX - window.posX;
    const dy = window.mouseY - window.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < window.pushRadius) {
        const pushX = (window.posX - window.mouseX) / distance;
        const pushY = (window.posY - window.mouseY) / distance;
        const intensity = (1 - distance / window.pushRadius) * window.pushForce;
        window.velocityX += pushX * intensity;
        window.velocityY += pushY * intensity;
    }
    
    window.velocityY += window.gravity;    // Gravity
    window.velocityY -= window.buoyancy;   // Buoyancy
    
    window.velocityY *= window.airResistance;
    window.velocityX *= window.airResistance;
    
    window.posX += window.velocityX;
    window.posY += window.velocityY;
    
    if (window.posX > window.innerWidth - 25) {
        window.posX = window.innerWidth - 25;
        window.velocityX *= -window.bounceDecay;
    }
    if (window.posX < 25) {
        window.posX = 25;
        window.velocityX *= -window.bounceDecay;
    }
    
    if (window.posY > window.innerHeight - 25) {
        gameOver();
    }
    
    if (window.posY < 25) {
        window.posY = 25;
        window.velocityY = Math.abs(window.velocityY) * 0.5;
    }
    
    window.balloon.style.left = window.posX + 'px';
    window.balloon.style.top = window.posY + 'px';
    
    const balloonName = document.getElementById('balloonName');
    if (balloonName) {
        balloonName.style.left = (window.posX - balloonName.offsetWidth / 2) + 'px';
        balloonName.style.top = (window.posY - 30) + 'px';
    }
    
    window.nails = window.nails.filter(nail => nail.update());
}

// At the end of balloon.js, add the game loop to update balloon position
setInterval(updateBalloonPosition, 16); 