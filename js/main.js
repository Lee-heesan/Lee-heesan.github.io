/* Liquid Blob 로직 */
const svg = document.getElementById("svg");
const path = document.getElementById("blob");
const CENTER = { x: 500, y: 500 };
const POINTS = 20; 
const RADIUS = 350;
const VISCOSITY = 0.05;
const ELASTICITY = 0.05;

let points = [];
for (let i = 0; i < POINTS; i++) {
  const angle = (i / POINTS) * Math.PI * 2;
  points.push({
    x: CENTER.x + Math.cos(angle) * RADIUS,
    y: CENTER.y + Math.sin(angle) * RADIUS,
    originX: CENTER.x + Math.cos(angle) * RADIUS,
    originY: CENTER.y + Math.sin(angle) * RADIUS,
    vx: 0, vy: 0, angle
  });
}

let mouse = { x: 0, y: 0 };
let isMoved = false;

function spline(points) {
  if (!points.length) return "";
  const p = i => points[(i + points.length) % points.length];
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d + " Z";
}

function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.0015;
  
  points.forEach(pt => {
    const noiseX = Math.cos(pt.angle * 4 + time) * 15;
    const noiseY = Math.sin(pt.angle * 3 + time) * 15;
    const dx = mouse.x - pt.x;
    const dy = mouse.y - pt.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 300 && isMoved) {
      const force = (300 - dist) / 300;
      const ang = Math.atan2(dy, dx);
      pt.vx -= Math.cos(ang) * force * 2;
      pt.vy -= Math.sin(ang) * force * 2;
    }
    const ox = pt.originX + noiseX;
    const oy = pt.originY + noiseY;
    pt.vx += (ox - pt.x) * ELASTICITY;
    pt.vy += (oy - pt.y) * ELASTICITY;
    pt.vx *= (1 - VISCOSITY);
    pt.vy *= (1 - VISCOSITY);
    pt.x += pt.vx;
    pt.y += pt.vy;
  });
  path.setAttribute("d", spline(points));
}

window.addEventListener("mousemove", e => {
  isMoved = true;
  const rect = svg.getBoundingClientRect();
  const scaleX = 1000 / rect.width;
  const scaleY = 1000 / rect.height;
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top) * scaleY;
  clearTimeout(window.mouseTimer);
  window.mouseTimer = setTimeout(() => isMoved = false, 1000);
});
animate();

/* ====================================
   Project Scroll Navigation
   ==================================== */

// 프로젝트 카드 클릭 시 해당 상세 섹션으로 이동
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      // 1. 카드의 data-id 가져오기 (1, 2, 3...)
      const id = card.getAttribute("data-id");
      
      // 2. 이동할 목표 섹션 찾기 (id="p-detail-1")
      const targetSection = document.getElementById(`p-detail-${id}`);

      // 3. 부드럽게 스크롤 이동
      if (targetSection) {
        targetSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' // 화면 중앙에 오도록 정렬
        });
      }
    });
  });
});

// 기존 Liquid Blob Animation 코드는 유지해주세요.
