const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');

let W, H, time = 0;
let mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
let scrollFactor = 1;

const MAX_DIST = 150;
const MIN_DIST = 50;

const layers = [
    { count: 45, speed: 0.5, size: [5, 7], sway: 0.15 },
    { count: 30, speed: 0.8, size: [7, 10], sway: 0.35 },
    { count: 20, speed: 1.2, size: [10, 14], sway: 0.7 }
];

let flakes = [];
let links = [];

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', e => {
    mouse.vx = e.clientX - mouse.x;
    mouse.vy = e.clientY - mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('scroll', () => {
    scrollFactor = Math.max(0.4, 1 - window.scrollY / 800);
});

function rand(a, b) { return Math.random() * (b - a) + a; }
function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

function createFlake(layer, accent = false) {
    return {
        x: Math.random() * W,
        y: Math.random() * H,
        dx: 0,
        dy: 0,
        baseDy: layer.speed,
        size: rand(...layer.size) * (accent ? 1.3 : 1),
        sway: Math.random() * 100,
        swayPower: layer.sway,
        rot: Math.random() * Math.PI,
        rotSpeed: rand(-0.004, 0.004),
        accent
    };
}

// снежинки
layers.forEach(l => {
    for (let i = 0; i < l.count; i++) flakes.push(createFlake(l));
});
for (let i = 0; i < 4; i++) flakes.push(createFlake(layers[2], true));

// гирлянда
for (let i = 0; i < flakes.length; i++) {
    for (let j = i + 1; j < flakes.length; j++) links.push({ a: flakes[i], b: flakes[j] });
}

function drawSnowflake(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    ctx.strokeStyle = p.accent
        ? 'rgba(255,230,170,0.9)'
        : 'rgba(235,255,255,0.95)';
    ctx.lineWidth = p.accent ? 1.5 : 1.2;

    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, p.size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, p.size * 0.65);
        ctx.lineTo(p.size * 0.35, p.size * 0.45);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, p.size * 0.65);
        ctx.lineTo(-p.size * 0.35, p.size * 0.45);
        ctx.stroke();
    }

    ctx.restore();
}

const GARLAND_COLORS = [
    [255, 195, 195],
    [200, 255, 225],
    [200, 220, 255],
    [255, 235, 200]
];

function drawGarland(a, b, strength) {
    const bulbs = 7;
    for (let i = 0; i <= bulbs; i++) {
        const k = i / bulbs;
        const x = a.x + (b.x - a.x) * k;
        const y = a.y + (b.y - a.y) * k;
        const c = GARLAND_COLORS[i % GARLAND_COLORS.length];
        const pulse = 0.6 + Math.sin(time * 0.04 + i) * 0.25;
        const alpha = strength * pulse * scrollFactor * 0.75;

        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawFog() {
    const g = ctx.createLinearGradient(0, H * 0.75, 0, H);
    g.addColorStop(0, 'rgba(200,255,255,0)');
    g.addColorStop(1, 'rgba(180,220,255,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.75, W, H);
}

function animate() {
    ctx.clearRect(0, 0, W, H);
    time++;

    for (const l of links) {
        const dx = l.a.x - l.b.x;
        const dy = l.a.y - l.b.y;
        const d = Math.hypot(dx, dy);
        if (d < MAX_DIST) drawGarland(l.a, l.b, smoothstep(MAX_DIST, MIN_DIST, d));
    }

    for (const p of flakes) {
        p.sway += 0.01;
        p.rot += p.rotSpeed;

        // отталкивание от мыши
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160 && dist > 1) {
            const force = (1 - dist / 160) * 0.5;
            p.dx += (dx / dist) * force;
            p.dy += (dy / dist) * force;
        }

        // демпфирование скорости
        p.dx *= 0.96;
        p.dy *= 0.96;

        // вертикальная скорость + падение
        p.y += p.baseDy + p.dy;
        p.x += p.dx + Math.sin(p.sway) * p.swayPower;

        if (p.y > H + 40) {
            p.y = -40;
            p.x = Math.random() * W;
            p.dx = 0;
            p.dy = 0;
        }
        if (p.x < -40) p.x = W + 40;
        if (p.x > W + 40) p.x = -40;

        drawSnowflake(p);
    }

    drawFog();
    requestAnimationFrame(animate);
}

animate();
