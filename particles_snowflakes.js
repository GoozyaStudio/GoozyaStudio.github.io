const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');

let W, H;
let flakes = [];
let time = 0;
let mouse = { x: -9999, y: -9999 };

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// ================= НАСТРОЙКИ =================
const density = isMobile ? 0.000015 : 0.000035;
const MAX_FLAKES = isMobile ? 120 : 220;

const MAX_DIST = isMobile ? 90 : 140;
const MAX_LINKS_PER_FLAKE = isMobile ? 2 : 4;

const GOLD_CHANCE = 0.04; // 4% золотых
// ============================================

// ---------- resize ----------
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ---------- mouse ----------
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// ---------- utils ----------
function rand(a,b){ return Math.random()*(b-a)+a }

// ---------- create flake ----------
function createFlake() {
  const gold = Math.random() < GOLD_CHANCE;

  return {
    x: Math.random()*W,
    y: Math.random()*H,
    dx: 0,
    dy: 0,
    baseDy: gold ? rand(0.4,0.7) : rand(0.6,1.2),
    size: gold ? rand(5,6) : rand(3,6),
    sway: Math.random()*100,
    swayPower: gold ? 0.25 : 0.5,
    rot: Math.random()*Math.PI,
    rotSpeed: rand(-0.004,0.004),
    gold
  };
}

// ---------- snowflake draw ----------
function drawSnowflake(p){
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(p.rot);

  if (p.gold) {
    ctx.strokeStyle = 'rgba(255,215,140,0.95)';
    ctx.lineWidth = 1.6;
    if (!isMobile) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255,200,120,0.6)';
    }
  } else {
    ctx.strokeStyle = 'rgba(235,255,255,0.95)';
    ctx.lineWidth = 1.2;
  }

  for(let i=0;i<6;i++){
    ctx.rotate(Math.PI/3);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,p.size);
    ctx.stroke();
  }

  ctx.restore();
  ctx.shadowBlur = 0;
}

// ---------- garland ----------
function drawGarland(a, b, alpha){
  const bulbs = isMobile ? 3 : 6;
  const r = isMobile ? 0.6 : 1.2;

  for(let i=0;i<=bulbs;i++){
    const t = i / bulbs;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;

    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = `rgba(200,230,255,${alpha * 0.6})`;
    ctx.fill();
  }
}

// ---------- animate ----------
function animate(){
  ctx.clearRect(0,0,W,H);
  time++;

  // ===== ПЛАВНАЯ ПЛОТНОСТЬ =====
  const desired = Math.min(Math.floor(W * H * density), MAX_FLAKES);
  if (flakes.length < desired) flakes.push(createFlake());
  else if (flakes.length > desired) flakes.pop();

  // ===== ГИРЛЯНДЫ (ОПТИМИЗИРОВАННЫЕ) =====
  for (let i = 0; i < flakes.length; i++) {
    let links = 0;
    const a = flakes[i];

    for (let j = i + 1; j < flakes.length && links < MAX_LINKS_PER_FLAKE; j++) {
      const b = flakes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.hypot(dx, dy);

      if (d < MAX_DIST) {
        drawGarland(a, b, 1 - d / MAX_DIST);
        links++;
      }
    }
  }

  // ===== СНЕГ =====
  for (const p of flakes) {
    p.sway += 0.01;
    p.rot += p.rotSpeed;

    // отталкивание от мыши
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 140 && dist > 1) {
      const f = (1 - dist/140) * 0.4;
      p.dx += (dx/dist) * f;
      p.dy += (dy/dist) * f;
    }

    p.dx *= 0.95;
    p.dy *= 0.95;

    p.y += p.baseDy + p.dy;
    p.x += p.dx + Math.sin(p.sway) * p.swayPower;

    if (p.y > H + 40) {
      p.y = -40;
      p.x = Math.random() * W;
      p.dx = p.dy = 0;
    }
    if (p.x < -40) p.x = W + 40;
    if (p.x > W + 40) p.x = -40;

    drawSnowflake(p);
  }

  requestAnimationFrame(animate);
}

animate();
