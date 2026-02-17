/**
 * DASHBOARD LOGIC
 * Handles animations, clock, and PWA registration
 */

// Particles (Simplified Re-use)
(function () {
    const canvas = document.getElementById('bg-particles');
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const particleCount = window.innerWidth < 768 ? 20 : 40;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.2; // Slower for lobby
            this.vy = (Math.random() - 0.5) * 0.2;
            this.size = Math.random() * 2 + 1;
            this.baseColor = 'rgba(255, 255, 255, 0.4)';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = this.baseColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Always dark themed lobby
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.update();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// Clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.innerHTML = `${dateString.charAt(0).toUpperCase() + dateString.slice(1)} • ${timeString}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

// Service Worker Registration (Ensure PWA works from here)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('SW Registered from Dashboard'));
}
