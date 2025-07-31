const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');
let W, H;
let particleCount = 0;
let particles = [];


function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  particleCount = Math.floor((W * H) / 10000); // можно варьировать делитель
  resetParticles(); // пересоздаем при каждом ресайзе
}
window.addEventListener('resize', resize);

function resetParticles() {
  // Удаляем старые элементы с экрана
  for (let p of particles) {
    if (p.el && p.el.remove) p.el.remove();
  }

  particles = [];

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    document.body.appendChild(p);
    const x = Math.random() * W;
    const y = Math.random() * H;
    particles.push({
      el: p,
      x, y,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5
    });
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
  }
}

let mouse = { x: -9999, y: -9999 };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.clearRect(0, 0, W, H);

  for (let p of particles) {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0) { p.x = 0; p.dx *= -1; }
    if (p.x > W) { p.x = W; p.dx *= -1; }
    if (p.y < 0) { p.y = 0; p.dy *= -1; }
    if (p.y > H) { p.y = H; p.dy *= -1; }

    const distX = p.x - mouse.x;
    const distY = p.y - mouse.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    if (dist < 100) {
      const angle = Math.atan2(distY, distX);
      p.x += Math.cos(angle) * 3;
      p.y += Math.sin(angle) * 3;
    }

    p.el.style.left = `${p.x}px`;
    p.el.style.top = `${p.y}px`;
  }

  // соединения
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${1 - dist / 120})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x + 2.5, p1.y + 2.5);
        ctx.lineTo(p2.x + 2.5, p2.y + 2.5);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

resize(); // запускаем в первый раз
animate();
