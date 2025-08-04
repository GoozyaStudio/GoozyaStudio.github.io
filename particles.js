const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');

let W, H;
let particles = [];
let mouse = { x: -9999, y: -9999 };
let density = 0.00005; // particles per pixel
let desiredCount = 0;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    desiredCount = Math.floor(W * H * density);
}
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function addParticle() {
    particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
    });
}

function animate() {
    ctx.clearRect(0, 0, W, H);

    // 🔁 Плавное добавление/удаление частиц
    if (particles.length < desiredCount) {
        addParticle();
    } else if (particles.length > desiredCount) {
        particles.pop(); // удаляем по одной
    }

    // Рисуем линии
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.strokeStyle = `rgba(0,255,255,${1 - dist / 120})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }

    // Обновляем и рисуем частицы
    for (let p of particles) {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;

        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const dist = Math.sqrt(mx * mx + my * my);
        if (dist < 100) {
            const angle = Math.atan2(my, mx);
            p.x += Math.cos(angle) * 1.5;
            p.y += Math.sin(angle) * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'aqua';
        ctx.fill();
    }

    requestAnimationFrame(animate);
}

animate();
