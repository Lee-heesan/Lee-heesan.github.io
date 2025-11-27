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

// Tech Stack Tab Switching
document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tech-tab-btn");
  const categories = document.querySelectorAll(".tech-category");

  // 첫 번째 카테고리를 기본으로 활성화
  if (categories.length > 0) {
    categories[0].classList.add("active");
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedTab = btn.getAttribute("data-tab");

      // 모든 탭과 카테고리 비활성화
      tabBtns.forEach(b => b.classList.remove("active"));
      categories.forEach(c => c.classList.remove("active"));

      // 선택된 탭과 카테고리 활성화
      btn.classList.add("active");
      const selectedCategory = document.querySelector(
        `.tech-category[data-category="${selectedTab}"]`
      );
      if (selectedCategory) {
        selectedCategory.classList.add("active");
      }
    });
  });
});

// Experience Section horizontal scroll synced with vertical wheel
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("experience");
  const track = section?.querySelector(".exp-list");
  const cards = track ? Array.from(track.querySelectorAll(".exp-item")) : [];

  if (!section || !track || cards.length === 0) return;

  let current = 0;
  let animating = false;
  let lockedInSection = false;
  let lockEntryTime = null; // 락 진입 시간 기록

  const clamp = val => Math.max(0, Math.min(cards.length - 1, val));

  const updatePosition = () => {
    if (window.innerWidth < 960) {
      track.style.transform = "none";
      cards.forEach(card => card.classList.add("active"));
      return;
    }

    const gap = parseFloat(getComputedStyle(track).getPropertyValue("gap")) || 0;
    const cardWidth = cards[0].offsetWidth;
    const parentLeft = track.parentElement.getBoundingClientRect().left;
    const viewportCenter = window.innerWidth / 2;
    const cardOffset = current * (cardWidth + gap) + cardWidth / 2;
    const translateX = viewportCenter - parentLeft - cardOffset;
    track.style.transform = `translateX(${translateX}px)`;

    cards.forEach((card, idx) => {
      card.classList.toggle("active", idx === current);
    });
  };

  const move = direction => {
    const next = clamp(current + direction);
    if (next === current) return false;
    current = next;
    updatePosition();
    return true;
  };

  const isSectionVisible = () => {
    const rect = section.getBoundingClientRect();
    const centerY = window.innerHeight / 2;
    return rect.top < centerY && rect.bottom > centerY;
  };

  const onWheel = e => {
    if (window.innerWidth < 960) return;

    const delta = e.deltaY || e.deltaX;
    if (Math.abs(delta) < 3) return;
    const dir = delta > 0 ? 1 : -1;

    // 경험 섹션이 화면 중앙에 있을 때만 락 진입
    if (isSectionVisible()) {
      if (!lockedInSection) {
        lockedInSection = true;
        lockEntryTime = Date.now(); // 진입 시간 기록
      }
    } else {
      // 섹션이 중앙에서 벗어나면 락 해제
      lockedInSection = false;
      lockEntryTime = null;
    }

    // 락이 걸려있지 않으면 일반 스크롤
    if (!lockedInSection) return;

    // 진입 후 200ms 이내면 스크롤 무시 (안정화 대기)
    const timeSinceLock = Date.now() - lockEntryTime;
    if (timeSinceLock < 200) {
      e.preventDefault();
      return;
    }

    // 첫/마지막 카드에서 외부로 나가려는 방향이면 락 해제 후 기본 스크롤 허용
    if ((current === 0 && dir < 0) || (current === cards.length - 1 && dir > 0)) {
      lockedInSection = false;
      lockEntryTime = null;
      return;
    }

    // 내부 카드 이동 시에만 스크롤 막음
    e.preventDefault();
    if (animating) return;

    const moved = move(dir);
    if (moved) {
      animating = true;
      setTimeout(() => { animating = false; }, 450);
    }
  };

  const onResize = () => {
    current = clamp(current);
    updatePosition();
  };

  updatePosition();
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", onResize);
});
