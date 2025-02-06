const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.opacity = '1';  // Canvas is visible from the start

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
let lastMilestone = 0;
let shockwaveTime = 0;
let isShockwaveActive = false;

function updateIntensity() {
    const currentMilestone = Math.floor(window.nailCount / 50);
    if (currentMilestone > lastMilestone) {
        lastMilestone = currentMilestone;
        isShockwaveActive = true;
        shockwaveTime = 0;
    }
}

function updateBackground() {
    time += 0.02;
    hue = (hue + 1) % 360;
    updateIntensity();
    
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (window.nailCount >= 50) {
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                const gradient = ctx.createRadialGradient(
                    canvas.width * (x + 0.5) / 2, canvas.height * (y + 0.5) / 2, 0,
                    canvas.width * (x + 0.5) / 2, canvas.height * (y + 0.5) / 2, canvas.width / 2
                );
                gradient.addColorStop(0, `hsla(${(hue + x * 120 + y * 60) % 360}, 70%, 20%, 0.5)`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        for (let i = 0; i < 8; i++) {
            const centerX = (i % 3) * canvas.width / 2;
            const centerY = Math.floor(i / 3) * canvas.height / 2;
            const radius = ((time * 40 + i * 100) % (Math.max(canvas.width, canvas.height) / 2)) * 1.2;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${(hue + i * 45) % 360}, 100%, 50%, 0.2)`;
            ctx.lineWidth = 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    if (window.nailCount >= 100) {
        for (let sx = 0; sx < 3; sx++) {
            for (let sy = 0; sy < 2; sy++) {
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
    
    if (window.nailCount >= 150) {
        for (let i = 0; i < 40; i++) {
            const baseX = (i % 4) * canvas.width / 4;
            const baseY = Math.floor(i / 4) * canvas.height / 4;
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
    
    if (window.nailCount >= 200) {
        for (let vx = 0; vx < 3; vx++) {
            for (let vy = 0; vy < 2; vy++) {
                ctx.save();
                ctx.translate(canvas.width * (vx + 1) / 4, canvas.height * (vy + 1) / 3);
                ctx.rotate(time + vx * Math.PI / 3);
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * 80;
                    const y = Math.sin(angle) * 80;
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${(hue + i * 45 + vx * 30 + vy * 60) % 360}, 100%, 50%, 0.25)`;
                    ctx.lineWidth = 2;
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(x * 1.5, y * 1.5, x * (2 + Math.sin(time * 2)), y * (2 + Math.cos(time * 2)));
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    }
    
    if (isShockwaveActive) {
        shockwaveTime += 0.05;
        const shockwaveProgress = Math.min(1, shockwaveTime);
        const shockwaveSize = shockwaveProgress * Math.max(canvas.width, canvas.height) * 1.5;
        const opacity = Math.max(0, 0.5 - shockwaveProgress * 0.5);
        
        for (let sx = 0; sx < 2; sx++) {
            for (let sy = 0; sy < 2; sy++) {
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